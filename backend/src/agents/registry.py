"""The single list of agents this server exposes.

One entry per doc route that needs a backend. The key is both the AG-UI agent
id the frontend addresses and the FastAPI path the agent is mounted at, so
`agentId="tool-rendering"` in a React component resolves to
`http://localhost:8000/tool-rendering` with nothing in between to keep in sync.

Ids follow the doc pages' own demo ids wherever a page names one
(`claude_agent`, `agentic_chat`, `frontend_tools`, `prebuilt-sidebar`, …),
which is why the casing is inconsistent — that inconsistency is the docs'.

Every entry is the Quickstart's adapter with a different name and prompt.
There is no per-agent tool configuration because the docs publish no way to
give the adapter a backend tool; the tool code those pages do publish sits
unwired in `agents/doc_reference/`, and that package's docstring explains why.
"""

from __future__ import annotations

from dataclasses import dataclass

from ag_ui_claude_sdk import ClaudeAgentAdapter

from agents import prompts
from agents.chat_agents import (
    DEFAULT_SYSTEM_PROMPT,
    REASONING_THINKING_TOKENS,
    build_adapter,
)


@dataclass(frozen=True)
class RegisteredAgent:
    """An adapter plus the doc page it backs."""

    adapter: ClaudeAgentAdapter
    doc: str


def _plain(agent_id: str, doc: str, prompt: str = DEFAULT_SYSTEM_PROMPT) -> RegisteredAgent:
    return RegisteredAgent(build_adapter(agent_id, prompt), doc)


#region registry
REGISTRY: dict[str, RegisteredAgent] = {
    # Getting started — the Quickstart's own agent name and prompt.
    "claude_agent": _plain("claude_agent", "/claude-sdk-python/quickstart"),

    # Prebuilt components — same adapter shape, one per surface so each route
    # gets its own conversation.
    "agentic_chat": _plain(
        "agentic_chat", "/claude-sdk-python/prebuilt-components/chat"
    ),
    "prebuilt-sidebar": _plain(
        "prebuilt-sidebar", "/claude-sdk-python/prebuilt-components/sidebar"
    ),
    "prebuilt-popup": _plain(
        "prebuilt-popup", "/claude-sdk-python/prebuilt-components/popup"
    ),
    "chat-controls": _plain(
        "chat-controls", "/claude-sdk-python/prebuilt-components/chat-controls"
    ),

    # Rich Threads — one agent per route so each keeps its own thread list.
    # Nothing thread-specific lives here: threads are stored by CopilotKit
    # Intelligence on the runtime side, and the agent only ever sees a
    # thread_id on the run input.
    "threads-drawer": _plain(
        "threads-drawer",
        "/claude-sdk-python/prebuilt-components/copilot-threads-drawer",
    ),
    "headless-threads": _plain(
        "headless-threads", "/claude-sdk-python/headless-threads"
    ),
    "threads-lifecycle": _plain(
        "threads-lifecycle", "/claude-sdk-python/threads-lifecycle"
    ),

    # Custom look and feel
    "chat-customization-css": _plain(
        "chat-customization-css", "/claude-sdk-python/custom-look-and-feel/css"
    ),
    "chat-slots": _plain(
        "chat-slots", "/claude-sdk-python/custom-look-and-feel/slots"
    ),
    "headless-simple": _plain(
        "headless-simple", "/claude-sdk-python/custom-look-and-feel/headless-ui"
    ),
    # No `headless-complete` agent: the Headless UI page covers two cells and
    # publishes neither in full, so this repo implements `headless-simple` only
    # and says so on the route.
    #
    # The two reasoning routes are the only ones that budget thinking tokens.
    # Without a budget Claude emits no thinking blocks, the adapter emits no
    # REASONING_MESSAGE_* events, and both pages have nothing to render.
    "reasoning-default": RegisteredAgent(
        build_adapter(
            "reasoning-default",
            prompts.NATIVE_REASONING_SYSTEM_PROMPT,
            max_thinking_tokens=REASONING_THINKING_TOKENS,
        ),
        "/claude-sdk-python/custom-look-and-feel/reasoning-messages",
    ),
    "reasoning-custom": RegisteredAgent(
        build_adapter(
            "reasoning-custom",
            prompts.NATIVE_REASONING_SYSTEM_PROMPT,
            max_thinking_tokens=REASONING_THINKING_TOKENS,
        ),
        "/claude-sdk-python/generative-ui/reasoning",
    ),

    # Input modalities
    "multimodal": _plain("multimodal", "/claude-sdk-python/multimodal-attachments"),
    # Mounted at /voice; the voice runtime route forwards `voice-demo` here.
    "voice": _plain("voice", "/claude-sdk-python/voice"),

    # Generative UI
    "tool-rendering": RegisteredAgent(
        build_adapter("tool-rendering", prompts.TOOL_RENDERING_SYSTEM_PROMPT),
        "/claude-sdk-python/generative-ui/tool-rendering",
    ),
    "gen-ui-tool-based": RegisteredAgent(
        build_adapter("gen-ui-tool-based", prompts.FRONTEND_TOOL_SYSTEM_PROMPT),
        "/claude-sdk-python/generative-ui/tool-based",
    ),
    "a2ui-fixed-schema": RegisteredAgent(
        build_adapter("a2ui-fixed-schema", prompts.A2UI_FIXED_SYSTEM_PROMPT),
        "/claude-sdk-python/generative-ui/a2ui/fixed-schema",
    ),
    "declarative-gen-ui": RegisteredAgent(
        build_adapter("declarative-gen-ui", prompts.FRONTEND_TOOL_SYSTEM_PROMPT),
        "/claude-sdk-python/generative-ui/a2ui/dynamic-schema",
    ),

    # App control — all three run on browser-supplied tools, which the adapter
    # forwards to Claude without any backend configuration.
    "frontend_tools": RegisteredAgent(
        build_adapter("frontend_tools", prompts.FRONTEND_TOOL_SYSTEM_PROMPT),
        "/claude-sdk-python/frontend-tools",
    ),
    "hitl-in-chat": RegisteredAgent(
        build_adapter("hitl-in-chat", prompts.FRONTEND_TOOL_SYSTEM_PROMPT),
        "/claude-sdk-python/human-in-the-loop",
    ),
    "programmatic-control": _plain(
        "programmatic-control", "/claude-sdk-python/programmatic-control"
    ),

    # Shared state
    "shared-state-read-write": RegisteredAgent(
        build_adapter("shared-state-read-write", prompts.SHARED_STATE_SYSTEM_PROMPT),
        "/claude-sdk-python/shared-state",
    ),
    "shared-state-streaming": RegisteredAgent(
        build_adapter("shared-state-streaming", prompts.STATE_STREAMING_SYSTEM_PROMPT),
        "/claude-sdk-python/shared-state/streaming",
    ),
    "readonly-state-agent-context": _plain(
        "readonly-state-agent-context",
        "/claude-sdk-python/shared-state/agent-readonly",
    ),

    # Multi-agent
    "subagents": RegisteredAgent(
        build_adapter("subagents", prompts.SUPERVISOR_SYSTEM_PROMPT),
        "/claude-sdk-python/multi-agent/subagents",
    ),

    # Agent config — no special prompt. The typed config arrives as AG-UI
    # context and the adapter appends it to the system prompt itself.
    "agent-config": _plain("agent-config", "/claude-sdk-python/agent-config"),
}
#endregion
