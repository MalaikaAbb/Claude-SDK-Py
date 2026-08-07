"""Published doc code that this backend cannot wire up.

Every module in here is copied from a docs.copilotkit.ai/claude-sdk-python page
as published. None of them is imported by `agent_server.py`, and that is the
point of the directory rather than an omission.

The reason is the same in every case. These pages publish a **backend** tool —
an Anthropic tool schema plus a Python handler — and no page in the framework
shows how to register a backend tool against `ClaudeAgentAdapter`, which is the
only complete server the docs give you. The Quickstart's "Backend tools and
state" section looks like the missing link, but its `run_with_claude_agent_sdk`
excerpt opens by calling six things it never defines:

    _build_sdk_tools   _set_state   _normalize_claude_agent_sdk_model
    _with_initial_state   COPILOTKIT_MCP_SERVER_NAME   COPILOTKIT_TOOL_PREFIX

...plus the `ExecuteTool` type. The surrounding prose says the tools reach the
model through `create_sdk_mcp_server`, so the shape is clear enough to guess
at, but guessing is not the job of a test harness: this repo reports what the
docs actually ship.

A second, related mismatch is worth naming. These snippets are not written
against `ClaudeAgentAdapter` at all — they are fragments of a hand-rolled
streaming loop over the raw Anthropic Messages API. The Frontend Tools page
says so outright: "Runs that carry frontend tools use the direct Messages API
path rather than the Claude Agent SDK." That loop is never published in full,
so there is no second server to drop these into either.

The frontend routes read these files off disk and display them next to their
doc links, so you can diff what is published against what runs. See README §9.
"""
