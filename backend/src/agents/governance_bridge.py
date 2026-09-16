"""Governed Action Approval — the AG-UI half. Repo-authored, NOT doc code.

`ClaudeAgentAdapter` has no notion of an AG-UI interrupt: it never emits
`RUN_FINISHED` with `outcome.type == "interrupt"`, and it ignores the `resume`
array on the next run (it forwards only the *last message's text* to Claude,
so a bare resume run would re-send whatever the assistant last said as if the
user had typed it).

The Governed Actions page's `useInterrupt` pattern needs both, so these two
wrappers sit between `agent_server._mount` and `adapter.run`:

  `run_with_interrupts`  (agent `governed-actions-interrupt`)
    - Before the run: answers any `resume` entries against the governance
      store, runs approved actions, and appends one short note so Claude
      learns the outcome. The note is filtered back out of the RUN_STARTED
      echo and the MESSAGES_SNAPSHOT, so it never shows up in the chat as a
      user bubble.
    - During the run: watches TOOL_CALL_RESULT for actions the policy queued.
    - At the end: swaps the adapter's plain RUN_FINISHED for one carrying an
      interrupt per queued action, with the envelope at `metadata.action` —
      exactly where the page's `useInterrupt` render reads it.

  `run_with_tool_approvals`  (agent `governed-actions-hitl`)
    - Before the run: reads `approve_governed_action` tool results out of the
      message history and records them as decisions. That is what
      `execute_governed_action` later checks, so the model cannot approve its
      own action by claiming the user did.
"""

from __future__ import annotations

import json
import logging
import uuid
from collections.abc import AsyncIterator
from typing import Any

from ag_ui.core import (
    BaseEvent,
    EventType,
    Interrupt,
    MessagesSnapshotEvent,
    RunAgentInput,
    RunFinishedEvent,
    UserMessage,
)
from ag_ui.core.events import RunFinishedInterruptOutcome
from ag_ui_claude_sdk import ClaudeAgentAdapter

from agents.governance import APPROVAL_FRONTEND_TOOL, STORE, handle_approval

logger = logging.getLogger("claude_agent.governance")

INTERRUPT_REASON = "governed_action"
_INTERRUPT_PREFIX = "governed-"


def _interrupt_id(action_id: str) -> str:
    return f"{_INTERRUPT_PREFIX}{action_id}"


def _field(obj: Any, *names: str) -> Any:
    """Read a field off a pydantic model or a plain dict, trying each spelling."""
    for name in names:
        if isinstance(obj, dict) and name in obj:
            return obj[name]
        if hasattr(obj, name):
            return getattr(obj, name)
    return None


# ---------------------------------------------------------------------------
# Interrupt path
# ---------------------------------------------------------------------------


#region resume
def _apply_resume(input_data: RunAgentInput) -> list[str]:
    """Turn each resume entry into a stored decision, then act on it."""
    notes: list[str] = []
    for entry in input_data.resume or []:
        interrupt_id = entry.interrupt_id
        if not interrupt_id.startswith(_INTERRUPT_PREFIX):
            continue
        action_id = interrupt_id[len(_INTERRUPT_PREFIX):]
        record = STORE.actions.get(action_id)
        if record is None:
            notes.append(f"Unknown governed action {action_id}; nothing was run.")
            continue
        action = record.envelope
        payload = entry.payload if isinstance(entry.payload, dict) else {}

        if entry.status == "cancelled":
            STORE.record_decision(action_id, action["reference"], False, cancelled=True, source="useInterrupt cancel()")
        else:
            # The page's handleApproval condition: approved AND the response
            # names this exact action. A mismatched id is treated as a reject.
            matches = payload.get("actionId") == action_id
            STORE.record_decision(
                action_id,
                str(payload.get("reference", "")),
                bool(payload.get("approved")) and matches,
                source="useInterrupt resolve()",
            )

        outcome = handle_approval(action_id, action["reference"])
        notes.append(f"{action['reference']} ({action['tool']}): {json.dumps(outcome)}")
    return notes
#endregion


#region interrupt-stream
async def run_with_interrupts(
    adapter: ClaudeAgentAdapter, input_data: RunAgentInput
) -> AsyncIterator[BaseEvent]:
    note_id: str | None = None
    if input_data.resume:
        notes = _apply_resume(input_data)
        note_id = f"governance-{uuid.uuid4().hex}"
        note = UserMessage(
            id=note_id,
            role="user",
            content=(
                "[Governance update — not typed by the user] The approval step for your "
                "pending action finished:\n" + "\n".join(notes) + "\n"
                "Tell the user the outcome in one or two short sentences. "
                "Do not request the same action again."
            ),
        )
        input_data = input_data.model_copy(
            update={"messages": [*input_data.messages, note], "resume": None}
        )

    queued: list[str] = []
    async for event in adapter.run(input_data):
        if event.type == EventType.TOOL_CALL_RESULT:
            queued.extend(_queued_action_ids(getattr(event, "content", "")))

        elif event.type == EventType.RUN_STARTED and note_id and event.input is not None:
            # The AG-UI client appends any unseen message in this echo to the
            # chat, so the note has to leave here too, not just the snapshot.
            event = event.model_copy(update={"input": _without_message(event.input, note_id)})

        elif event.type == EventType.MESSAGES_SNAPSHOT and note_id:
            event = MessagesSnapshotEvent(
                type=EventType.MESSAGES_SNAPSHOT,
                messages=[m for m in event.messages if getattr(m, "id", None) != note_id],
            )

        elif event.type == EventType.RUN_FINISHED and queued:
            interrupts = [
                Interrupt(
                    id=_interrupt_id(action_id),
                    reason=INTERRUPT_REASON,
                    message=STORE.actions[action_id].envelope["summary"],
                    metadata={"action": STORE.actions[action_id].envelope},
                )
                for action_id in dict.fromkeys(queued)
            ]
            logger.info("Pausing run on %d governed action(s)", len(interrupts))
            event = RunFinishedEvent(
                type=EventType.RUN_FINISHED,
                thread_id=event.thread_id,
                run_id=event.run_id,
                result=event.result,
                outcome=RunFinishedInterruptOutcome(interrupts=interrupts),
            )

        yield event
#endregion


def _without_message(run_input: Any, message_id: str) -> Any:
    """`run_input` with one message removed; it arrives as a model or a dict."""
    messages = _field(run_input, "messages") or []
    kept = [m for m in messages if _field(m, "id") != message_id]
    if isinstance(run_input, dict):
        return {**run_input, "messages": kept}
    return run_input.model_copy(update={"messages": kept})


def _queued_action_ids(content: str) -> list[str]:
    try:
        payload = json.loads(content)
    except (TypeError, json.JSONDecodeError):
        return []
    if not isinstance(payload, dict) or payload.get("status") != "awaiting_user_approval":
        return []
    action_id = (payload.get("action") or {}).get("id")
    record = STORE.actions.get(action_id) if action_id else None
    return [action_id] if record and record.status == "pending" else []


# ---------------------------------------------------------------------------
# Tool path
# ---------------------------------------------------------------------------


#region tool-approvals
def _record_tool_approvals(input_data: RunAgentInput) -> None:
    approval_calls: set[str] = set()
    for message in input_data.messages:
        for call in _field(message, "tool_calls", "toolCalls") or []:
            function = _field(call, "function")
            if _field(function, "name") == APPROVAL_FRONTEND_TOOL:
                approval_calls.add(_field(call, "id"))

    for message in input_data.messages:
        if _field(message, "role") != "tool":
            continue
        if _field(message, "tool_call_id", "toolCallId") not in approval_calls:
            continue
        try:
            response = json.loads(_field(message, "content") or "")
        except json.JSONDecodeError:
            continue
        if not isinstance(response, dict) or not response.get("actionId"):
            continue
        STORE.record_decision(
            str(response["actionId"]),
            str(response.get("reference", "")),
            bool(response.get("approved")),
            source=f"{APPROVAL_FRONTEND_TOOL} tool result",
        )


async def run_with_tool_approvals(
    adapter: ClaudeAgentAdapter, input_data: RunAgentInput
) -> AsyncIterator[BaseEvent]:
    _record_tool_approvals(input_data)
    async for event in adapter.run(input_data):
        yield event
#endregion
