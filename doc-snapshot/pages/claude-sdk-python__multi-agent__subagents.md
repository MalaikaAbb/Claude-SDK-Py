# Sub-Agents

> Decompose work across multiple specialized agents with a visible delegation log.


<!-- interactive demo: subagents -->


## What is this?

Sub-agents are the canonical multi-agent pattern: a top-level
**supervisor** LLM orchestrates one or more specialized **sub-agents**
by exposing each of them as a tool. The supervisor decides what to
delegate, the sub-agents do their narrow job, and their results flow
back up to the supervisor's next step.

This is fundamentally the same shape as tool-calling, but each "tool"
is itself a full-blown agent with its own system prompt and (often) its
own tools, memory, and model.

## When should I use this?

Reach for sub-agents when a task has distinct specialized sub-tasks
that each benefit from their own focus:

- **Research → Write → Critique** pipelines, where each stage needs a
  different system prompt and temperature.
- **Router + specialists**, where one agent classifies the request and
  dispatches to the right expert.
- **Divide-and-conquer** — any problem that fits cleanly into parallel
  or sequential sub-problems.

The example below uses the Research → Write → Critique shape as the
canonical example.

## Setting up sub-agents

<Steps>
  <Step>
    ### Represent subagents as delegation tools

    The Claude Agent SDK demo keeps a supervisor prompt and exposes delegation
    tools for specialist agents. CopilotKit can then render delegation progress
    while the supervisor coordinates the run. Start by giving the supervisor
    one tool schema per specialist.

    
~~~~python title="subagents_agent.py - supervisor tool schemas"
def _delegation_tool_schema(name: str, description: str) -> dict[str, Any]:
    return {
        "name": name,
        "description": description,
        "input_schema": {
            "type": "object",
            "properties": {
                "task": {
                    "type": "string",
                    "description": (
                        "The full task description to hand to the "
                        "sub-agent. Pass relevant prior facts/drafts "
                        "verbatim — the sub-agent has no shared memory "
                        "with the supervisor."
                    ),
                }
            },
            "required": ["task"],
        },
    }


SUPERVISOR_TOOLS: list[dict[str, Any]] = [
    _delegation_tool_schema(
        "research_agent",
        "Delegate a research task. Returns a bulleted list of key facts.",
    ),
    _delegation_tool_schema(
        "writing_agent",
        (
            "Delegate a drafting task. Pass relevant facts in `task`. "
            "Returns a polished paragraph."
        ),
    ),
    _delegation_tool_schema(
        "critique_agent",
        "Delegate a critique task. Returns 2-3 actionable critiques.",
    ),
]
~~~~

  </Step>
</Steps>

Each sub-agent is an isolated agent call with its own model, system
prompt, and optional tools. They don't share memory or tools with the
supervisor; the supervisor only ever sees what the sub-agent returns.

```python
# src/agents/subagents_agent.py
# Each sub-agent is defined by its own system prompt; `_invoke_sub_agent`
# (below) issues a single-shot Anthropic call as that sub-agent. They
# don't share memory or tools with the supervisor — the supervisor only
# ever sees what the sub-agent returns as a tool result.
SUB_AGENT_PROMPTS: dict[str, str] = {
    "research_agent": (
        "You are a research sub-agent. Given a topic, produce a concise "
        "bulleted list of 3-5 key facts. No preamble, no closing."
    ),
    "writing_agent": (
        "You are a writing sub-agent. Given a brief and optional source "
        "facts, produce a polished 1-paragraph draft. Be clear and "
        "concrete. No preamble."
    ),
    "critique_agent": (
        "You are an editorial critique sub-agent. Given a draft, give "
        "2-3 crisp, actionable critiques. No preamble."
    ),
}


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


# The supervisor delegates by calling tools. Each entry in
# `SUPERVISOR_TOOLS` is an Anthropic tool schema that the supervisor LLM
# "calls" to delegate work; the run loop in `run_subagents_agent` (see
# the subagents-delegation-flow region) runs the matching sub-agent
# synchronously, records the delegation into shared agent state, and
# returns the sub-agent's output as a tool_result the supervisor can
# read on its next step.
def _delegation_tool_schema(name: str, description: str) -> dict[str, Any]:
    return {
        "name": name,
        "description": description,
        "input_schema": {
            "type": "object",
            "properties": {
                "task": {
                    "type": "string",
                    "description": (
                        "The full task description to hand to the "
                        "sub-agent. Pass relevant prior facts/drafts "
                        "verbatim — the sub-agent has no shared memory "
                        "with the supervisor."
                    ),
                }
            },
            "required": ["task"],
        },
    }


SUPERVISOR_TOOLS: list[dict[str, Any]] = [
    _delegation_tool_schema(
        "research_agent",
        "Delegate a research task. Returns a bulleted list of key facts.",
    ),
    _delegation_tool_schema(
        "writing_agent",
        (
            "Delegate a drafting task. Pass relevant facts in `task`. "
            "Returns a polished paragraph."
        ),
    ),
    _delegation_tool_schema(
        "critique_agent",
        "Delegate a critique task. Returns 2-3 actionable critiques.",
    ),
]


async def _invoke_sub_agent(
    client: anthropic.AsyncAnthropic,
    sub_agent: str,
    task: str,
) -> str:
    """Issue a single-shot Anthropic call as the named sub-agent.

    Returns the concatenated text content of the response. Raises any
    SDK exception so the caller can mark the delegation as ``failed``.
    """
    response = await client.messages.create(
        model=normalize_claude_model(
            os.getenv("ANTHROPIC_SUBAGENT_MODEL", DEFAULT_ANTHROPIC_MODEL)
        ),
        max_tokens=1024,
        system=SUB_AGENT_PROMPTS[sub_agent],
        messages=[{"role": "user", "content": task}],
    )
    parts: list[str] = []
    for block in response.content:
        if getattr(block, "type", None) == "text":
            parts.append(getattr(block, "text", ""))
    text = "".join(parts).strip()
    if not text:
        raise RuntimeError("sub-agent returned empty response")
    return text


```

Keep sub-agent system prompts narrow and focused. The point of this pattern
is that each one does one thing well. If a sub-agent needs to know
the whole user context to do its job, that's a signal the boundary is
wrong.

## Exposing sub-agents as tools

The supervisor delegates by calling tools. Each delegation tool is a thin
wrapper around a specialized agent call that:

1. Runs the sub-agent on the supplied `task` string.
2. Records the delegation into a `delegations` slot in shared agent
   state (so the UI can render a live log).
3. Returns the sub-agent's final message as the tool result, which the
   supervisor sees on its next turn.

```python
# src/agents/subagents_agent.py
def _delegation_tool_schema(name: str, description: str) -> dict[str, Any]:
    return {
        "name": name,
        "description": description,
        "input_schema": {
            "type": "object",
            "properties": {
                "task": {
                    "type": "string",
                    "description": (
                        "The full task description to hand to the "
                        "sub-agent. Pass relevant prior facts/drafts "
                        "verbatim — the sub-agent has no shared memory "
                        "with the supervisor."
                    ),
                }
            },
            "required": ["task"],
        },
    }


SUPERVISOR_TOOLS: list[dict[str, Any]] = [
    _delegation_tool_schema(
        "research_agent",
        "Delegate a research task. Returns a bulleted list of key facts.",
    ),
    _delegation_tool_schema(
        "writing_agent",
        (
            "Delegate a drafting task. Pass relevant facts in `task`. "
            "Returns a polished paragraph."
        ),
    ),
    _delegation_tool_schema(
        "critique_agent",
        "Delegate a critique task. Returns 2-3 actionable critiques.",
    ),
]
```

This is where CopilotKit's shared-state channel earns its keep: the
supervisor's tool calls mutate `delegations` as they happen, and the
frontend renders every new entry live.

## Rendering a live delegation log

On the frontend, the delegation log is a reactive render of the
`delegations` slot.


Subscribe with `useAgent({ updates:
[UseAgentUpdate.OnStateChanged, UseAgentUpdate.OnRunStatusChanged] })`,
read `agent.state.delegations`, and render one card per entry.

```typescript
// src/app/demos/subagents/delegation-log.tsx
/**
 * Live delegation log — renders the `delegations` slot of agent state.
 *
 * Each entry corresponds to one invocation of a sub-agent. The list
 * grows in real time as the supervisor fans work out to its children.
 * The parent header shows how many sub-agents have been called and
 * whether the supervisor is still running.
 */
// Fixed list of the three sub-agent roles the supervisor can call.
// Rendered as always-visible indicator chips at the top of the log
// (regardless of whether the supervisor has delegated yet) so the user
// — and the e2e suite — can see at a glance which sub-agents exist and
// which are currently active.
const INDICATOR_ROLES: ReadonlyArray<{
  role: "researcher" | "writer" | "critic";
  subAgent: SubAgentName;
}> = [
  { role: "researcher", subAgent: "research_agent" },
  { role: "writer", subAgent: "writing_agent" },
  { role: "critic", subAgent: "critique_agent" },
];

export function DelegationLog({ delegations, isRunning }: DelegationLogProps) {
  const calledRoles = new Set<SubAgentName>(
    delegations.map((d) => d.sub_agent),
  );

  return (
    <div
      data-testid="delegation-log"
      className="w-full h-full flex flex-col bg-white rounded-2xl shadow-sm border border-[#DBDBE5] overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#E9E9EF] bg-[#FAFAFC]">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-[#010507]">
            Sub-agent delegations
          </span>
          {isRunning && (
            <span
              data-testid="supervisor-running"
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-[#BEC2FF] bg-[#BEC2FF1A] text-[#010507] text-[10px] font-semibold uppercase tracking-[0.12em]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#010507] animate-pulse" />
              Supervisor running
            </span>
          )}
        </div>
        <span
          data-testid="delegation-count"
          className="text-xs font-mono text-[#838389]"
        >
          {delegations.length} calls
        </span>
      </div>

      <div
        data-testid="subagent-indicators"
        className="flex items-center gap-2 border-b border-[#E9E9EF] bg-white px-6 py-2"
      >
        {INDICATOR_ROLES.map(({ role, subAgent }) => {
          const style = SUB_AGENT_STYLE[subAgent];
          const fired = calledRoles.has(subAgent);
          return (
            <span
              key={role}
              data-testid={`subagent-indicator-${role}`}
              data-role={role}
              data-fired={fired ? "true" : "false"}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.1em] border ${style.color} ${
                fired ? "" : "opacity-60"
              }`}
            >
              <span aria-hidden>{style.emoji}</span>
              <span>{style.label}</span>
            </span>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {delegations.length === 0 ? (
          <p className="text-[#838389] italic text-sm">
            Ask the supervisor to complete a task. Every sub-agent it calls will
            appear here.
          </p>
        ) : (
          delegations.map((d, idx) => {
            const style = SUB_AGENT_STYLE[d.sub_agent];
            return (
              <div
                key={d.id}
                data-testid="delegation-entry"
                className="border border-[#E9E9EF] rounded-xl p-3 bg-[#FAFAFC]"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#AFAFB7]">
                      #{idx + 1}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.1em] border ${style.color}`}
                    >
                      <span>{style.emoji}</span>
                      <span>{style.label}</span>
                    </span>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.12em] font-semibold text-[#189370]">
                    {d.status}
                  </span>
                </div>
                <div className="text-xs text-[#57575B] mb-2">
                  <span className="font-semibold text-[#010507]">Task: </span>
                  {d.task}
                </div>
                <div className="text-sm text-[#010507] whitespace-pre-wrap bg-white rounded-lg p-2.5 border border-[#E9E9EF]">
                  {d.result}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
```




The result: as the supervisor fans work out to its sub-agents, the log
grows in real time, giving the user visibility into a process that
would otherwise be a long opaque spinner.

## Related

- **[Shared State](/claude-sdk-python/shared-state)** — the channel that makes the
  delegation log live.
- **[State streaming](/claude-sdk-python/shared-state/streaming)** — stream
  *individual* sub-agent outputs token-by-token inside each log entry.
