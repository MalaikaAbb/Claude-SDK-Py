# Headless Interrupts

> Resolve agent interrupts from any UI, without a useInterrupt render slot.


<!-- interactive demo: interrupt-headless -->


## What is this?

`useInterrupt`'s `render` callback is the 80% path: it keeps the UI
glued to a `<CopilotChat>` transcript and handles "when to show the
picker" logic for you. This page covers the escape hatch: a
**render-less** interrupt resolver you assemble from the same
primitives `useInterrupt` uses internally — a pattern that lives
anywhere in your React tree, takes any shape you like (button grid,
form, modal, keyboard shortcut), and resolves the interrupt without
mounting a chat at all.





For promise-based integrations there is no native interrupt primitive,
so the headless variant uses `useFrontendTool` with a Promise-based
handler. The handler exposes its pending payload via React state — so
a separate "app surface" can render the picker outside the chat — and
resolves the Promise once the user interacts. Same UX, different
mechanism.





## When should I use this?

- **Testing / Playwright fixtures** — a deterministic, chat-less button
  grid is easier to drive than a chat surface where the picker only
  appears after an LLM call.
- **Non-chat UIs** — dashboards, side panels, inspector surfaces, or
  any place where you want the _agent's interrupt_ without the _chat
  transcript_.
- **Custom flow control** — when you need to know exactly when the
  interrupt arrived (e.g. to gate other UI) and when it was resolved.
- **Research / debugging** — when you want to observe the raw AG-UI
  custom events without the abstraction layer.

If you just want "a picker in chat", just use
[`useInterrupt`](./useInterrupt).





## The primitives

The render callback intentionally returns `null` — the picker UI lives
in the app surface, not in the chat transcript. The handler's pending
state drives whether the picker is shown:

<!-- snippet skipped: region 'headless-promise-primitives' missing in claude-sdk-python::interrupt-headless -->

A few things this pattern is careful about:

- The handler stages its `resolve` callback in a ref keyed by tool-call
  id, so concurrent tool calls don't trample each other's resolvers.
- `setPending` is called from inside the handler so the app surface
  re-renders the picker as soon as the agent calls the tool, and again
  with `null` after the user interacts so the picker disappears.
- `render: () => null` keeps the chat transcript clean — the headless
  variant deliberately bypasses inline rendering.





## Going further

- [Tool-based HITL with `useHumanInTheLoop`](../human-in-the-loop) — for
  LLM-initiated pauses where the model decides on the fly to ask the
  user, rather than the runtime forcing the pause itself.
- [`useInterrupt`](./useInterrupt) — the render-prop version of this
  page, with `enabled` gating and `handler` preprocessing.
