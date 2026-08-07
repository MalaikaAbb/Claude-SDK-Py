"""The Quickstart's backend tool bridge, as published — the central gap.

Source: https://docs.copilotkit.ai/claude-sdk-python/quickstart
        (section "Backend tools and state", block titled
        `claude_agent_sdk_adapter.py`)

Copied verbatim. Nothing imports it, and it could not be imported: the excerpt
below is the whole of what is published, and it opens by calling six names the
docs never define.

    _build_sdk_tools ................ builds the SdkMcpTool list from AG-UI
                                      tool schemas. Never shown.
    _set_state ...................... writes a tool's state mutation into the
                                      box and queues a snapshot. Never shown.
    _normalize_claude_agent_sdk_model  maps a model alias to an SDK model id.
                                      Never shown. (`normalize_claude_model`,
                                      imported from this same module name by
                                      the Reasoning Messages and Sub-Agents
                                      pages, is never shown either.)
    _with_initial_state ............. injects the starting state into the run
                                      input. Never shown.
    COPILOTKIT_MCP_SERVER_NAME ...... the MCP server name. Never shown.
    COPILOTKIT_TOOL_PREFIX .......... the `mcp__<server>__` prefix used to
                                      build `allowed_tools`. Never shown.
    ExecuteTool ..................... the `execute_tool` callable's type.
                                      Never shown.

Nor are the imports: `EventEncoder`, `create_sdk_mcp_server`,
`ClaudeAgentAdapter`, `EventType`, `StateSnapshotEvent` and `RunAgentInput` all
appear without an import block.

This is what stops the five `broken` routes in this harness from working. Every
one of them publishes a backend tool schema and a handler; this function is the
only published thing that would carry either to the model.

Worth knowing while reading it: `ClaudeAgentAdapter` already performs the
`create_sdk_mcp_server` step internally for *frontend* tools and for state, in
`build_options`. What has no equivalent — and what this excerpt is really
about — is registering a tool the **backend** owns and executes.
"""

# ruff: noqa
# fmt: off


async def run_with_claude_agent_sdk(
    input_data: RunAgentInput,
    *,
    system_prompt: str,
    tools: list[dict[str, Any]],
    state: Any,
    model: str,
    execute_tool: ExecuteTool,
    max_turns: int = 10,
) -> AsyncIterator[str]:
    """Run through the official AG-UI Claude adapter and emit SSE chunks."""

    encoder = EventEncoder()
    state_box = {"state": state}
    pending_state_snapshots: list[Any] = []
    sdk_tools = _build_sdk_tools(
        tools,
        execute_tool=execute_tool,
        get_state=lambda: state_box["state"],
        set_state=lambda next_state: _set_state(
            next_state,
            state_box,
            pending_state_snapshots,
        ),
    )

    options: dict[str, Any] = {
        "model": _normalize_claude_agent_sdk_model(model),
        "system_prompt": system_prompt,
        "tools": [],
        "permission_mode": "dontAsk",
        "max_turns": max_turns,
    }

    if sdk_tools:
        options["mcp_servers"] = {
            COPILOTKIT_MCP_SERVER_NAME: create_sdk_mcp_server(
                COPILOTKIT_MCP_SERVER_NAME,
                "1.0.0",
                tools=sdk_tools,
            )
        }
        options["allowed_tools"] = [
            f"{COPILOTKIT_TOOL_PREFIX}{schema['name']}" for schema in tools
        ]

    adapter = ClaudeAgentAdapter(
        name="claude-sdk-python",
        options=options,
    )
    run_input = _with_initial_state(input_data, state)

    async for event in adapter.run(run_input):
        if event.type == EventType.TOOL_CALL_RESULT and pending_state_snapshots:
            yield encoder.encode(
                StateSnapshotEvent(
                    type=EventType.STATE_SNAPSHOT,
                    snapshot=pending_state_snapshots.pop(0),
                )
            )
        yield encoder.encode(event)
