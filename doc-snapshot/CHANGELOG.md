# Doc drift changelog

What the CopilotKit docs changed under this repo, written by the sync on
`/doc-sync`. Only pages that actually moved are recorded — a sync that finds
everything unchanged writes nothing here at all.

Holds the 3 most recent dated entries. When a change lands on a fourth
date, the oldest entry is dropped. Entries are counted, not aged, so a gap of
weeks between changes does not expire anything.

## 2026-11-11

### 14:08 UTC — 31 pages, highest severity high

**High — Introduction**

`/claude-sdk-python` · routes `/`, `/doc-sync` · under “Quickstart”

21 code lines, 1 heading, 14 prose lines changed. The number of fenced code blocks changed.

````diff
- <IntelligenceOnboardingPrompt
- feature="learning"
- surface="docs_claude_sdk_python_quickstart"
- />
+ ## Start with your coding agent
+ Use this prompt to connect your Claude Agent SDK for Python agent to CopilotKit and verify a working conversation. Your coding agent will follow this guide in your project, or you can work through the manual steps below.
+ 
+ Ask your coding agent to follow the setup steps on this page for your selected framework and frontend.
````

**High — Slots**

`/claude-sdk-python/custom-look-and-feel/slots` · route `/custom-look-and-feel/slots` · under “Tool calls”

23 code lines, 1 heading, 19 prose lines changed. The number of fenced code blocks changed.

````diff
+ ### Tool calls
+ 
+ The `assistantMessage` slot holds `toolCallsView`, which renders the tool calls
+ of one assistant message. Wrap the default `CopilotChatToolCallsView` to change
+ the container while keeping your registered tool renderers:
+ 
+ ```tsx title="page.tsx"
+ import {
````

**High — Frontend Tools**

`/claude-sdk-python/frontend-tools` · route `/frontend-tools` · under “Forward browser tools to Claude”

10 code lines, 1 heading, 26 prose lines changed. The number of fenced code blocks changed.

````diff
- input. Convert each AG-UI tool definition into an Anthropic Messages API
- tool schema before calling the model. Runs that carry frontend tools use
- the direct Messages API path rather than the Claude Agent SDK.
+ input. This demo's server calls the Anthropic Messages API directly for
+ runs that carry frontend tools, so it converts each AG-UI tool definition
+ into a Messages API tool schema first.
+ The published `ClaudeAgentAdapter` from `ag_ui_claude_sdk` needs no such
+ conversion. It registers each frontend tool on its own in-process MCP tool
````

**High — A2UI · Dynamic Schema**

`/claude-sdk-python/generative-ui/a2ui/dynamic-schema` · route `/generative-ui/a2ui/dynamic-schema` · under “The A2UI agent tool” · in a `python` block

2 code lines changed.

````diff
- "model": ChatOpenAI(model="gpt-4o"),
+ "model": ChatOpenAI(model="gpt-6-luna", reasoning_effort="none"),
````

**High — Components as Tools**

`/claude-sdk-python/generative-ui/tool-based` · route `/generative-ui/tool-based` · under “Forward browser tools to Claude”

9 code lines, 1 heading, 43 prose lines changed. The number of fenced code blocks changed.

````diff
- input. Convert each AG-UI tool definition into an Anthropic Messages API
- tool schema before calling the model. Runs that carry frontend tools use
- the direct Messages API path rather than the Claude Agent SDK.
+ input. This demo's server calls the Anthropic Messages API directly for
+ runs that carry frontend tools, so it converts each AG-UI tool definition
+ into a Messages API tool schema first.
+ The published `ClaudeAgentAdapter` from `ag_ui_claude_sdk` needs no such
+ conversion. It registers each frontend tool on its own in-process MCP tool
````

**High — Tool Call Rendering**

`/claude-sdk-python/generative-ui/tool-rendering` · route `/generative-ui/tool-rendering` · under “Default tool rendering (zero-config)”

15 code lines, 2 headings, 50 prose lines changed. The number of fenced code blocks changed.

````diff
- any UI.
+ any UI. Calls the agent makes in a row are grouped into one card; see
+ [Grouping tool calls](#grouping-tool-calls).
+ ## Grouping tool calls
+ 
+ Agents often call several tools in a row. By default, CopilotKit collapses
+ each run of calls drawn by the built-in card from `useDefaultRenderTool()` into
+ one card that reads "Used 3 tools". While a call runs, the card names it
````

**High — Headless Threads**

`/claude-sdk-python/headless-threads` · route `/headless-threads` · under “Headless Threads”

7 code lines, 1 heading, 47 prose lines changed. The number of fenced code blocks changed.

````diff
+ Intelligence’s AG-UI streams power the history and delivery behind this custom UI. Use `useThreads` to list and manage conversations, and pass their `threadId` to your chat.
+ 
- CopilotKit Rich Threads enable persistent, resumable multi-turn conversations. The `useThreads` hook lists, creates, renames, archives, and deletes CopilotKit Intelligence threads with realtime synchronization via WebSocket. Threads work with any agent framework — CopilotKit Intelligence stores conversation history server-side, so users can close their browser and pick up where they left off. It does not list or mutate native LangGraph, ADK, or other framework stores unless your backend explicitly bridges those systems. Thread metadata updates (renames, archives, new threads) appear on connected clients without polling.
+ The `useThreads` hook lists, creates, renames, archives, and deletes CopilotKit Intelligence threads with realtime synchronization via WebSocket. Threads work with any agent framework — CopilotKit Intelligence stores conversation history server-side, so users can close their browser and pick up where they left off. It does not list or mutate native LangGraph, ADK, or other framework stores unless your backend explicitly bridges those systems. Thread metadata updates (renames, archives, new threads) appear on connected clients without polling.
- [scope Rich Threads to the signed-in user](/claude-sdk-python/threads-lifecycle#scope-rich-threads-to-the-signed-in-user)
+ [scope AG-UI Streams to the signed-in user](/claude-sdk-python/threads-lifecycle#scope-rich-threads-to-the-signed-in-user)
- <Callout type="info" title="Migrating existing history?">
- Threads capture new CopilotKit conversations once your app is connected to
````

**High — CopilotChat**

`/claude-sdk-python/prebuilt-components/chat` · route `/prebuilt-components/chat` · under “Basic setup” · in a `tsx` block

4 code lines, 7 prose lines changed. The number of fenced code blocks changed.

````diff
+ ```tsx
+ import { CopilotKit, CopilotChat } from "@copilotkit/react-core/v2";
+ import "@copilotkit/react-core/v2/styles.css";
+ ```
+ 
+ <Callout type="warn">
+ `@copilotkit/react-ui` also exports a component named `CopilotChat`. That one
+ is the [deprecated v1 chat](/claude-sdk-python/migrate/v2). This page documents the v2 chat,
````

**High — Threads Drawer**

`/claude-sdk-python/prebuilt-components/copilot-threads-drawer` · route `/prebuilt-components/copilot-threads-drawer` · under “When should I use this?”

34 code lines, 4 headings, 63 prose lines changed. The number of fenced code blocks changed.

````diff
- server-side). <SignupLink surface="docs_drawer">Get a free developer account</SignupLink> to set that up.
+ server-side). <SignupLink surface="docs_drawer">Start cloud-hosted setup</SignupLink> to create or select a project.
- [scope Rich Threads to the signed-in user](/claude-sdk-python/threads-lifecycle#scope-rich-threads-to-the-signed-in-user).
+ [scope AG-UI Streams to the signed-in user](/claude-sdk-python/threads-lifecycle#scope-rich-threads-to-the-signed-in-user).
- body="Get persistent threads and realtime sync on the free Developer tier."
+ body="Connect a cloud-hosted project to get persistent threads and realtime sync."
+ <Callout type="warn">
+ **The Drawer ships only in `@copilotkit/react-core/v2`.** There is no v1
````

**High — CopilotPopup**

`/claude-sdk-python/prebuilt-components/popup` · route `/prebuilt-components/popup` · under “Basic setup” · in a `tsx` block

4 code lines, 7 prose lines changed. The number of fenced code blocks changed.

````diff
+ ```tsx
+ import { CopilotKit, CopilotPopup } from "@copilotkit/react-core/v2";
+ import "@copilotkit/react-core/v2/styles.css";
+ ```
+ 
+ <Callout type="warn">
+ `@copilotkit/react-ui` also exports a component named `CopilotPopup`. That one
+ is the [deprecated v1 popup](/claude-sdk-python/migrate/v2). This page documents the v2 popup,
````

**High — CopilotSidebar**

`/claude-sdk-python/prebuilt-components/sidebar` · route `/prebuilt-components/sidebar` · under “When should I use this?”

4 code lines, 11 prose lines changed. The number of fenced code blocks changed.

````diff
- use [`<CopilotChat>`](/claude-sdk-python/prebuilt-components/chat) directly.
+ use [`<CopilotChat>`](/claude-sdk-python/prebuilt-components/chat) directly. For saved
+ conversations and switching between them, the sidebar hosts the
+ [Threads Drawer](/claude-sdk-python/prebuilt-components/copilot-threads-drawer).
+ 
+ ```tsx
+ import { CopilotKit, CopilotSidebar } from "@copilotkit/react-core/v2";
+ import "@copilotkit/react-core/v2/styles.css";
````

**High — Quickstart**

`/claude-sdk-python/quickstart` · route `/quickstart` · under “Quickstart”

21 code lines, 1 heading, 14 prose lines changed. The number of fenced code blocks changed.

````diff
- <IntelligenceOnboardingPrompt
- feature="learning"
- surface="docs_claude_sdk_python_quickstart"
- />
+ ## Start with your coding agent
+ Use this prompt to connect your Claude Agent SDK for Python agent to CopilotKit and verify a working conversation. Your coding agent will follow this guide in your project, or you can work through the manual steps below.
+ 
+ Ask your coding agent to follow the setup steps on this page for your selected framework and frontend.
````

**Medium — Headless UI**

`/claude-sdk-python/custom-look-and-feel/headless-ui` · route `/custom-look-and-feel/headless-ui` · under “Fully Headless UI”

2 headings changed.

````diff
- # Fully Headless UI
+ # Headless UI
````

**Medium — Thread & History Lifecycle**

`/claude-sdk-python/threads-lifecycle` · route `/threads-lifecycle` · under “The lifecycle at a glance”

3 headings, 17 prose lines changed.

````diff
- 2. **Run.** Messages and tool calls stream under that `threadId`. If a server-side store is configured (CopilotKit Intelligence, or a persisting `AgentRunner`), they are persisted as they happen so the thread can be replayed later. A runtime with no persistence layer keeps nothing server-side. See [Threads & Persistence Architecture](/claude-sdk-python/intelligence/threads-explained) for the full server-side model.
+ 2. **Run.** Messages and tool calls stream under that `threadId`. If a server-side store is configured (CopilotKit Intelligence, or a persisting `AgentRunner`), they are persisted as they happen so the thread can be replayed later. A runtime with no persistence layer keeps nothing server-side. See [AG-UI Streams & Framework Threads](/claude-sdk-python/intelligence/threads-explained) for the full server-side model.
- ## Scope Rich Threads to the signed-in user
+ <span id="scope-rich-threads-to-the-signed-in-user" />
+ ## Scope AG-UI Streams to the signed-in user
+ 
- [Connect your runtime to Intelligence](/claude-sdk-python/intelligence/connect-your-runtime) covers the
+ [Connect your runtime to Intelligence](/claude-sdk-python/intelligence/quickstart) covers the
````

**Low — Reasoning Messages**

`/claude-sdk-python/custom-look-and-feel/reasoning-messages` · route `/custom-look-and-feel/reasoning-messages` · under “Reasoning Messages”

7 prose lines changed.

````diff
- > Customize how reasoning (thinking) tokens from models like o1, o3, and o4-mini are displayed.
+ > Customize how reasoning (thinking) tokens from models like `gpt-6-luna` are displayed.
- Some models (like OpenAI's o1, o3, and o4-mini) emit **reasoning tokens**: internal
+ Some models (like `gpt-6-luna`) emit **reasoning tokens**: internal
- | `label` | `string` | `"Thinking…"` while streaming, `"Thought for X seconds"` after |
+ | `label` | `string` | `labels.reasoningMessageThinkingLabel` (`"Thinking…"`) while streaming, `"Thought for X seconds"` after |
+ | `elapsedSeconds` | `number` | Seconds spent reasoning, for building a localized label |
````

**Low — A2UI · Fixed Schema**

`/claude-sdk-python/generative-ui/a2ui/fixed-schema` · route `/generative-ui/a2ui/fixed-schema` · under “Fixed Schema A2UI”

35 prose lines changed.

````diff
- - **Schema-loading** (langgraph-python, langgraph-typescript,
- langgraph-fastapi, llamaindex, crewai-crews, pydantic-ai,
- ms-agent-python, google-adk), the schema is saved as a `.json`
- file next to the agent and loaded once at startup.
+ - **Schema-loading** (including Strands TypeScript), the schema is saved
+ as a `.json` file next to the agent and loaded once at startup.
- - **LLM-driven** (mastra, strands), the agent runs a secondary LLM
- call to produce the operations container per-request. The catalog
````

**Low — Reasoning**

`/claude-sdk-python/generative-ui/reasoning` · route `/generative-ui/reasoning` · under “What is this?”

2 prose lines changed.

````diff
- Some models (OpenAI's `o1`, `o3`, and `o4-mini`, Anthropic's thinking
+ Some models (`gpt-6-luna`, Anthropic's thinking
````

**Low — Sub-Agents**

`/claude-sdk-python/multi-agent/subagents` · route `/multi-agent/subagents` · under “Exposing sub-agents as tools”

9 prose lines changed.

````diff
+ <Callout type="warn">
+ Give every delegation a stable `id` and merge new entries by that `id`. The
+ client sends its copy of shared state back as run input on every run, so a
+ slot that blindly appends whatever it receives — a LangGraph
+ `Annotated[list, operator.add]` reducer, for example — concatenates the
+ entries the client just echoed onto the ones the agent already has, and the
+ log doubles when a thread is continued.
+ </Callout>
````

**Low — Open, close, and feedback**

`/claude-sdk-python/prebuilt-components/chat-controls` · route `/prebuilt-components/chat-controls` · under “Capture message feedback (thumbs up / down)”

12 prose lines changed.

````diff
- slot**. The buttons only render when a handler is provided:
+ slot**. Without Automatic Learning capture, the buttons only render when a
+ handler or a custom thumb slot is provided:
+ 
+ With [Automatic Learning capture](/claude-sdk-python/intelligence/capture-interactions#collect-reply-ratings)
+ on and a Trajectory started, the buttons appear without handlers in every chat
+ that renders messages with `CopilotChatMessageView` inside a
+ `CopilotChatConfigurationProvider`, as `CopilotChat`, `CopilotPopup`, and
````

**Low — Programmatic Control**

`/claude-sdk-python/programmatic-control` · route `/programmatic-control` · under “What is this?”

4 prose lines changed.

````diff
- - `agent.subscribe(subscriber)` — low-level AG-UI event subscription (`onCustomEvent`, `onRunStartedEvent`, `onRunFinalized`, `onRunFailed`, …). Pairs with `copilotkit.runAgent({ agent, forwardedProps: { command: { resume, interruptEvent } } })` to drive interrupt resolution from arbitrary UI.
+ - `agent.subscribe(subscriber)` — low-level AG-UI event subscription (`onCustomEvent`, `onRunStartedEvent`, `onRunFinalized`, `onRunFailed`, …). Pairs with `copilotkit.runAgent({ agent, resume })` for standard AG-UI interrupts, or `copilotkit.runAgent({ agent, forwardedProps: { command: { resume, interruptEvent } } })` for legacy `on_interrupt` custom events, to drive interrupt resolution from arbitrary UI.
- - **`agent.runAgent(options)`** — low-level method on the agent instance. Sends the request to the runtime but does **not** execute frontend tools or chain follow-ups. Reach for this only when you need direct control. (For the interrupt-resume case, use `copilotkit.runAgent({ agent, forwardedProps: { command: { resume, interruptEvent } } })` — see the snippet below — so the subscriber lifecycle still wraps the resumed run.)
+ - **`agent.runAgent(options)`** — low-level method on the agent instance. Sends the request to the runtime but does **not** execute frontend tools or chain follow-ups. Reach for this only when you need direct control. (For the interrupt-resume case, use `copilotkit.runAgent({ agent, resume })` for standard AG-UI interrupts, or `copilotkit.runAgent({ agent, forwardedProps: { command: { resume, interruptEvent } } })` for legacy `on_interrupt` custom events — the snippet below shows the legacy form — so the subscriber lifecycle still wraps the resumed run.)
````

**Low — Voice**

`/claude-sdk-python/voice` · route `/voice` · under “Next.js API route”

42 prose lines changed.

````diff
+ <Callout type="warn" title="Without a service, `/transcribe` answers 503">
+ A runtime with no `transcriptionService` still serves the route, and answers every request
+ `503` with `{ "error": "service_not_configured" }`. The mic button never appears, so the
+ symptom is a chat with no voice input rather than a visible server error — check `/info` for
+ `audioFileTranscriptionEnabled` when voice silently doesn't show up.
+ </Callout>
+ <Callout type="warn" title="Calling `/transcribe` yourself">
+ The chat handles this for you; these are the rules if you post to the route directly. As
````

**Info — Components and surfaces**

`/claude-sdk-python/generative-ui/components` · route `/generative-ui/components`

Now tracked for the first time.

**Info — Components · Catalogs**

`/claude-sdk-python/generative-ui/components/catalogs` · route `/generative-ui/components/catalogs`

Now tracked for the first time.

**Info — Components · Markdown mode**

`/claude-sdk-python/generative-ui/components/markdown-mode` · route `/generative-ui/components/markdown-mode`

Now tracked for the first time.

**Info — Components · Standard catalog**

`/claude-sdk-python/generative-ui/components/standard-catalog` · route `/generative-ui/components/standard-catalog`

Now tracked for the first time.

**Info — Components · State and actions**

`/claude-sdk-python/generative-ui/components/state-and-actions` · route `/generative-ui/components/state-and-actions`

Now tracked for the first time.

**Info — Components · Surfaces**

`/claude-sdk-python/generative-ui/components/surfaces` · route `/generative-ui/components/surfaces`

Now tracked for the first time.

**Info — Components · Theming**

`/claude-sdk-python/generative-ui/components/theming` · route `/generative-ui/components/theming`

Now tracked for the first time.

**Info — Components · Transports**

`/claude-sdk-python/generative-ui/components/transports` · route `/generative-ui/components/transports`

Now tracked for the first time.

**Info — Hashbrown**

`/claude-sdk-python/generative-ui/hashbrown` · route `/generative-ui/hashbrown`

Now tracked for the first time.

**Info — JSON Render**

`/claude-sdk-python/generative-ui/json-render` · route `/generative-ui/json-render`

Now tracked for the first time.

---

## 2026-09-09

### 04:53 UTC — 2 pages, highest severity high

**High — Multimodal Attachments**

`/claude-sdk-python/multimodal-attachments` · route `/multimodal-attachments` · under “Configuration”

9 code lines, 1 heading, 11 prose lines changed. The number of fenced code blocks changed.

````diff
+ | `maxConcurrentUploads` | `number` | `1` | How many files upload at the same time. See [Upload concurrency](#upload-concurrency). |
+ 
+ ## Upload concurrency
+ 
+ When a user attaches several files at once, they upload one at a time by default. Every picked file shows in the attachment queue immediately, whether or not its upload has started.
+ 
+ Set `maxConcurrentUploads` to upload several together — worth raising when your upload endpoint handles parallel requests:
+ 
````

**High — Open, close, and feedback**

`/claude-sdk-python/prebuilt-components/chat-controls` · route `/prebuilt-components/chat-controls` · under “Control the open state from your own UI”

20 code lines, 1 heading, 36 prose lines changed. The number of fenced code blocks changed.

````diff
+ ## Control the open state from your own UI
+ 
+ Pass `open` and `onOpenChange` to `<CopilotSidebar>` or `<CopilotPopup>` to own
+ the open state yourself. This is the controlled pattern: the surface renders
+ whatever `open` says, and every request to open or close (the toggle button,
+ click-outside on the popup) arrives on `onOpenChange` instead of moving the
+ surface directly.
+ 
````

---

---

## 2026-09-04

### 12:16 UTC — 6 pages, highest severity high

**High — Agent Config**

`/claude-sdk-python/agent-config` · route `/agent-config` · under “Make runtime configuration explicit”

36 code lines, 5 prose lines changed. The number of fenced code blocks changed.

````diff
- The backend half is also a single node. Read the latest config context at the top of every run and use it to build the system prompt for that turn:
- 
- ```python title="backend/agent.py — agent reads config and rebuilds the system prompt"
- import json
- 
- CONFIG_KEYS = ("tone", "expertise", "responseLength")
- 
- def read_config_value(entry):
````

**High — Headless Threads**

`/claude-sdk-python/headless-threads` · route `/headless-threads` · under “Configure your Runtime with CopilotKit Intelligence”

2 code lines, 22 prose lines changed.

````diff
- Your `CopilotRuntime` must be connected to CopilotKit Intelligence before the thread UI can list and resume conversations. That connection is the `intelligence` option below — a `CopilotKitIntelligence` instance. If your app came from a CLI starter, this Runtime configuration is generated for you. Otherwise, follow [Connect your runtime to Intelligence](/claude-sdk-python/premium/connect-your-runtime) for the full constructor, then return here to add the headless UI. Thread names are automatically generated by the LLM after the first message — you can disable this with `generateThreadNames: false`.
+ Your `CopilotRuntime` must be connected to CopilotKit Intelligence before the thread UI can list and resume conversations. That connection is the `intelligence` option below — a `CopilotKitIntelligence` instance. If your app came from a CLI starter, this Runtime configuration is generated for you. Otherwise, follow [Connect your runtime to Intelligence](/claude-sdk-python/intelligence/connect-your-runtime) for the full constructor, then return here to add the headless UI. Thread names are automatically generated by the LLM after the first message — you can disable this with `generateThreadNames: false`.
- apiKey: process.env.INTELLIGENCE_API_KEY!,
+ apiKey: process.env.CPK_INTELLIGENCE_API_KEY!,
- CLI-created starters write the cloud-hosted platform URLs and project-scoped `INTELLIGENCE_API_KEY` to `.env`; keep that key server-side. Existing Intelligence-enabled apps should keep their current server-side Runtime configuration. Production self-hosting uses the same React APIs and is deployed with CopilotKit Engineering through [Self-host CopilotKit Intelligence](/claude-sdk-python/premium/self-hosting).
+ CLI `init` and its `create` alias write the cloud-hosted platform URLs,
+ `SL_ENABLED`, project-scoped `CPK_INTELLIGENCE_API_KEY`, and optional
+ `CPK_TELEMETRY_ID` to `.env`.
````

**High — Programmatic Control**

`/claude-sdk-python/programmatic-control` · route `/programmatic-control` · under “Run Claude through an AG-UI endpoint” · in a `tsx` block

2 code lines changed.

````diff
+ "use client";
+ 
````

**High — Shared State**

`/claude-sdk-python/shared-state` · route `/shared-state` · under “Put shared state in the system prompt and tools”

38 code lines, 2 headings, 17 prose lines changed. The number of fenced code blocks changed.

````diff
+ 
+ <Step>
+ ### Register `set_notes` with Claude
+ 
+ This dedicated demo uses the Anthropic Messages API directly. Pass the
+ schema to `client.messages.stream` so Claude can call `set_notes`.
+ 
+ 
````

**High — Thread & History Lifecycle**

`/claude-sdk-python/threads-lifecycle` · route `/threads-lifecycle` · under “The lifecycle at a glance”

2 code lines, 8 prose lines changed.

````diff
- 2. **Run.** Messages and tool calls stream under that `threadId`. If a server-side store is configured (CopilotKit Intelligence, or a persisting `AgentRunner`), they are persisted as they happen so the thread can be replayed later. A runtime with no persistence layer keeps nothing server-side. See [Threads & Persistence Architecture](/claude-sdk-python/premium/threads-explained) for the full server-side model.
+ 2. **Run.** Messages and tool calls stream under that `threadId`. If a server-side store is configured (CopilotKit Intelligence, or a persisting `AgentRunner`), they are persisted as they happen so the thread can be replayed later. A runtime with no persistence layer keeps nothing server-side. See [Threads & Persistence Architecture](/claude-sdk-python/intelligence/threads-explained) for the full server-side model.
- Replay requires a **server-side store to replay from**: CopilotKit Intelligence, or a persisting `AgentRunner` (e.g. the SQLite runner). A self-hosted runtime with no persistence layer has nothing to replay, so `connectAgent()` returns an empty stream and the conversation starts blank. If history isn't restoring, check that a store is configured, not the client code. The [Persistence Architecture](/claude-sdk-python/premium/threads-explained) page covers how replay works server-side.
+ Replay requires a **server-side store to replay from**: CopilotKit Intelligence, or a persisting `AgentRunner` (e.g. the SQLite runner). A self-hosted runtime with no persistence layer has nothing to replay, so `connectAgent()` returns an empty stream and the conversation starts blank. If history isn't restoring, check that a store is configured, not the client code. The [Persistence Architecture](/claude-sdk-python/intelligence/threads-explained) page covers how replay works server-side.
- apiKey: process.env.INTELLIGENCE_API_KEY!,
+ apiKey: process.env.CPK_INTELLIGENCE_API_KEY!,
- [Connect your runtime to Intelligence](/claude-sdk-python/premium/connect-your-runtime) covers the
+ [Connect your runtime to Intelligence](/claude-sdk-python/intelligence/connect-your-runtime) covers the
````

**Low — A2UI · Fixed Schema**

`/claude-sdk-python/generative-ui/a2ui/fixed-schema` · route `/generative-ui/a2ui/fixed-schema` · under “Action handlers (reference)”

2 prose lines changed.

````diff
- [Advanced — Action Handlers](./advanced#action-handlers) for the
+ [Advanced — Action Handlers](/integrations/langgraph/generative-ui/a2ui/advanced#action-handlers) for the
````

---

---
