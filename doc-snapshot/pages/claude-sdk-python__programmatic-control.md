# Programmatic Control

> Drive agent runs directly from code — no chat UI required.

## What is this?

Programmatic control is what you reach for when you want to drive an
agent run from code rather than from a chat composer: a button, a
form, a cron job, a keyboard shortcut, a graph callback. CopilotKit
exposes three primitives that cover every triggering pattern:

- `agent.addMessage(...)` — append a message to the conversation without running the agent. Pair with `copilotkit.runAgent({ agent })` when you want the appended message to kick off a turn.
- `copilotkit.runAgent({ agent })` — the same entry point `<CopilotChat />` calls under the hood. Orchestrates frontend tools, follow-up runs, and the subscriber lifecycle.
- `agent.subscribe(subscriber)` — low-level AG-UI event subscription (`onCustomEvent`, `onRunStartedEvent`, `onRunFinalized`, `onRunFailed`, …). Pairs with `copilotkit.runAgent({ agent, forwardedProps: { command: { resume, interruptEvent } } })` to drive interrupt resolution from arbitrary UI.

Every example on this page is pulled from two live cells:
`headless-complete` (full chat surface, shown here for the message-send
path) and `interrupt-headless` (button-driven interrupt resolver, shown
here for the subscribe + resume path).

## When should I use this?

Use programmatic control when you want to:

- Trigger agent runs from buttons, forms, or other UI elements
- Execute specific tools directly from UI interactions (without an LLM turn)
- Build agent features without a chat window
- Access agent state and results programmatically
- Create fully custom agent-driven workflows

## Sending a message from code

<Steps>
  <Step>
    ### Run Claude through an AG-UI endpoint

    Programmatic control starts from the same AG-UI run boundary as the chat UI.
    Wrap Claude Agent SDK once, then trigger runs from a custom UI with
    `useAgent` or the AG-UI client. Inside your component, add the user
    message to the agent and dispatch the run.

    
~~~~typescript title="chat.tsx - useAgent run control"
  const { agent } = useAgent({ agentId: "headless-simple" });
  const { copilotkit } = useCopilotKit();
  const [input, setInput] = useState("");

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || agent.isRunning) return;
    agent.addMessage({
      id: createMessageId(),
      role: "user",
      content: trimmed,
    });
    setInput("");
    void copilotkit.runAgent({ agent }).catch((err) => {
      // The Headless Simple demo is the canonical "two hooks, your
      // design system" example users copy-paste as a starting point.
      // Silently swallowing errors here would model broken practice;
      // log so a network failure / runtime error / transport disconnect
      // surfaces in the console for the developer.
      console.error("[claude-sdk-python:headless-simple] runAgent failed", err);
    });
  };
~~~~

  </Step>
</Steps>

The message-send path in `headless-complete` is the canonical pattern:
append a user message with `agent.addMessage`, then call
`copilotkit.runAgent({ agent })`. The same `handleStop` calls
`copilotkit.stopAgent({ agent })` to cancel mid-run. Note the
`connectAgent` effect at the top, which opens the backend session on
mount so the very first `runAgent` doesn't race the handshake.

```typescript
// src/app/demos/headless-complete/chat/chat.tsx
  const { agent } = useAgent({ agentId });
  const { copilotkit } = useCopilotKit();

  const {
    attachments,
    fileInputRef,
    containerRef,
    handleFileUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    dragOver,
    removeAttachment,
    consumeAttachments,
  } = useAttachmentsConfig();

  const [input, setInput] = useState("");
  const messages = agent.messages;
  const { listRef, bottomRef, stickRef } = useAutoScroll(
    messages,
    agent.isRunning,
  );

  // Send pipeline: consume any ready attachments at submit time, build
  // the multimodal `content` array if needed, then dispatch the run.
  const sendText = useCallback(
    (text: string): boolean => {
      const trimmed = text.trim();
      if (agent.isRunning) return false;
      // Consume queued uploads first so they get sent even if the user
      // didn't type any text alongside them.
      const ready = consumeAttachments();
      if (!trimmed && ready.length === 0) return false;

      stickRef.current = true;

      const content = buildContent(trimmed, ready);
      agent.addMessage({
        id: createMessageId(),
        role: "user",
        content,
      });
      void copilotkit
        .runAgent({ agent })
        .catch((err) =>
          console.error("[headless-complete] runAgent failed", err),
        );
      return true;
    },
    [agent, copilotkit, consumeAttachments],
  );

  const handleSend = useCallback(() => {
    if (sendText(input)) {
      setInput("");
    }
  }, [input, sendText]);

  const handleSuggestion = useCallback(
    (text: string) => {
      sendText(text);
    },
    [sendText],
  );

  const handleReset = useCallback(() => {
    if (agent.isRunning) {
      try {
        agent.abortRun();
      } catch {
        // no-op: some transports don't support abort
      }
    }
    agent.setMessages([]);
    setInput("");
    stickRef.current = true;
  }, [agent]);
```

### `copilotkit.runAgent()` vs `agent.runAgent()`

Both methods trigger the agent, but they operate at different levels:

- **`copilotkit.runAgent({ agent })`** — the recommended default. Orchestrates the full lifecycle: executes frontend tools, handles follow-up runs, and routes errors through the subscriber system.
- **`agent.runAgent(options)`** — low-level method on the agent instance. Sends the request to the runtime but does **not** execute frontend tools or chain follow-ups. Reach for this only when you need direct control. (For the interrupt-resume case, use `copilotkit.runAgent({ agent, forwardedProps: { command: { resume, interruptEvent } } })` — see the snippet below — so the subscriber lifecycle still wraps the resumed run.)

## Subscribing to agent events

`agent.subscribe(subscriber)` returns `{ unsubscribe }`. The subscriber
object accepts every AG-UI lifecycle callback: `onCustomEvent`,
`onRunStartedEvent`, `onRunFinalized`, `onRunFailed`, and the streaming
deltas. Use it to drive custom progress UI, forward events to
analytics, or catch framework pause/resume events and resolve them with
a payload (the pattern below).

<WhenFrameworkHas flag="interrupt_pattern" equals="native">

## Resolving a LangGraph interrupt from a button

The `interrupt-headless` cell demonstrates the full pattern without
`useInterrupt` or a chat surface. A plain hook subscribes to
`on_interrupt` custom events, buffers the payload until the run
finalizes (so the UI doesn't flash mid-stream), and exposes a
`resolve(response)` callback that calls `copilotkit.runAgent({ agent,
forwardedProps: { command: { resume, interruptEvent } } })` to unblock
the graph:

```typescript
// src/app/demos/interrupt-headless/page.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  CopilotKit,
  CopilotChat,
  useAgent,
  useConfigureSuggestions,
  useCopilotKit,
} from "@copilotkit/react-core/v2";
import { generateFallbackSlots } from "../_shared/interrupt-fallback-slots";
import type { TimeSlot } from "../_shared/interrupt-fallback-slots";

const INTERRUPT_EVENT_NAME = "on_interrupt";

type InterruptPayload = {
  topic?: string;
  attendee?: string;
  slots?: TimeSlot[];
};

type InterruptEvent = {
  name: string;
  value: InterruptPayload;
};

export default function InterruptHeadlessDemo() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent="interrupt-headless">
      <Layout />
    </CopilotKit>
  );
}

function Layout() {
  const { pending, resolve } = useHeadlessInterrupt("interrupt-headless");

  useConfigureSuggestions({
    suggestions: [
      {
        title: "Book a call with sales",
        message: "Book an intro call with the sales team to discuss pricing.",
      },
      {
        title: "Schedule a 1:1 with Alice",
        message: "Schedule a 1:1 with Alice next week to review Q2 goals.",
      },
    ],
    available: "always",
  });

  return (
    <div className="grid h-screen grid-cols-[1fr_420px] bg-[#FAFAFC]">
      <AppSurface pending={pending} resolve={resolve} />
      <div className="border-l border-[#DBDBE5] bg-white">
        <CopilotChat agentId="interrupt-headless" className="h-full" />
      </div>
    </div>
  );
}

function useHeadlessInterrupt(agentId: string): {
  pending: InterruptEvent | null;
  resolve: (response: unknown) => void;
} {
  const { copilotkit } = useCopilotKit();
  const { agent } = useAgent({ agentId });
  const [pending, setPending] = useState<InterruptEvent | null>(null);

  useEffect(() => {
    let local: InterruptEvent | null = null;
    const sub = agent.subscribe({
      onCustomEvent: ({ event }) => {
        if (event.name === INTERRUPT_EVENT_NAME) {
          // The AG-UI adapter JSON-stringifies interrupt values, so
          // parse when the value arrives as a string.
          const raw = event.value ?? {};
          local = {
            name: event.name,
            value: (typeof raw === "string"
              ? JSON.parse(raw)
              : raw) as InterruptPayload,
          };
        }
      },
      onRunStartedEvent: () => {
        local = null;
        setPending(null);
      },
      onRunFinalized: () => {
        if (local) {
          setPending(local);
          local = null;
        }
      },
      onRunFailed: () => {
        local = null;
      },
    });
    return () => sub.unsubscribe();
  }, [agent]);

  const resolve = useMemo(
    () => (response: unknown) => {
      const snapshot = pending;
      setPending(null);
      void copilotkit
        .runAgent({
          agent,
          forwardedProps: {
            command: {
              resume: response,
              interruptEvent: snapshot?.value,
            },
          },
        })
        .catch(() => {});
    },
    [agent, copilotkit, pending],
  );

  return { pending, resolve };
}
```

The resulting `{ pending, resolve }` tuple is pure data; any UI can
drive it. The cell itself renders a simple button grid, but the same
hook would power a modal, a toast, a sidebar form, or a voice UI.

</WhenFrameworkHas>

<WhenFrameworkHas flag="interrupt_pattern" equals="promise-based">

## Resolving a frontend tool call from a button

For promise-based integrations there is no native interrupt primitive —
the demo uses `useFrontendTool` with a Promise-based handler instead.
The handler stages its `resolve` callback and pending payload via React
state, the app surface renders the picker outside the chat, and the
user's pick resolves the Promise that the agent's tool call is awaiting.
Same UX, different mechanism — the agent never knows it's talking to a
button grid instead of a chat picker:

<!-- snippet skipped: region 'headless-promise-primitives' missing in claude-sdk-python::interrupt-headless -->

The resulting `{ pending, resolveActive }` pair is pure data; any UI
can drive it. The cell itself renders a simple button grid, but the
same pattern would power a modal, a toast, a sidebar form, or a voice
UI.

</WhenFrameworkHas>

<WhenFrameworkHas flag="interrupt_pattern" absent>

## Resolving a pause from a button

> **Interrupt-style pause/resume isn't available on this framework.**
> The headless interrupt pattern shown above requires the underlying
> runtime to expose either a native `interrupt(...)` primitive
> (LangGraph) or a Promise-resolving frontend-tool path. For all other
> integrations, drive pauses through
> [`useHumanInTheLoop`](./human-in-the-loop) instead — it's the
> standard hook for tool-call-based pause/resume flows and works on
> every framework that supports tool calls. The `agent.addMessage`,
> `copilotkit.runAgent`, and `agent.subscribe` primitives above still
> apply — only the interrupt-resolution path is framework-specific.

</WhenFrameworkHas>

## See also

- [Headless UI](./headless) — the full `useRenderedMessages` composition
  that mirrors `<CopilotChatMessageView>` line-for-line.
- [Human-in-the-Loop](./human-in-the-loop) — the `useHumanInTheLoop` and
  `useInterrupt` hooks with their render-prop contracts, for the
  "paused mid-chat" pattern this page's headless variant replaces.

<IntegrationGrid path="programmatic-control" />
