"""The Quickstart's adapter, one instance per doc route.

The Quickstart builds exactly one `ClaudeAgentAdapter` at module scope and
explains why: the adapter caches a worker (and its Claude SDK subprocess) per
thread, so building one per request leaks both. This harness needs one
conversation per doc route rather than one per request, so it builds one
adapter per route — still at module scope, still one per process.

`build_adapter` is the Quickstart's `options` dict with the values that
actually vary between routes (`name`, `system_prompt`, and for the routes
that carry a backend tool, `mcp_servers` / `allowed_tools`) lifted into
arguments. Everything else — model from `ANTHROPIC_MODEL`, empty `tools`,
`dontAsk`, `max_turns: 10` — is the Quickstart's, unchanged.

  https://docs.copilotkit.ai/claude-sdk-python/quickstart?agent=bring-your-own
"""

from __future__ import annotations

import os
from typing import Any

from ag_ui_claude_sdk import ClaudeAgentAdapter

#: The Quickstart's default, used whenever `ANTHROPIC_MODEL` is unset.
DEFAULT_ANTHROPIC_MODEL = "claude-opus-4-8"

#: The Quickstart's system prompt, used by every route that does not need
#: something more specific.
DEFAULT_SYSTEM_PROMPT = "You are a helpful assistant embedded in a CopilotKit app."


#region build-adapter
def build_adapter(
    name: str,
    system_prompt: str = DEFAULT_SYSTEM_PROMPT,
    *,
    max_thinking_tokens: int | None = None,
    mcp_servers: dict[str, Any] | None = None,
    allowed_tools: list[str] | None = None,
) -> ClaudeAgentAdapter:
    """One Quickstart adapter, named and prompted for a single route.

    `tools` stays `[]` exactly as the Quickstart leaves it. Frontend tools do
    not go there — the adapter reads those off `input_data.tools` on each run
    and builds its own MCP server for them, so `useFrontendTool`,
    `useComponent` and `useHumanInTheLoop` all work with `tools: []`.

    Backend tools do not go there either. No doc page shows how to register
    one against the adapter, so the routes that need one use a repo-authored
    bridge (`weather_mcp_server.py`, `flights_mcp_server.py`): an in-process MCP server from
    `create_sdk_mcp_server`, passed through `mcp_servers`, plus the prefixed
    `mcp__<server>__<tool>` names in `allowed_tools` so `dontAsk` does not
    silently deny them. The adapter merges these with its own `ag_ui` server.

    `max_thinking_tokens` is used only on the two reasoning routes. It is a
    stock `ClaudeAgentOptions` field; setting it makes Claude emit thinking
    blocks, which the adapter turns into the AG-UI REASONING_MESSAGE_* events
    those pages are about.
    """
    options: dict[str, object] = {
        "model": os.getenv("ANTHROPIC_MODEL", DEFAULT_ANTHROPIC_MODEL),
        "system_prompt": system_prompt,
        "tools": [],
        "permission_mode": "dontAsk",
        "max_turns": 10,
    }
    if max_thinking_tokens is not None:
        options["max_thinking_tokens"] = max_thinking_tokens
    if mcp_servers:
        options["mcp_servers"] = mcp_servers
    if allowed_tools:
        options["allowed_tools"] = allowed_tools

    return ClaudeAgentAdapter(name=name, options=options)
#endregion


#: Budget for the two reasoning routes. Extended thinking has to be given room
#: before Claude will emit a thinking block at all.
REASONING_THINKING_TOKENS = 2048
