"""Repo-authored bridge — NOT from any doc page.

The Tool Call Rendering page publishes `GET_WEATHER_TOOL` and `get_weather`
(see `doc_reference/tool_rendering.py`) and the Quickstart's
`run_with_claude_agent_sdk` hands them to a `_build_sdk_tools` helper that no
page defines. This file is the smallest thing that does that job with the
Claude Agent SDK's own primitives:

  - `tool()` + `create_sdk_mcp_server()` build an in-process MCP server.
    `tool()` accepts a JSON Schema dict directly, so the snippet's
    `input_schema` goes through untranslated.
  - `ClaudeAgentAdapter` accepts every `ClaudeAgentOptions` key, so the
    server goes in via `mcp_servers` and the adapter merges it alongside its
    own `ag_ui` server rather than replacing it.
  - Permission is by prefixed name (`mcp__<server>__<tool>`), and the agent
    runs with `permission_mode: "dontAsk"`, so the tool must also be listed
    in `allowed_tools` or the call is denied silently.

The adapter strips the `mcp__weather__` prefix before emitting tool-call
events, so the frontend's `useRenderTool({ name: "get_weather" })` matches
unchanged. README §9.1 records that this is a repo bridge, not doc code.
"""

from __future__ import annotations

import json
from typing import Any

from claude_agent_sdk import create_sdk_mcp_server, tool

from agents.doc_reference.tool_rendering import GET_WEATHER_TOOL, get_weather

WEATHER_MCP_SERVER_NAME = "weather"


@tool(
    GET_WEATHER_TOOL["name"],
    GET_WEATHER_TOOL["description"],
    GET_WEATHER_TOOL["input_schema"],
)
async def _get_weather_tool(args: dict[str, Any]) -> dict[str, Any]:
    """MCP wrapper: unpack the call's args, run the doc's handler, return text."""
    result = get_weather(args["location"])
    return {"content": [{"type": "text", "text": json.dumps(result)}]}


weather_mcp_server = create_sdk_mcp_server(
    name=WEATHER_MCP_SERVER_NAME,
    version="1.0.0",
    tools=[_get_weather_tool],
)

WEATHER_ALLOWED_TOOLS = [
    f"mcp__{WEATHER_MCP_SERVER_NAME}__{GET_WEATHER_TOOL['name']}",
]
