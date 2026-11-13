# Doc drift changelog

What the CopilotKit docs changed under this repo, written by the sync on
`/doc-sync`. Only pages that actually moved are recorded — a sync that finds
everything unchanged writes nothing here at all.

Holds the 3 most recent dated entries. When a change lands on a fourth
date, the oldest entry is dropped. Entries are counted, not aged, so a gap of
weeks between changes does not expire anything.

## 2026-11-13

### 11:08 UTC — 23 pages, highest severity high

**High — A2UI · Dynamic Schema**

`/claude-sdk-python/generative-ui/a2ui/dynamic-schema` · route `/generative-ui/a2ui/dynamic-schema` · under “Implement the React renderers” · in a `typescript` block

4 code lines changed.

````diff
- ? "text-emerald-600"
+ ? "text-emerald-600 dark:text-emerald-400"
- ? "text-rose-600"
+ ? "text-rose-600 dark:text-rose-400"
````

**High — A2UI · Fixed Schema**

`/claude-sdk-python/generative-ui/a2ui/fixed-schema` · route `/generative-ui/a2ui/fixed-schema` · under “Implement the React renderers” · in a `typescript` block

16 code lines changed.

````diff
- <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
+ <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500 dark:text-muted-foreground">
- <h3 className="text-base font-semibold leading-none tracking-tight text-neutral-900">
+ <h3 className="text-base font-semibold leading-none tracking-tight text-neutral-900 dark:text-foreground">
- <span className="font-mono text-2xl font-semibold tracking-wider text-neutral-900">
+ <span className="font-mono text-2xl font-semibold tracking-wider text-neutral-900 dark:text-foreground">
- <Separator className="flex-1 bg-neutral-200" />
+ <Separator className="flex-1 bg-neutral-200 dark:bg-border" />
````

**High — Components and surfaces**

`/claude-sdk-python/generative-ui/components` · route `/generative-ui/components` · under “What is this?”

118 code lines, 44 prose lines changed. The number of fenced code blocks changed.

````diff
- With components and surfaces, the agent renders real React or Angular components while it answers:
+ With components and surfaces, the agent renders real React, Angular, React Native or Vue components while it answers:
- These steps add generative UI to a Next.js or Angular app, with an OpenAI model through TanStack AI.
+ These steps add generative UI to a Next.js, Angular, React Native or Vue app, with an OpenAI model through TanStack AI.
- Already have CopilotKit running? Do step 3 only. Your runtime needs no change: when the provider sends a catalog, the runtime gives that run a `render_ui` tool and a short guide. Your agent must pass the run's tools and context to its model, as in step 2. For a LangGraph Python agent, add `CopilotKitMiddleware`.
+ Already have CopilotKit running? Do step 3 only. Your runtime needs no change: when the provider sends a catalog with at least one component, the runtime gives that run a `render_ui` tool and a short guide. Your agent must pass the run's tools and context to its model, as in step 2. For a LangGraph Python agent, add `CopilotKitMiddleware`.
- <Tabs groupId="frontend_framework" items={["React", "Angular"]} persist>
+ <Tabs groupId="frontend_framework" items={["React", "Angular", "React Native", "Vue"]} persist>
````

**High — Components · Catalogs**

`/claude-sdk-python/generative-ui/components/catalogs` · route `/generative-ui/components/catalogs` · under “Create a catalog”

128 code lines, 43 prose lines changed. The number of fenced code blocks changed.

````diff
- <Tabs groupId="frontend_framework" items={["React", "Angular"]} persist>
+ <Tabs groupId="frontend_framework" items={["React", "Angular", "React Native", "Vue"]} persist>
+ <Tab value="React Native">
+ A component of the catalog is a React Native component. It renders native views, and a slot arrives as React nodes:
+ 
+ ```tsx title="src/shopUI.tsx"
+ import { Image, StyleSheet, Text, View } from "react-native";
+ import { z } from "zod";
````

**High — Components · Markdown mode**

`/claude-sdk-python/generative-ui/components/markdown-mode` · route `/generative-ui/components/markdown-mode` · under “What is this?”

18 code lines, 14 prose lines changed. The number of fenced code blocks changed.

````diff
+ <Callout type="info" title="React Native">
+ Markdown mode is not available on React Native yet. `GenerativeUIProvider` from `@copilotkit/react-native/generative-ui` uses the [tool transport](/claude-sdk-python/generative-ui/components/transports#tool-transport) only: `transport: "markdown"` is a type error, and passed from JavaScript it is dropped, with a warning in development.
+ </Callout>
+ 
- <Tabs groupId="frontend_framework" items={["React", "Angular"]} persist>
+ <Tabs groupId="frontend_framework" items={["React", "Angular", "Vue"]} persist>
+ <Tab value="Vue">
+ ```vue title="src/App.vue"
````

**High — Components · Standard catalog**

`/claude-sdk-python/generative-ui/components/standard-catalog` · route `/generative-ui/components/standard-catalog` · under “What is this?”

42 code lines, 25 prose lines changed. The number of fenced code blocks changed.

````diff
+ <Callout type="info" title="React Native">
+ The standard components render DOM, so React Native has no `standardUI` yet. Build a catalog of your own native components with `createGenerativeUI`; see [Catalogs](/claude-sdk-python/generative-ui/components/catalogs) and [Generative UI with your own components](/claude-sdk-python/react-native#generative-ui-with-your-own-components).
+ </Callout>
+ 
- <Tabs groupId="frontend_framework" items={["React", "Angular"]} persist>
+ <Tabs groupId="frontend_framework" items={["React", "Angular", "Vue"]} persist>
+ <Tab value="Vue">
+ ```vue
````

**High — Components · State and actions**

`/claude-sdk-python/generative-ui/components/state-and-actions` · route `/generative-ui/components/state-and-actions` · under “Show live app state”

175 code lines, 52 prose lines changed. The number of fenced code blocks changed.

````diff
- <Tabs groupId="frontend_framework" items={["React", "Angular"]} persist>
+ <Tabs groupId="frontend_framework" items={["React", "Angular", "React Native", "Vue"]} persist>
+ <Tab value="React Native">
+ ```tsx title="src/shopUI.tsx"
+ const cartSchema = z.object({
+ items: z.array(z.object({ productId: z.string(), quantity: z.number() })),
+ });
+ 
````

**High — Components · Surfaces**

`/claude-sdk-python/generative-ui/components/surfaces` · route `/generative-ui/components/surfaces` · under “What is this?”

149 code lines, 59 prose lines changed. The number of fenced code blocks changed.

````diff
- - **The chat.** Always there. The agent can use every component of the catalog.
- - **A page target.** An area of your page that you mark with `GenerativeUISurface`, or `<copilot-generative-ui-surface>` in Angular. The agent sees it only while it is on screen.
+ - **The chat.** Always there. The agent can use every component of the catalog. On React Native, you draw chat surfaces yourself, with `GenerativeUIActivity`; see [Chat surfaces on React Native](#chat-surfaces-on-react-native). The agent is offered the chat target even when the app shows no chat, so a React Native app that renders only `GenerativeUISurface` targets, or only the prebuilt `CopilotChat` (which does not draw surfaces yet), never shows a surface aimed at the chat.
+ - **A page target.** An area of your page that you mark with `GenerativeUISurface`, or `<copilot-generative-ui-surface>` in Angular. The agent sees it only while it is mounted.
- <Tabs groupId="frontend_framework" items={["React", "Angular"]} persist>
+ <Tabs groupId="frontend_framework" items={["React", "Angular", "React Native", "Vue"]} persist>
+ <Tab value="React Native">
+ ```tsx title="src/FeaturedProducts.tsx"
````

**High — Components · Theming**

`/claude-sdk-python/generative-ui/components/theming` · route `/generative-ui/components/theming` · under “What is this?”

35 code lines, 18 prose lines changed. The number of fenced code blocks changed.

````diff
- <Tabs groupId="frontend_framework" items={["React", "Angular"]} persist>
+ <Tabs groupId="frontend_framework" items={["React", "Angular", "Vue"]} persist>
+ <Tab value="Vue">
+ ```vue
+ <script setup lang="ts">
+ import { CopilotKitProvider } from "@copilotkit/vue/v2";
+ import { standardUI, type GenerativeUITheme } from "@copilotkit/vue/v2/generative-ui";
+ 
````

**High — Components · Transports**

`/claude-sdk-python/generative-ui/components/transports` · route `/generative-ui/components/transports` · under “What is this?”

18 code lines, 29 prose lines changed. The number of fenced code blocks changed.

````diff
- The agent must send the UI to the browser somehow. Some agents are good at tool calls. Others only stream text, or you build their prompt yourself. A **transport** is the way the UI travels:
+ The agent must send the UI to the app somehow: the browser, or a React Native app. Some agents are good at tool calls. Others only stream text, or you build their prompt yourself. A **transport** is the way the UI travels:
- Both transports use the same catalogs, surfaces, and components. Only the path between the agent and the browser changes.
+ Both transports use the same catalogs, surfaces, and components. Only the path between the agent and the app changes.
- | Checked before the browser gets it | yes, by the runtime, and again in the browser | in the browser |
+ | Checked before the app gets it | yes, by the runtime, and again in the app | in the app |
- <Tabs groupId="frontend_framework" items={["React", "Angular"]} persist>
+ <Tabs groupId="frontend_framework" items={["React", "Angular", "React Native", "Vue"]} persist>
````

**High — Reasoning**

`/claude-sdk-python/generative-ui/reasoning` · route `/generative-ui/reasoning` · under “Custom reasoning rendering” · in a `typescript` block

10 code lines changed.

````diff
- className="my-2 rounded-xl border border-[#DBDBE5] bg-[#BEC2FF1A] px-3.5 py-2.5 text-sm"
+ className="my-2 rounded-xl border border-[#DBDBE5] bg-[#BEC2FF1A] px-3.5 py-2.5 text-sm dark:border-border"
- <div className="flex items-center gap-2 font-medium text-[#010507]">
- <span className="inline-block rounded-full border border-[#BEC2FF] bg-white px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-[#57575B]">
+ <div className="flex items-center gap-2 font-medium text-[#010507] dark:text-foreground">
+ <span className="inline-block rounded-full border border-[#BEC2FF] bg-white px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-[#57575B] dark:bg-card dark:text-muted-foreground">
- <span className="text-[#57575B]">
+ <span className="text-[#57575B] dark:text-muted-foreground">
````

**High — Sub-Agents**

`/claude-sdk-python/multi-agent/subagents` · route `/multi-agent/subagents` · under “Rendering a live delegation log” · in a `typescript` block

30 code lines changed.

````diff
- className="w-full h-full flex flex-col bg-white rounded-2xl shadow-sm border border-[#DBDBE5] overflow-hidden"
+ className="w-full h-full flex flex-col bg-white rounded-2xl shadow-sm border border-[#DBDBE5] overflow-hidden dark:bg-card dark:border-border"
- <div className="flex items-center justify-between px-6 py-3 border-b border-[#E9E9EF] bg-[#FAFAFC]">
+ <div className="flex items-center justify-between px-6 py-3 border-b border-[#E9E9EF] bg-[#FAFAFC] dark:border-border dark:bg-muted">
- <span className="text-lg font-semibold text-[#010507]">
+ <span className="text-lg font-semibold text-[#010507] dark:text-foreground">
- className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-[#BEC2FF] bg-[#BEC2FF1A] text-[#010507] text-[10px] font-semibold uppercase tracking-[0.12em]"
+ className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-[#BEC2FF] bg-[#BEC2FF1A] text-[#010507] text-[10px] font-semibold uppercase tracking-[0.12em] dark:text-foreground"
````

**High — Shared State**

`/claude-sdk-python/shared-state` · route `/shared-state` · under “Rendering shared state in the UI” · in a `typescript` block

10 code lines changed.

````diff
- <code className="font-mono text-[11px] text-[#010507]">
+ <code className="font-mono text-[11px] text-[#010507] dark:text-foreground">
- className="text-sm text-[#838389] italic min-h-[160px] flex items-center justify-center text-center px-4 border border-dashed border-[#E9E9EF] rounded-xl bg-[#FAFAFC]"
+ className="text-sm text-[#838389] italic min-h-[160px] flex items-center justify-center text-center px-4 border border-dashed border-[#E9E9EF] rounded-xl bg-[#FAFAFC] dark:text-muted-foreground dark:border-border dark:bg-muted"
- className="space-y-2 text-sm text-[#010507]"
+ className="space-y-2 text-sm text-[#010507] dark:text-foreground"
- className="flex gap-2 rounded-lg border border-[#E9E9EF] bg-[#FAFAFC] px-3 py-2"
+ className="flex gap-2 rounded-lg border border-[#E9E9EF] bg-[#FAFAFC] px-3 py-2 dark:border-border dark:bg-muted"
````

**Info — Markdown Rendering**

`/claude-sdk-python/custom-look-and-feel/markdown` · route `/custom-look-and-feel/markdown`

Now tracked for the first time.

**Info — A2UI**

`/claude-sdk-python/generative-ui/a2ui` · route `/generative-ui/a2ui`

Now tracked for the first time.

**Info — Components · Adopt from A2UI**

`/claude-sdk-python/generative-ui/components/from-a2ui` · route `/generative-ui/components/from-a2ui`

Now tracked for the first time.

**Info — MCP Apps**

`/claude-sdk-python/generative-ui/mcp-apps` · route `/generative-ui/mcp-apps`

Now tracked for the first time.

**Info — Open Generative UI**

`/claude-sdk-python/generative-ui/open-generative-ui` · route `/generative-ui/open-generative-ui`

Now tracked for the first time.

**Info — Governed Action Approval UI**

`/claude-sdk-python/human-in-the-loop/governed-actions` · route `/human-in-the-loop/governed-actions`

Now tracked for the first time.

**Info — Headless Interrupts**

`/claude-sdk-python/human-in-the-loop/headless` · route `/human-in-the-loop/headless`

Now tracked for the first time.

**Info — Human in the Loop**

`/claude-sdk-python/human-in-the-loop/index` · route `/human-in-the-loop`

Now tracked for the first time.

**Info — Pausing the Agent for Input**

`/claude-sdk-python/human-in-the-loop/useInterrupt` · route `/human-in-the-loop/useInterrupt`

Now tracked for the first time.

**Info — WebMCP**

`/claude-sdk-python/webmcp` · route `/webmcp`

Now tracked for the first time.

---

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
