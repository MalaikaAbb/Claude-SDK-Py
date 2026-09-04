"""Repo-authored bridge — NOT from any doc page.

The Fixed Schema A2UI page publishes `DISPLAY_FLIGHT_TOOL` and
`_display_flight_operations` (see `doc_reference/a2ui_fixed.py`) and turns
the runtime's A2UI tool injection off, so the agent must own
`display_flight`. The page never shows how to hand that tool to
`ClaudeAgentAdapter`. This file does it with the Claude Agent SDK's own
primitives, the same way `weather_mcp_server.py` does for `get_weather`:

  - `tool()` + `create_sdk_mcp_server()` build an in-process MCP server;
    the published JSON `input_schema` goes through untranslated.
  - The handler returns the published `a2ui_operations` payload as one JSON
    text block. The adapter emits that text as the AG-UI `TOOL_CALL_RESULT`
    content, and the runtime's A2UI middleware parses tool results for an
    `a2ui_operations` array, so the fixed-schema surface mounts with no
    further plumbing.
  - The tool must be granted as `mcp__flights__display_flight` because the
    agent runs with `permission_mode: "dontAsk"`.

README §9.1 records that this is a repo bridge, not doc code.
"""

from __future__ import annotations

import json
from typing import Any

from claude_agent_sdk import create_sdk_mcp_server, tool

from agents.doc_reference.a2ui_fixed import (
    DISPLAY_FLIGHT_TOOL,
    _display_flight_operations,
)

FLIGHTS_MCP_SERVER_NAME = "flights"


@tool(
    DISPLAY_FLIGHT_TOOL["name"],
    DISPLAY_FLIGHT_TOOL["description"],
    DISPLAY_FLIGHT_TOOL["input_schema"],
)
async def _display_flight_tool(args: dict[str, Any]) -> dict[str, Any]:
    """MCP wrapper: unpack the call's args and return the operations container."""
    operations = _display_flight_operations(
        origin=args["origin"],
        destination=args["destination"],
        airline=args["airline"],
        price=args["price"],
    )
    return {"content": [{"type": "text", "text": json.dumps(operations)}]}


display_flight_mcp_server = create_sdk_mcp_server(
    name=FLIGHTS_MCP_SERVER_NAME,
    version="1.0.0",
    tools=[_display_flight_tool],
)

DISPLAY_FLIGHT_ALLOWED_TOOLS = [
    f"mcp__{FLIGHTS_MCP_SERVER_NAME}__{DISPLAY_FLIGHT_TOOL['name']}",
]
