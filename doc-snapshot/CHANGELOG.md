# Doc drift changelog

What the CopilotKit docs changed under this repo, written by the sync on
`/doc-sync`. Only pages that actually moved are recorded — a sync that finds
everything unchanged writes nothing here at all.

Holds the 3 most recent dated entries. When a change lands on a fourth
date, the oldest entry is dropped. Entries are counted, not aged, so a gap of
weeks between changes does not expire anything.

## 2026-09-15

### 11:31 UTC — 5 pages, highest severity high

**High — Components as Tools**

`/claude-sdk-python/generative-ui/tool-based` · route `/generative-ui/tool-based` · under “Forward browser tools to Claude”

4 code lines, 4 prose lines changed. The number of fenced code blocks changed.

````diff
+ Import the React hook and Zod in the component that registers the tool. This also
+ applies to the built-in agent, which needs no backend tool-registration step.
+ 
+ ```tsx
+ import { useComponent } from "@copilotkit/react-core/v2";
+ import { z } from "zod";
+ ```
+ 
````

**High — Headless Threads**

`/claude-sdk-python/headless-threads` · route `/headless-threads` · under “Driving one agent per thread”

7 code lines, 1 heading, 19 prose lines changed. The number of fenced code blocks changed.

````diff
+ ## Driving one agent per thread
+ 
+ `useThreads` lists and switches threads. To read or run an agent **scoped to a
+ specific thread** — one open tab per thread, for instance — pass all three of
+ `agentId`, `runtimeAgentId` and `threadId` to `useAgent`:
+ 
+ ```tsx
+ const { agent } = useAgent({
````

**High — Threads Drawer**

`/claude-sdk-python/prebuilt-components/copilot-threads-drawer` · route `/prebuilt-components/copilot-threads-drawer` · under “Set up the Threads Drawer” · in a `tsx` block

2 code lines, 22 prose lines changed.

````diff
- <CopilotKitProvider runtimeUrl="/api/copilotkit" publicLicenseKey="ck_pub_...">
+ <CopilotKitProvider runtimeUrl="/api/copilotkit">
- Threads require CopilotKit Intelligence. Without a license key, the drawer shows
- a locked view in place of the list.
+ Threads require CopilotKit Intelligence. The drawer resolves its entitlement
+ through the Runtime, so the credential is server-side configuration rather than a
+ prop on the provider. Which credential you set depends on how you deploy.
+ 
````

**Medium — Tool Call Rendering**

`/claude-sdk-python/generative-ui/tool-rendering` · route `/generative-ui/tool-rendering` · under “Tool inputs and results are separate”

1 heading, 15 prose lines changed.

````diff
+ ### Tool inputs and results are separate
+ 
+ In `useRenderTool`, `parameters` contains the **inputs** the agent sent to the
+ tool. It does not change into the tool's return value when `status` becomes
+ `"complete"`. The completed output arrives separately as `result`, a string.
+ For a tool that returns JSON, parse that string before reading its fields.
+ 
+ For example, `get_weather` might receive `{ "location": "Paris" }` and return
````

**Low — Voice**

`/claude-sdk-python/voice` · route `/voice` · under “Next.js API route”

24 prose lines changed.

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
