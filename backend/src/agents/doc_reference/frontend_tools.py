"""Frontend Tools / Components as Tools — the backend half, as published.

Source: https://docs.copilotkit.ai/claude-sdk-python/frontend-tools
        https://docs.copilotkit.ai/claude-sdk-python/generative-ui/tool-based
        (both pages carry the same block, titled `agent.py`)

Copied verbatim. Nothing imports it — but unlike its siblings in this package,
that is not because the feature is broken. The `/frontend-tools`,
`/generative-ui/tool-based` and `/human-in-the-loop` routes all work.

The reason is that `ClaudeAgentAdapter` already does this. `build_options` in
`ag_ui_claude_sdk/adapter.py` reads `input_data.tools`, runs each definition
through `convert_agui_tool_to_claude_sdk`, packs the results into a
`create_sdk_mcp_server("ag_ui", ...)` server, and auto-grants
`mcp__ag_ui__<name>` in `allowed_tools`. The function below is the manual
equivalent for the direct Messages API path the page assumes you are on —
"Runs that carry frontend tools use the direct Messages API path rather than
the Claude Agent SDK", as the page puts it. On the adapter you need none of it.

Kept here so the two paths can be compared side by side on the route pages.
"""

from typing import Any

from ag_ui.core import RunAgentInput


def _build_frontend_tools(input_data: RunAgentInput) -> list[dict[str, Any]]:
    """Extract frontend-defined tools from the AG-UI request.

    The CopilotKit runtime forwards frontend tool definitions (registered
    via ``useFrontendTool``, ``useHumanInTheLoop``, etc.) in
    ``input_data.tools``. We convert them to the Anthropic ``tools``
    schema so the LLM can call them. The runtime intercepts the resulting
    tool-call events and routes them to the frontend for resolution.
    """
    out: list[dict[str, Any]] = []
    for t in input_data.tools or []:
        name = getattr(t, "name", None) or (
            t.get("name") if isinstance(t, dict) else None
        )
        description = getattr(t, "description", None) or (
            t.get("description", "") if isinstance(t, dict) else ""
        )
        parameters = getattr(t, "parameters", None) or (
            t.get("parameters", {}) if isinstance(t, dict) else {}
        )
        if not name:
            continue
        out.append(
            {
                "name": name,
                "description": description or "",
                "input_schema": parameters or {"type": "object", "properties": {}},
            }
        )
    return out
