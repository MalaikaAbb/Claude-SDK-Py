"""Governed Action Approval — the server half. Repo-authored, NOT doc code.

Source page: https://docs.copilotkit.ai/claude-sdk-python/human-in-the-loop/governed-actions

The page publishes the frontend (a `GovernedAction` envelope, a card, and two
ways to show it: `useInterrupt` and `useHumanInTheLoop`) plus a four-line
TypeScript `handleApproval`. It publishes no Python, and none of its
guardrails come with code: "check policy on the server", "stable id and
reference", "treat deny as terminal", "log proposal, verdict, decision and
result". This module is those guardrails written out for this backend.

What lives here:

  - `evaluate_policy` — the server-side verdict. The model never picks a
    verdict; the model names a tool and its arguments, and this decides.
  - `GovernanceStore` — every proposed action keyed by a server-minted `id`
    plus a human `reference`. Decisions are one-shot: once an action is
    decided, a later decision for it is ignored, and a denied action can
    never run.
  - `handle_approval` — the page's `handleApproval`, ported: run the side
    effect only when the response approves *and* its `actionId`/`reference`
    match the stored action.
  - An audit log of proposal → verdict → decision → result, served at
    `GET /governance/audit` so the demo can show it.
  - Two in-process MCP servers, one per frontend pattern:

      interrupt path (`useInterrupt`)
        `request_governed_action` — evaluates, runs `allow` at once, refuses
        `deny`, and queues `require_approval`. `agent_server.py` turns a
        queued action into an AG-UI interrupt on `RUN_FINISHED`, and turns the
        `resume` entry the browser sends back into a decision.

      tool path (`useHumanInTheLoop`)
        `evaluate_governed_action` — evaluates only and returns the envelope
        the model forwards to the browser's `approve_governed_action` tool.
        `execute_governed_action` — runs the action, but only against a
        decision `agent_server.py` read from that tool's result message. The
        model's own word that the user approved counts for nothing.

The side effects are mocks (an in-memory outbox). The point of the route is
the gate in front of them, not the email.
"""

from __future__ import annotations

import itertools
import json
import threading
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Literal

from claude_agent_sdk import create_sdk_mcp_server, tool

Verdict = Literal["allow", "deny", "require_approval"]
Status = Literal[
    "pending",  # require_approval, waiting on the user
    "approved",  # user approved, not yet executed (tool path only)
    "rejected",  # user rejected
    "cancelled",  # user blocked the card (interrupt cancel)
    "denied",  # policy denied — terminal
    "executed",  # the side effect ran
]

#: Mail to this domain is internal and runs without asking.
INTERNAL_EMAIL_DOMAIN = "acme.test"

#: The side-effecting tools the agent may *propose*. None of them is exposed to
#: the model directly — it can only reach them through the governance tools.
GOVERNED_TOOLS: dict[str, dict[str, Any]] = {
    "send_email": {
        "description": "Send an email.",
        "arguments": {"to": "address", "subject": "string", "body": "string"},
    },
    "apply_discount": {
        "description": "Apply a percentage discount to a customer's next invoice.",
        "arguments": {"customer": "string", "percent": "number"},
    },
    "create_ticket": {
        "description": "Open a support ticket.",
        "arguments": {"title": "string", "priority": "low | normal | high"},
    },
    "delete_customer_record": {
        "description": "Permanently delete a customer record.",
        "arguments": {"customer_id": "string"},
    },
}


def _now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


# ---------------------------------------------------------------------------
# Policy
# ---------------------------------------------------------------------------


#region policy
def evaluate_policy(tool_name: str, arguments: dict[str, Any]) -> tuple[Verdict, str]:
    """The server's verdict for one proposed action, with the rule that fired."""
    if tool_name not in GOVERNED_TOOLS:
        return "deny", f"'{tool_name}' is not a governed tool this agent may use."

    if tool_name == "create_ticket":
        return "allow", "Opening a ticket is internal and reversible."

    if tool_name == "send_email":
        to = str(arguments.get("to", "")).strip().lower()
        if to.endswith(f"@{INTERNAL_EMAIL_DOMAIN}"):
            return "allow", f"Internal mail (@{INTERNAL_EMAIL_DOMAIN}) is allowed."
        return "require_approval", "Mail leaving the company needs a person to approve it."

    if tool_name == "apply_discount":
        try:
            percent = float(arguments.get("percent", 0))
        except (TypeError, ValueError):
            return "deny", "The discount percent is not a number."
        if percent <= 10:
            return "allow", "Discounts up to 10% are pre-approved."
        if percent <= 30:
            return "require_approval", "Discounts over 10% need approval."
        return "deny", "Discounts over 30% are never allowed."

    # delete_customer_record
    return "deny", "Deleting customer records is blocked for agents."
#endregion


# ---------------------------------------------------------------------------
# Mock side effects
# ---------------------------------------------------------------------------


def execute_side_effect(tool_name: str, arguments: dict[str, Any]) -> dict[str, Any]:
    """Stand-in for the real write API. Records the effect and returns a receipt."""
    receipt = {
        "tool": tool_name,
        "arguments": arguments,
        "executedAt": _now(),
        "receipt": f"{tool_name}-{uuid.uuid4().hex[:8]}",
    }
    STORE.outbox.append(receipt)
    return receipt


# ---------------------------------------------------------------------------
# Store + audit log
# ---------------------------------------------------------------------------


@dataclass
class ActionRecord:
    envelope: dict[str, Any]
    reason: str
    status: Status
    result: dict[str, Any] | None = None


@dataclass
class GovernanceStore:
    actions: dict[str, ActionRecord] = field(default_factory=dict)
    audit: list[dict[str, Any]] = field(default_factory=list)
    outbox: list[dict[str, Any]] = field(default_factory=list)
    _lock: threading.Lock = field(default_factory=threading.Lock)
    _refs: itertools.count = field(default_factory=lambda: itertools.count(1001))

    def log(self, action: dict[str, Any], stage: str, detail: str) -> None:
        self.audit.append(
            {
                "at": _now(),
                "actionId": action["id"],
                "reference": action["reference"],
                "tool": action["tool"],
                "stage": stage,
                "detail": detail,
            }
        )

    #region propose
    def propose(self, tool_name: str, arguments: dict[str, Any], summary: str) -> ActionRecord:
        """Mint an id and reference, evaluate policy, and log both."""
        verdict, reason = evaluate_policy(tool_name, arguments)
        with self._lock:
            envelope = {
                "id": uuid.uuid4().hex,
                "summary": summary,
                "tool": tool_name,
                "reference": f"GOV-{next(self._refs)}",
                "verdict": verdict,
                "arguments": arguments,
            }
            status: Status = {"allow": "approved", "deny": "denied"}.get(verdict, "pending")  # type: ignore[assignment]
            record = ActionRecord(envelope=envelope, reason=reason, status=status)
            self.actions[envelope["id"]] = record
        self.log(envelope, "proposed", summary)
        self.log(envelope, "verdict", f"{verdict} — {reason}")
        return record
    #endregion

    def record_decision(
        self, action_id: str, reference: str, approved: bool, *, cancelled: bool = False, source: str
    ) -> ActionRecord | None:
        """Store the user's answer once. Later answers for the same action are ignored."""
        record = self.actions.get(action_id)
        if record is None:
            return None
        if record.envelope["reference"] != reference:
            self.log(record.envelope, "rejected-input", f"reference mismatch from {source}: {reference!r}")
            return record
        if record.status != "pending":
            return record  # one-shot: replays and late callbacks change nothing
        record.status = "cancelled" if cancelled else ("approved" if approved else "rejected")
        self.log(record.envelope, "decision", f"{record.status} via {source}")
        return record

    def snapshot(self) -> dict[str, Any]:
        return {
            "actions": [
                {**r.envelope, "status": r.status, "reason": r.reason, "result": r.result}
                for r in self.actions.values()
            ],
            "audit": list(self.audit),
            "outbox": list(self.outbox),
        }


STORE = GovernanceStore()


# ---------------------------------------------------------------------------
# handleApproval, ported
# ---------------------------------------------------------------------------


#region handle-approval
def handle_approval(action_id: str, reference: str) -> dict[str, Any]:
    """Run an action only if the server holds a matching approval for it.

    The page's `handleApproval` compares the browser's response to the action.
    Here the response has already been folded into the store by
    `record_decision`, so this checks the stored state instead — which is what
    keeps the model from approving its own action by saying so.
    """
    record = STORE.actions.get(action_id)
    if record is None:
        return {"skipped": True, "reason": f"No governed action with id {action_id}."}
    action = record.envelope
    if action["reference"] != reference:
        STORE.log(action, "skipped", "reference mismatch")
        return {"skipped": True, "reason": "The reference does not match this action."}
    if record.status == "denied":
        STORE.log(action, "skipped", "denied actions are terminal")
        return {"skipped": True, "reason": f"Denied by policy: {record.reason} This is final."}
    if record.status == "executed":
        STORE.log(action, "skipped", "replay of an executed action")
        return {"skipped": True, "reason": "This action has already run.", "result": record.result}
    if record.status == "pending":
        return {"skipped": True, "reason": "No user decision is recorded for this action yet."}
    if record.status != "approved":
        STORE.log(action, "skipped", f"user {record.status} the action")
        return {"skipped": True, "reason": "The user did not approve this action."}

    record.result = execute_side_effect(action["tool"], action["arguments"])
    record.status = "executed"
    STORE.log(action, "executed", record.result["receipt"])
    return {"executed": True, "result": record.result}
#endregion


# ---------------------------------------------------------------------------
# MCP tools
# ---------------------------------------------------------------------------

_PROPOSAL_SCHEMA = {
    "type": "object",
    "properties": {
        "tool": {
            "type": "string",
            "enum": list(GOVERNED_TOOLS),
            "description": "The side-effecting tool to run.",
        },
        "arguments": {
            "type": "object",
            "description": "Arguments for that tool: "
            + "; ".join(f"{name} {spec['arguments']}" for name, spec in GOVERNED_TOOLS.items()),
        },
        "summary": {
            "type": "string",
            "description": "One plain sentence describing the action for the person approving it.",
        },
    },
    "required": ["tool", "arguments", "summary"],
}


def _text(payload: dict[str, Any]) -> dict[str, Any]:
    return {"content": [{"type": "text", "text": json.dumps(payload)}]}


def _proposal(args: dict[str, Any]) -> ActionRecord:
    arguments = args.get("arguments") or {}
    if isinstance(arguments, str):  # some models send the object as a JSON string
        try:
            arguments = json.loads(arguments)
        except json.JSONDecodeError:
            arguments = {"raw": arguments}
    return STORE.propose(str(args.get("tool", "")), arguments, str(args.get("summary", "")))


#region interrupt-tool
@tool(
    "request_governed_action",
    "Request a side-effecting action (send_email, apply_discount, create_ticket, "
    "delete_customer_record). Server policy decides whether it runs now, is "
    "blocked, or pauses for the user's approval.",
    _PROPOSAL_SCHEMA,
)
async def _request_governed_action(args: dict[str, Any]) -> dict[str, Any]:
    record = _proposal(args)
    action = record.envelope
    verdict = action["verdict"]

    if verdict == "allow":
        return _text({"verdict": verdict, "action": action, **handle_approval(action["id"], action["reference"])})

    if verdict == "deny":
        return _text(
            {
                "verdict": verdict,
                "action": action,
                "executed": False,
                "reason": record.reason,
                "instruction": "Denied by policy, and final. Do not retry it or work around it; "
                "tell the user why and suggest a safer alternative.",
            }
        )

    return _text(
        {
            "verdict": verdict,
            "action": action,
            "status": "awaiting_user_approval",
            "reason": record.reason,
            "instruction": "The run now pauses for the user's approval. Call no more tools; "
            "reply with one short sentence saying the action is waiting for approval.",
        }
    )
#endregion


#region hitl-tools
@tool(
    "evaluate_governed_action",
    "Evaluate a side-effecting action (send_email, apply_discount, create_ticket, "
    "delete_customer_record) against server policy WITHOUT running it. Returns the "
    "action envelope to pass to approve_governed_action.",
    _PROPOSAL_SCHEMA,
)
async def _evaluate_governed_action(args: dict[str, Any]) -> dict[str, Any]:
    record = _proposal(args)
    return _text({"action": record.envelope, "reason": record.reason})


@tool(
    "execute_governed_action",
    "Run a previously evaluated action. Only succeeds if the server has a matching "
    "approval (from approve_governed_action) or the policy allowed it.",
    {
        "type": "object",
        "properties": {
            "action_id": {"type": "string"},
            "reference": {"type": "string"},
        },
        "required": ["action_id", "reference"],
    },
)
async def _execute_governed_action(args: dict[str, Any]) -> dict[str, Any]:
    return _text(handle_approval(str(args.get("action_id", "")), str(args.get("reference", ""))))
#endregion


INTERRUPT_MCP_SERVER_NAME = "governance"
governance_interrupt_mcp_server = create_sdk_mcp_server(
    name=INTERRUPT_MCP_SERVER_NAME,
    version="1.0.0",
    tools=[_request_governed_action],
)
GOVERNANCE_INTERRUPT_ALLOWED_TOOLS = [f"mcp__{INTERRUPT_MCP_SERVER_NAME}__request_governed_action"]

HITL_MCP_SERVER_NAME = "governance"
governance_hitl_mcp_server = create_sdk_mcp_server(
    name=HITL_MCP_SERVER_NAME,
    version="1.0.0",
    tools=[_evaluate_governed_action, _execute_governed_action],
)
GOVERNANCE_HITL_ALLOWED_TOOLS = [
    f"mcp__{HITL_MCP_SERVER_NAME}__evaluate_governed_action",
    f"mcp__{HITL_MCP_SERVER_NAME}__execute_governed_action",
]

#: The browser tool name the tool path forwards envelopes to.
APPROVAL_FRONTEND_TOOL = "approve_governed_action"
