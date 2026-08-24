# Agent Config

> Forward typed configuration from your UI into the agent's reasoning loop.


<!-- interactive demo: agent-config -->


You have a working agent and want the user to be able to tune how it behaves: tone, expertise level, response length, language, persona. By the end of this guide, your UI will own a typed config object that the agent reads on every run and rebuilds its system prompt from.

## When to use this

Reach for agent config whenever the agent's behaviour depends on user-controllable settings that don't fit naturally as chat input:

- **Tone, voice, persona**: "playful", "formal", "casual"
- **Expertise level**: "beginner", "intermediate", "expert"
- **Response shape**: short / medium / long, structured / prose, language
- **Domain switches**: which knowledge base to consult, which tool subset to enable

If the values are a *channel* the user occasionally tunes (a settings panel, a toolbar of selects), agent config is the right shape. If the values are *content* the agent should write back to (notes, a document, a plan), use [Shared State](/claude-sdk-python/shared-state) instead.

How agent config flows from the UI into the agent's reasoning loop depends on your runtime architecture. Agents living behind a runtime read it from agent state on every run, while in-process agents receive the same object as forwarded properties on the provider — same UX, slightly different wiring on each side.



## How it works

<Steps>
  <Step>
    ### Make runtime configuration explicit

    The Claude Agent SDK demo reads configuration from shared state and folds it
    into the system prompt. This keeps the agent behavior visible to the UI and
    lets users tune model behavior without rebuilding the backend.

    
~~~~python title="agent_config_agent.py"
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


~~~~

  </Step>
</Steps>

Agent config is a typed object the frontend owns and publishes to the agent as
runtime context. The backend reads that context entry and turns it into a
system prompt.


Hold the typed config in React state, then mirror every change into the agent
through `useAgentContext`:

```tsx title="frontend/src/app/page.tsx — UI publishes the typed config"
function ConfigContextRelay({ config }: { config: AgentConfig }) {
  useAgentContext({
    description: "Agent response preferences",
    value: {
      tone: config.tone,
      expertise: config.expertise,
      responseLength: config.responseLength,
    },
  });
  return null;
}
```




The backend half is also a single node. Read the latest config context at the top of every run and use it to build the system prompt for that turn:

```python title="backend/agent.py — agent reads config and rebuilds the system prompt"
import json

CONFIG_KEYS = ("tone", "expertise", "responseLength")

def read_config_value(entry):
    value = entry.get("value")
    if isinstance(value, str):
        try:
            value = json.loads(value)
        except json.JSONDecodeError:
            return None
    if not isinstance(value, dict):
        return None
    if any(key in value for key in CONFIG_KEYS):
        return value
    return None

async def my_agent_node(state: AgentState, config: RunnableConfig):
    context_entries = state.get("copilotkit", {}).get("context", [])
    cfg = next(
        (
            value
            for entry in reversed(context_entries)
            if (value := read_config_value(entry)) is not None
        ),
        {},
    )
    tone = cfg.get("tone", "professional")
    expertise = cfg.get("expertise", "intermediate")
    response_length = cfg.get("responseLength", "concise")
    system_prompt = build_system_prompt(tone, expertise, response_length)
    # ...
```

The agent reads the latest typed config at the start of every turn, rebuilds the system prompt, runs the turn. This is the same shape as the [shared-state write-side pattern](/claude-sdk-python/shared-state#writing-to-agent-state); agent config is just a specific use of that pattern with a UI-owned typed object on top.





<IntegrationGrid path="agent-config" />
