"""Agent Config — the backend half, as published.

Source: https://docs.copilotkit.ai/claude-sdk-python/agent-config
        (block titled `agent_config_agent.py`)

Copied verbatim. Nothing imports it — see below for why it would not work.

This page is a different failure from the rest of the package. There is no
missing tool bridge here; the two halves the page publishes simply do not meet.

  * The **frontend** half publishes `useAgentContext({ description, value })`,
    which travels to the agent as `input_data.context`.
  * The **backend** half is `read_properties(forwarded_props)`, which reads
    `tone` / `expertise` / `responseLength` off `forwarded_props` — a different
    channel that `useAgentContext` never writes to.
  * Even if the frontend used `properties` on the provider instead,
    `ClaudeAgentAdapter` filters `forwarded_props` through the
    `ALLOWED_FORWARDED_PROPS` whitelist in `ag_ui_claude_sdk/config.py`. That
    set holds Claude runtime controls (`model`, `temperature`, `max_tokens`,
    `max_turns`, …). `tone`, `expertise` and `responseLength` are not in it, so
    all three are dropped before the agent sees them.

The page also carries a third code block, `backend/agent.py — agent reads
config and rebuilds the system prompt`, which is LangGraph code
(`RunnableConfig`, `my_agent_node`, `state.get("copilotkit", {})`) and has no
bearing on a Claude Agent SDK backend at all.

The live `/agent-config` route uses the frontend half as published. It works
because the adapter folds `input_data.context` into the system prompt itself,
via `build_state_context_addendum` — the same mechanism the Agent Read-Only
Context page relies on.
"""

from typing import Any, Literal

Tone = Literal["professional", "casual", "enthusiastic"]
Expertise = Literal["beginner", "intermediate", "expert"]
ResponseLength = Literal["concise", "detailed"]

DEFAULT_TONE: Tone = "professional"
DEFAULT_EXPERTISE: Expertise = "intermediate"
DEFAULT_RESPONSE_LENGTH: ResponseLength = "concise"

VALID_TONES: set[str] = {"professional", "casual", "enthusiastic"}
VALID_EXPERTISE: set[str] = {"beginner", "intermediate", "expert"}
VALID_RESPONSE_LENGTHS: set[str] = {"concise", "detailed"}


def read_properties(forwarded_props: Any) -> dict[str, str]:
    """Read the three config axes with defensive defaults.

    ``forwarded_props`` may arrive as either the raw top-level dict (when
    the Next.js route forwards provider ``properties`` straight through)
    or nested under ``config.configurable.properties`` (the LangGraph
    convention the shared runtime route adopts for compatibility). We
    accept both shapes — unknown values fall back to the defaults; the
    function never raises.
    """
    if not isinstance(forwarded_props, dict):
        forwarded_props = {}

    # Prefer the nested shape (mirrors the langgraph-python convention
    # the dedicated route repacks into) but fall back to top-level keys
    # so the demo still works if a caller forwards properties directly.
    nested = ((forwarded_props.get("config") or {}).get("configurable") or {}).get(
        "properties"
    ) or {}
    props = nested if isinstance(nested, dict) and nested else forwarded_props

    tone = props.get("tone", DEFAULT_TONE)
    expertise = props.get("expertise", DEFAULT_EXPERTISE)
    response_length = props.get("responseLength", DEFAULT_RESPONSE_LENGTH)

    if tone not in VALID_TONES:
        tone = DEFAULT_TONE
    if expertise not in VALID_EXPERTISE:
        expertise = DEFAULT_EXPERTISE
    if response_length not in VALID_RESPONSE_LENGTHS:
        response_length = DEFAULT_RESPONSE_LENGTH

    return {
        "tone": tone,
        "expertise": expertise,
        "response_length": response_length,
    }


def build_system_prompt(tone: str, expertise: str, response_length: str) -> str:
    """Compose the system prompt from the three axes."""
    tone_rules = {
        "professional": ("Use neutral, precise language. No emoji. Short sentences."),
        "casual": (
            "Use friendly, conversational language. Contractions OK. "
            "Light humor welcome."
        ),
        "enthusiastic": (
            "Use upbeat, energetic language. Exclamation points OK. Emoji OK."
        ),
    }
    expertise_rules = {
        "beginner": "Assume no prior knowledge. Define jargon. Use analogies.",
        "intermediate": (
            "Assume common terms are understood; explain specialized terms."
        ),
        "expert": ("Assume technical fluency. Use precise terminology. Skip basics."),
    }
    length_rules = {
        "concise": "Respond in 1-3 sentences.",
        "detailed": ("Respond in multiple paragraphs with examples where relevant."),
    }
    return (
        "You are a helpful assistant.\n\n"
        f"Tone: {tone_rules[tone]}\n"
        f"Expertise level: {expertise_rules[expertise]}\n"
        f"Response length: {length_rules[response_length]}"
    )
