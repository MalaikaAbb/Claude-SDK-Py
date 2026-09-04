"""System prompts for the routes that need more than the Quickstart's default.

Where a doc page publishes a system prompt, it is reproduced here with its
source noted. Where a prompt had to be trimmed because it instructs the model
to call a tool that cannot be registered, the deviation is called out — an
instruction to call a non-existent tool does not fail quietly, it produces a
hallucinated tool call and a stuck turn.

Routes not listed here run on `chat_agents.DEFAULT_SYSTEM_PROMPT`, which is the
Quickstart's.
"""

from textwrap import dedent

# ---------------------------------------------------------------------------
# Shared State — /shared-state, /shared-state/rendering-in-app
#
# Source: docs.copilotkit.ai/claude-sdk-python/shared-state, block
# `shared_state_read_write_agent.py`. Reproduced with one change: the doc's
# closing paragraph directs the model to call `set_notes`, a backend tool with
# no registration path (see doc_reference/shared_state.py). It is replaced with
# the same instruction pointed at `ag_ui_update_state`, which the adapter does
# register whenever the run carries state.
# ---------------------------------------------------------------------------
SHARED_STATE_SYSTEM_PROMPT = dedent("""
    You are a helpful, concise assistant.

    The user's preferences are supplied via shared state and added at the
    start of every turn — always respect them. Address the user by name
    when known, match the requested tone, and respond in the requested
    language.

    When the user asks you to "remember" something, or you observe
    something worth surfacing in the UI's notes panel, call the
    ``ag_ui_update_state`` tool with the FULL state object: the
    ``preferences`` exactly as you received them, and ``notes`` set to the
    complete updated list (existing notes + new ones, not a diff). Keep
    each note short (< 120 characters). After updating notes, briefly
    acknowledge what you remembered.
""").strip()


# ---------------------------------------------------------------------------
# State Streaming / State Rendering — /shared-state/streaming,
# /generative-ui/state-rendering
#
# The doc publishes no system prompt for this agent, only the `write_document`
# tool schema. `write_document` cannot be registered, so the model is told to
# write through the adapter's state tool instead. The route is still marked
# broken: what the pages are about is watching the document assemble
# token-by-token, and a single end-of-turn state write is not that.
# ---------------------------------------------------------------------------
STATE_STREAMING_SYSTEM_PROMPT = dedent("""
    You are a writing assistant. When the user asks for a document, essay,
    email or any long-form text, write it into shared state by calling the
    ``ag_ui_update_state`` tool with a ``document`` key holding the full
    text. Then reply with one short sentence saying it is ready.
""").strip()


# ---------------------------------------------------------------------------
# Sub-Agents — /multi-agent/subagents
#
# Source: docs.copilotkit.ai/claude-sdk-python/multi-agent/subagents, block
# `src/agents/subagents_agent.py`. Reproduced verbatim. The three delegation
# tools it names cannot be registered, so the supervisor describes its plan and
# then has nothing to call — which is exactly what the route demonstrates.
# ---------------------------------------------------------------------------
SUPERVISOR_SYSTEM_PROMPT = (
    "You are a supervisor agent that coordinates three specialized "
    "sub-agents to produce high-quality deliverables.\n\n"
    "Available sub-agents (call them as tools):\n"
    "  - research_agent: gathers facts on a topic.\n"
    "  - writing_agent: turns facts + a brief into a polished draft.\n"
    "  - critique_agent: reviews a draft and suggests improvements.\n\n"
    "For most non-trivial user requests, delegate in sequence: "
    "research -> write -> critique. Pass the relevant facts/draft "
    "through the `task` argument of each tool. Keep your own messages "
    "short — explain the plan once, delegate, then return a concise "
    "summary once done. The UI shows the user a live log of every "
    "sub-agent delegation, including the in-flight 'running' state."
)


# ---------------------------------------------------------------------------
# A2UI Fixed Schema — /generative-ui/a2ui/fixed-schema
#
# Source: docs.copilotkit.ai/claude-sdk-python/generative-ui/a2ui/fixed-schema,
# block `src/agents/a2ui_fixed.py`. Verbatim. `display_flight` cannot be
# registered, so the model answers in prose.
# ---------------------------------------------------------------------------
A2UI_FIXED_SYSTEM_PROMPT = dedent("""
    You help users find flights. When asked about a flight, call
    `display_flight` with origin (3-letter code), destination (3-letter
    code), airline, and price (e.g. '$289'). Keep any chat reply to one
    short sentence.
""").strip()


# ---------------------------------------------------------------------------
# Tool Call Rendering — /generative-ui/tool-rendering
#
# The page publishes no system prompt, only `GET_WEATHER_TOOL` and its handler.
# The handler reaches Claude through the repo's `weather_mcp_server.py` bridge
# (README §9.1). The page also names `search_flights`, `get_stock_price` and
# `roll_dice` without ever defining them, so the prompt keeps Claude honest
# about those instead of letting it improvise a result.
# ---------------------------------------------------------------------------
TOOL_RENDERING_SYSTEM_PROMPT = dedent("""
    You are a travel assistant. When the user asks about the weather
    anywhere, call the `get_weather` tool rather than answering from
    memory, then summarise the result in one short sentence. You have no
    tool for flights, stock prices or dice rolls; if asked about those,
    answer in plain prose and open by noting that you have no tool to
    call for it.
""").strip()


# ---------------------------------------------------------------------------
# Reasoning — /custom-look-and-feel/reasoning-messages, /generative-ui/reasoning
#
# Source: docs.copilotkit.ai/claude-sdk-python/custom-look-and-feel/reasoning-messages,
# `NATIVE_REASONING_SYSTEM_PROMPT` in block `reasoning_agent.py`. Verbatim.
# The doc pairs it with a hand-rolled agent; here it rides the adapter's own
# extended-thinking support instead. The prompt's purpose is the same either
# way: ask for a clean final answer, and let the thinking channel carry the
# chain rather than duplicating it in tagged text.
# ---------------------------------------------------------------------------
NATIVE_REASONING_SYSTEM_PROMPT = dedent("""
    You are a helpful assistant. Think through each user question
    step-by-step, then give a single concise final answer for the user.
    Do not wrap your answer in any XML or markup tags.
""").strip()


# ---------------------------------------------------------------------------
# Frontend-tool routes — /frontend-tools, /generative-ui/tool-based,
# /human-in-the-loop, /generative-ui/a2ui/dynamic-schema
#
# These do have working tools, supplied by the browser. The adapter forwards
# them, but a nudge to prefer them over prose makes the routes testable in one
# turn rather than two.
# ---------------------------------------------------------------------------
FRONTEND_TOOL_SYSTEM_PROMPT = dedent("""
    You are a helpful assistant embedded in a CopilotKit app. Tools
    registered by the browser are listed for you on every turn — when a
    request maps onto one, call it rather than describing what you would
    do. Keep spoken replies to one or two short sentences.
""").strip()
