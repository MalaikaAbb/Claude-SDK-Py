"""DISABLED — kept for reference, not wired to anything.

This module registered the Shared State page's own `set_notes` as a real
backend tool on `ClaudeAgentAdapter` and mirrored its calls into shared state.
It worked, but the integration was backed out: the adapter is left exactly as
the Quickstart publishes it, and `/shared-state` goes back to the
`ag_ui_update_state` substitute described in `prompts.py`.

Nothing imports this file. The whole body below is commented out so it cannot
be picked up by accident. What it recorded, in case it is ever revived:

  * `build_options` merges a caller-supplied `mcp_servers` entry in *beside*
    the adapter's own `ag_ui` server instead of overwriting the key, and
    extends `allowed_tools` rather than replacing it. So a backend tool CAN be
    registered through the Quickstart's options dict — the docs simply never
    show it, and `tools: []` stays correct either way.
  * Registration alone is not enough. The adapter treats only
    `ag_ui_update_state` as a state write; every other tool is emitted as a
    plain TOOL_CALL_START/ARGS/END triple that never reaches `agent.state`.
    `bridge_state_writes` closed that gap at the AG-UI event layer.

Known defect in the code below, if it is revived: the third argument to
`@tool(...)` is `_SET_NOTES_TOOL`, the full Anthropic tool envelope. The
decorator wants the JSON Schema alone, so Claude would see parameters named
`name` / `description` / `input_schema` and no `notes`. Pass
`_SET_NOTES_TOOL["input_schema"]` instead.
"""

# from __future__ import annotations

# import json
# import logging
# from collections.abc import AsyncIterator, Iterable
# from typing import Any

# from ag_ui.core import BaseEvent, CustomEvent, EventType, StateSnapshotEvent
# from claude_agent_sdk import create_sdk_mcp_server, tool

# logger = logging.getLogger(__name__)

# #: MCP server that carries this repo's backend tools. Distinct from the
# #: adapter's own `ag_ui` server so the two merge instead of colliding.
# NOTES_MCP_SERVER_NAME = "notes"

# SET_NOTES_TOOL_NAME = "set_notes"

# #: How the name reaches `allowed_tools`. The adapter grants its own tools with
# #: the same `mcp__<server>__<tool>` shape.
# SET_NOTES_QUALIFIED_NAME = f"mcp__{NOTES_MCP_SERVER_NAME}__{SET_NOTES_TOOL_NAME}"


# _SET_NOTES_DESCRIPTION = (
#     "Replace the notes array in shared state with the FULL updated "
#     "list. Always include every existing note plus any new ones, "
#     "not a diff. Keep each note short (< 120 chars)."
# )

# _SET_NOTES_TOOL: dict[str, Any] = {
#     "name": "set_notes",
#     "description": (
#         "Replace the notes array in shared state with the FULL updated "
#         "list. Always include every existing note plus any new ones, "
#         "not a diff. Keep each note short (< 120 chars)."
#     ),
#     "input_schema": {
#         "type": "object",
#         "properties": {
#             "notes": {
#                 "type": "array",
#                 "items": {"type": "string"},
#                 "description": "Full list of short note strings to persist.",
#             },
#         },
#         "required": ["notes"],
#     },
# }


# @tool(SET_NOTES_TOOL_NAME, _SET_NOTES_DESCRIPTION, _SET_NOTES_TOOL)
# async def _set_notes(args: dict[str, Any]) -> dict[str, Any]:
#     """Acknowledge the write; `bridge_state_writes` is what moves it to state.

#     The handler stays a no-op on purpose. It runs in this process, but it has
#     no route to the AG-UI event stream from in here — the Claude SDK owns the
#     call and only hands back a tool result. Returning a confirmation keeps the
#     model's turn moving; the snapshot is emitted from the event stream instead.
#     """
#     notes = [str(note) for note in (args.get("notes") or [])]
#     return {
#         "content": [
#             {"type": "text", "text": f"Saved {len(notes)} note(s) to shared state."}
#         ]
#     }


# def build_notes_mcp_server() -> Any:
#     """One in-process MCP server holding `set_notes`."""
#     return create_sdk_mcp_server(NOTES_MCP_SERVER_NAME, "1.0.0", tools=[_set_notes])


# #region state-bridge
# async def bridge_state_writes(
#     events: AsyncIterator[BaseEvent],
#     initial_state: Any,
#     tool_names: Iterable[str],
# ) -> AsyncIterator[BaseEvent]:
#     """Mirror named backend tool calls into STATE_SNAPSHOT events.

#     Wraps `adapter.run(...)`. Every event passes through untouched; when a
#     watched tool call closes, its arguments are merged over the running state
#     as a shallow patch and a snapshot is appended. `set_notes({"notes": [...]})`
#     therefore lands as `{**state, "notes": [...]}` — the same merge semantics
#     the adapter applies to `ag_ui_update_state`, so the two writers agree.

#     Args:
#         events: The adapter's event stream.
#         initial_state: `input_data.state` for this run. The frontend is the
#             source of truth per turn (the adapter replaces its per-thread copy
#             with whatever arrives), so the running state starts here rather
#             than being carried across runs.
#         tool_names: Unprefixed tool names to watch. Both the streaming and
#             non-streaming paths emit `tool_call_name` with the `mcp__…__`
#             prefix already stripped.
#     """
#     watched = set(tool_names)
#     state: dict[str, Any] = dict(initial_state) if isinstance(initial_state, dict) else {}
#     # tool_call_id -> accumulated args JSON. Membership doubles as "this call is
#     # one we care about", so untracked tool calls cost nothing.
#     pending: dict[str, str] = {}

#     async for event in events:
#         yield event

#         event_type = getattr(event, "type", None)

#         if event_type == EventType.STATE_SNAPSHOT:
#             # The adapter's own writer (`ag_ui_update_state`) ran. Adopt its
#             # snapshot so a later patch from us merges onto current state
#             # instead of resurrecting values it just replaced.
#             if isinstance(event.snapshot, dict):
#                 state = dict(event.snapshot)

#         elif event_type == EventType.TOOL_CALL_START:
#             if event.tool_call_name in watched:
#                 pending[event.tool_call_id] = ""

#         elif event_type == EventType.TOOL_CALL_ARGS:
#             if event.tool_call_id in pending:
#                 pending[event.tool_call_id] += event.delta

#         elif event_type == EventType.TOOL_CALL_END:
#             raw = pending.pop(event.tool_call_id, None)
#             if raw is None:
#                 continue

#             try:
#                 patch = json.loads(raw) if raw.strip() else {}
#             except json.JSONDecodeError as error:
#                 # Mirror the adapter's behaviour on unparseable tool JSON: report
#                 # it and leave state alone rather than emitting a half-merged
#                 # snapshot.
#                 logger.warning("Could not parse %s arguments: %s", event.tool_call_id, error)
#                 yield CustomEvent(
#                     type=EventType.CUSTOM,
#                     name="state_update_error",
#                     value={"error": str(error)},
#                 )
#                 continue

#             if not isinstance(patch, dict):
#                 logger.warning("Ignoring non-object state patch: %r", patch)
#                 continue

#             merged = {**state, **patch}
#             if merged == state:
#                 # No-op writes get no snapshot, matching the adapter.
#                 continue

#             state = merged
#             yield StateSnapshotEvent(
#                 type=EventType.STATE_SNAPSHOT,
#                 snapshot=state,
#             )
# #endregion
