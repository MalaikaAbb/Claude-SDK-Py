# Pausing the Agent for Input

> Pause an agent run mid-tool, hand control to a custom React component, and resume with the user's answer.


<!-- interactive demo: gen-ui-interrupt -->


## What is this?

`useInterrupt` lets your agent pause mid-run, hand control to the user
through a custom React component, and resume with whatever the user
returns. How that pause is implemented depends on the framework's
runtime.





Some runtimes cannot pause a run mid-tool the way LangGraph's
`interrupt()` does, so this demo uses `useFrontendTool` with a
Promise-based handler instead. The agent calls `schedule_meeting` like
any other tool; the client-side handler renders the picker, holds the
request open, and only resolves the Promise once the user picks a slot
or cancels. Same UX from the reader's perspective — agent pauses, user
answers, agent resumes — different mechanism underneath.





## When should I use this?

Reach for `useInterrupt` when the pause is a **graph-enforced
checkpoint** where the code path _must_ stop and wait for a human,
not an LLM-initiated tool call. Typical cases:

- A sensitive action (payments, irreversible writes) must be approved
- A required piece of state isn't known and can only be collected from the user
- The agent explicitly reaches an approval node in a longer workflow
- You want the server-side contract to be `interrupt(...)` and resume with a payload

For LLM-initiated pauses where the model decides on the fly to ask
the user, prefer [`useHumanInTheLoop`](../human-in-the-loop).





## The frontend: `useFrontendTool` with a Promise-resolving handler

The handler stores its `resolve` callback in a ref, returns a Promise
that the user's pick eventually resolves, and renders the picker
inline in the chat. This is the frontend-tool equivalent of
`useInterrupt`'s `event` / `resolve` pair:

<!-- snippet skipped: region 'frontend-promise-handler' missing in claude-sdk-python::gen-ui-interrupt -->

## The backend: agent instructed to call the frontend tool

The agent has no local `schedule_meeting` implementation — the tool is
registered entirely on the frontend. The backend's only job is to
instruct the model to call `schedule_meeting` whenever the user wants
to book a meeting. AG-UI routes the tool call to the client, where
the Promise-returning handler takes over:

```python
# src/agents/interrupt_agent.py
SYSTEM_PROMPT = dedent("""
    You are a scheduling assistant. Whenever the user asks you to book a call
    or schedule a meeting, you MUST call the `schedule_meeting` tool. Pass a
    short `topic` describing the purpose of the meeting and, if known, an
    `attendee` describing who the meeting is with.

    The `schedule_meeting` tool is implemented on the client: it surfaces a
    time-picker UI to the user and returns the user's selection. After the
    tool returns, briefly confirm whether the meeting was scheduled and at
    what time, or note that the user cancelled. Do NOT ask for approval
    yourself — always call the tool and let the picker handle the decision.

    Keep responses short and friendly. After you finish executing tools,
    always send a brief final assistant message summarizing what happened so
    the message persists.
""").strip()
```





## AG-UI standard interrupt flow vs. legacy

`useInterrupt` supports two interrupt transports. Understanding which one your
agent uses helps you write the right `render` code.

### Standard flow (`RUN_FINISHED` with `outcome.type === "interrupt"`)

When the agent backend conforms to the AG-UI protocol, it signals an interrupt
by emitting a `RUN_FINISHED` event whose outcome carries the interrupts array:

```
outcome.type === "interrupt"
outcome.interrupts  // Interrupt[]
```

The hook detects this on `onRunFinishedEvent` and exposes the interrupts on the
render props **after** `onRunFinalized` fires. Your `render` function receives:

- **`interrupt`** — the primary `Interrupt` (`interrupts[0]`), with shape
  `{ id, reason, message?, toolCallId?, responseSchema?, expiresAt?, metadata? }`.
- **`interrupts`** — the full open set (usually one, but multi-interrupt is
  supported — see below).
- **`resolve(payload?, interruptId?)`** — records `{ status: "resolved", payload }`
  for the targeted interrupt (defaults to the primary). The agent run resumes
  once every open interrupt has a response.
- **`cancel(interruptId?)`** — records `{ status: "cancelled" }` for the
  targeted interrupt. Same accumulate-then-submit logic applies.

### Legacy flow (`on_interrupt` custom event)

Older agents (or agents not yet migrated to the AG-UI interrupt spec) emit a
custom `on_interrupt` event. The hook detects this on `onCustomEvent` and sets
`interrupt` to `null` and `interrupts` to `[]`. The payload is in
`event.value`. Calling `resolve(payload)` resumes via `forwardedProps.command`
(the legacy resume mechanism). `cancel()` dismisses the interrupt without
resuming — the agent never receives a response.

### Priority

If both signals appear on the same run (unlikely but possible during migration),
the standard flow wins.

### Approve / Cancel example

```tsx
function ApprovalInterrupt() {
  useInterrupt({
    render: ({ interrupt, resolve, cancel }) => (
      <div className="p-3 border rounded">
        <p>{interrupt?.message ?? "Approve this action?"}</p>
        <div className="mt-2 flex gap-2">
          <button onClick={() => resolve({ approved: true })}>Approve</button>
          <button onClick={() => cancel()}>Cancel</button>
        </div>
      </div>
    ),
  });
  return null;
}
```

`resolve({ approved: true })` records a resolved entry and submits the `resume`
array to the agent. `cancel()` records a cancelled entry and does the same.
Both return the `RunAgentResult` once the run restarts.

### Multi-interrupt behavior

Some agents issue more than one interrupt in a single run (e.g. two independent
approvals). Each interrupt has its own `id`. Address them individually:

```tsx
useInterrupt({
  render: ({ interrupts, resolve, cancel }) => (
    <ul>
      {interrupts.map((i) => (
        <li key={i.id}>
          {i.message}
          <button onClick={() => resolve({ ok: true }, i.id)}>Approve</button>
          <button onClick={() => cancel(i.id)}>Cancel</button>
        </li>
      ))}
    </ul>
  ),
});
```

The agent run only resumes once **every** open interrupt has been addressed.
Calling `resolve` or `cancel` with a specific `interruptId` marks that interrupt
done; the hook auto-submits the accumulated responses when the last one is
addressed. If you omit `interruptId`, the primary interrupt (`interrupts[0]`)
is targeted.

### `responseSchema` — surface only, no client-side validation

The `Interrupt` type exposes a `responseSchema` field (a JSON Schema object)
that the agent can use to describe the expected payload shape. `useInterrupt`
surfaces this field on `interrupt.responseSchema` for your UI to read
(e.g. to drive a form), but it does **not** validate `resolve` payloads against
it. Validation is the agent's responsibility on resume.

## Going further

- [Tool-based HITL with `useHumanInTheLoop`](../human-in-the-loop) — for
  LLM-initiated pauses.
- [Headless interrupts](./headless) — compose the lower-level primitives
  (`useAgent`, `agent.subscribe`, `copilotkit.runAgent`) to resolve
  interrupts outside a chat surface.
