# Doc drift changelog

What the CopilotKit docs changed under this repo, written by the sync on
`/doc-sync`. Only pages that actually moved are recorded — a sync that finds
everything unchanged writes nothing here at all.

Holds the 3 most recent dated entries. When a change lands on a fourth
date, the oldest entry is dropped. Entries are counted, not aged, so a gap of
weeks between changes does not expire anything.

## 2026-08-24

### 09:52 UTC — 2 pages, highest severity high

**High — Introduction**

`/claude-sdk-python` · routes `/`, `/doc-sync` · under “Configure your environment” · in a `plaintext` block

27 code lines changed.

````diff
- ANTHROPIC_MODEL=claude-sonnet-4-6
+ ANTHROPIC_MODEL=claude-opus-4-8
- ANTHROPIC_MODEL=claude-sonnet-4-6
+ ANTHROPIC_MODEL=claude-opus-4-8
- "model": os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6"),
+ "model": os.getenv("ANTHROPIC_MODEL", "claude-opus-4-8"),
- ExperimentalEmptyAdapter,
- copilotRuntimeNextJSAppRouterEndpoint,
````

**High — Quickstart**

`/claude-sdk-python/quickstart` · route `/quickstart` · under “Configure your environment” · in a `plaintext` block

27 code lines changed.

````diff
- ANTHROPIC_MODEL=claude-sonnet-4-6
+ ANTHROPIC_MODEL=claude-opus-4-8
- ANTHROPIC_MODEL=claude-sonnet-4-6
+ ANTHROPIC_MODEL=claude-opus-4-8
- "model": os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6"),
+ "model": os.getenv("ANTHROPIC_MODEL", "claude-opus-4-8"),
- ExperimentalEmptyAdapter,
- copilotRuntimeNextJSAppRouterEndpoint,
````

---

## 2026-08-21

### 15:16 UTC — 13 pages, highest severity high

**High — Introduction**

`/claude-sdk-python` · routes `/`, `/doc-sync` · under “Expose Claude Agent SDK over AG-UI” · in a `python` block

10 code lines, 1 heading, 13 prose lines changed.

````diff
- from fastapi import FastAPI, Request
+ from fastapi import FastAPI
- async def run_agent(request: Request) -> StreamingResponse:
+ async def run_agent(input_data: RunAgentInput) -> StreamingResponse:
- input_data = RunAgentInput(**(await request.json()))
- # Every failure — malformed request body or streaming —
- # becomes a graceful RUN_ERROR, and the full detail is
- # logged server-side rather than only sent to the client.
````

**High — Agent Config**

`/claude-sdk-python/agent-config` · route `/agent-config` · under “When to use this”

16 code lines, 1 heading, 20 prose lines changed. The number of fenced code blocks changed.

````diff
- <WhenFrameworkHas flag="agent_config_pattern" equals="shared-state">
+ 
- </WhenFrameworkHas>
- <WhenFrameworkHas flag="agent_config_pattern" equals="runtime-properties">
- ## How it works
- The runtime owns the agent in-process, so config travels through frontend
- runtime properties rather than agent state. There's no separate backend service
- to push state into: the typed object becomes the input to the agent factory
````

**High — A2UI · Fixed Schema**

`/claude-sdk-python/generative-ui/a2ui/fixed-schema` · route `/generative-ui/a2ui/fixed-schema` · under “Compositional schemas”

39 code lines, 3 headings, 84 prose lines changed. The number of fenced code blocks changed.

````diff
- renderer props are typed as their resolved values (plain `z.string()`,
- not a path-or-literal union).
+ your renderer receives the resolved value and never sees the path — but
+ the *definition* still has to declare that prop as a literal-or-binding
+ union, because that union is the only signal the binder has that the
+ prop is bindable. See [Declare the component
+ definitions](#declare-the-component-definitions).
+ ### Install the renderer package
````

**High — Tool Call Rendering**

`/claude-sdk-python/generative-ui/tool-rendering` · route `/generative-ui/tool-rendering` · under “What is this?”

148 code lines, 1 heading, 27 prose lines changed. The number of fenced code blocks changed.

````diff
- **Free course:** See this pattern built end-to-end in [Build Interactive Agents with Generative UI](https://www.deeplearning.ai/short-courses/build-interactive-agents-with-generative-ui/) — a free DeepLearning.AI short course taught by CopilotKit's CEO covering the full Generative UI spectrum (Controlled, Declarative, and Open-Ended).
+ **Free course:** See this pattern built end-to-end in [Build Interactive
+ Agents with Generative
+ UI](https://www.deeplearning.ai/short-courses/build-interactive-agents-with-generative-ui/)
+ — a free DeepLearning.AI short course taught by CopilotKit's CEO covering the
+ full Generative UI spectrum (Controlled, Declarative, and Open-Ended).
- ```typescript
- // src/app/demos/tool-rendering/page.tsx
````

**High — Programmatic Control**

`/claude-sdk-python/programmatic-control` · route `/programmatic-control` · under “What is this?”

76 code lines, 2 headings, 47 prose lines changed. The number of fenced code blocks changed.

````diff
- Every example on this page is pulled from two live cells:
- `headless-complete` (full chat surface, shown here for the message-send
- path) and `interrupt-headless` (button-driven interrupt resolver, shown
- here for the subscribe + resume path).
+ The send-and-stop example below is intentionally self-contained. The
+ later subscription and interrupt examples are pulled from the live
+ `interrupt-headless` cell.
- Wrap Claude Agent SDK once, then trigger runs from a custom UI with
````

**High — Quickstart**

`/claude-sdk-python/quickstart` · route `/quickstart` · under “Expose Claude Agent SDK over AG-UI” · in a `python` block

10 code lines, 1 heading, 13 prose lines changed.

````diff
- from fastapi import FastAPI, Request
+ from fastapi import FastAPI
- async def run_agent(request: Request) -> StreamingResponse:
+ async def run_agent(input_data: RunAgentInput) -> StreamingResponse:
- input_data = RunAgentInput(**(await request.json()))
- # Every failure — malformed request body or streaming —
- # becomes a graceful RUN_ERROR, and the full detail is
- # logged server-side rather than only sent to the client.
````

**High — Render state in your app**

`/claude-sdk-python/shared-state/rendering-in-app` · route `/shared-state/rendering-in-app` · under “The pattern” · in a `tsx` block

29 code lines, 6 prose lines changed.

````diff
+ import { useEffect } from "react";
+ const INITIAL_CANVAS_STATE: CanvasState = {
+ title: "Project launch",
+ items: [
+ { id: "research", label: "Research user needs", done: true },
+ { id: "prototype", label: "Build a prototype", done: false },
+ ],
+ };
````

**Low — Frontend Tools**

`/claude-sdk-python/frontend-tools` · route `/frontend-tools` · under “Frontend Tools”

9 prose lines changed.

````diff
+ 
+ 
+ 
+ <Callout type="info" title="See this in Inspector">
+ Open Inspector on localhost. Go to **Agents**, then **Frontend Tools**.
+ Your tool and its schema are listed.
+ 
+ More detail: [Inspector](/claude-sdk-python/inspector).
````

**Low — Human in the Loop**

`/claude-sdk-python/human-in-the-loop` · route `/human-in-the-loop` · under “HITL Overview”

9 prose lines changed.

````diff
+ 
+ 
+ 
+ <Callout type="info" title="See this in Inspector">
+ Open Inspector on localhost. Go to **Agents**, then **Frontend Tools**.
+ Your tool and its schema are listed.
+ 
+ More detail: [Inspector](/claude-sdk-python/inspector).
````

**Low — Open, close, and feedback**

`/claude-sdk-python/prebuilt-components/chat-controls` · route `/prebuilt-components/chat-controls` · under “Capture message feedback (thumbs up / down)”

11 prose lines changed.

````diff
- slot**. The buttons only render when a handler is provided:
+ When the slot is rendered through `CopilotChatMessageView`, a live assistant
+ message created by a direct AG-UI `TEXT_MESSAGE_START` can also include that
+ event's opaque `rawEvent` value. The join happens when the thumbs callback runs;
+ canonical messages and future run input stay unchanged. Chunk, snapshot,
+ persisted, legacy, and direct `CopilotChatAssistantMessage` paths don't provide
+ this callback metadata.
+ 
````

**Low — Shared State**

`/claude-sdk-python/shared-state` · route `/shared-state` · under “What is shared state?”

8 prose lines changed.

````diff
+ 
+ <Callout type="info" title="See this in Inspector">
+ Open Inspector on localhost. Open a thread, then click **State**.
+ Agent state updates here as the run proceeds.
+ 
+ More detail: [Inspector](/claude-sdk-python/inspector).
+ </Callout>
+ 
````

**Low — Agent Read-Only Context**

`/claude-sdk-python/shared-state/agent-readonly` · route `/shared-state/agent-readonly` · under “Agent Read-Only Context”

9 prose lines changed.

````diff
+ 
+ 
+ 
+ <Callout type="info" title="See this in Inspector">
+ Open Inspector on localhost. Go to **Agents**, then **Context**.
+ The values you publish with `useAgentContext` appear here.
+ 
+ More detail: [Inspector](/claude-sdk-python/inspector).
````

**Low — Voice**

`/claude-sdk-python/voice` · route `/voice` · under “Next.js API route”

4 prose lines changed.

````diff
- <WhenFrameworkHas flag="voice_backend_pattern" equals="adk-fastapi-agent-path">
- For the Google ADK showcase, agent runs take one more hop: this Next.js route registers the `voice-demo` agent with an `HttpAgent` pointed at `${AGENT_URL}/voice`. The Python `agent_server.py` mounts registered ADK agents with `add_adk_fastapi_endpoint(app, ..., path=f"/{agent_name}")`, so the browser talks to `/api/copilotkit-voice` while the Next.js runtime forwards voice-demo agent runs to the backend `/voice` endpoint.
- </WhenFrameworkHas>
+ 
````

---

---

## 2026-08-17

### 17:33 UTC — 4 pages, highest severity high

**High — CSS Customization** · _local snapshot edit, not an upstream change_

`/claude-sdk-python/custom-look-and-feel/css` · route `/custom-look-and-feel/css` · under “Reference”

6 code lines, 4 prose lines changed.

````diff
+ (`@copilotkit/react-ui`). The newer **v2** components
+ (`@copilotkit/react-core/v2`) are Tailwind + shadcn-based and use a
+ separate set of design tokens. See [v2 design
+ tokens](#v2-design-tokens-shadcn) below.
+ /* Dark mode is keyed off a `.dark` ancestor */
+ .dark [data-copilotkit] {
+ --background: oklch(0.145 0 0);
+ --foreground: oklch(0.985 0 0);
````

**High — Multimodal Attachments** · _local snapshot edit, not an upstream change_

`/claude-sdk-python/multimodal-attachments` · route `/multimodal-attachments` · under “Custom upload handler” · in a `tsx` block

14 code lines changed.

````diff
- 
+ <CopilotChat
+ attachments={{
+ enabled: true,
+ onUpload: async (file) => {
+ const buffer = await file.arrayBuffer();
+ const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
+ return {
````

**Low — Frontend Tools** · _local snapshot edit, not an upstream change_

`/claude-sdk-python/frontend-tools` · route `/frontend-tools` · under “When should I use this?”

1 prose line changed.

````diff
+ - Read or modify React component state
````

**Low — Quickstart** · _local snapshot edit, not an upstream change_

`/claude-sdk-python/quickstart` · route `/quickstart` · under “Quickstart”

1 prose line changed.

````diff
+ - **Start from scratch** to scaffold the full Claude Agent SDK Python showcase.
````

### 17:05 UTC — 3 pages, highest severity high

**High — Programmatic Control** · _local snapshot edit, not an upstream change_

`/claude-sdk-python/programmatic-control` · route `/programmatic-control` · under “Run Claude through an AG-UI endpoint” · in a `typescript` block

1 code line changed.

````diff
+ const [input, setInput] = useState("");
````

**Low — A2UI · Dynamic Schema** · _local snapshot edit, not an upstream change_

`/claude-sdk-python/generative-ui/a2ui/dynamic-schema` · route `/generative-ui/a2ui/dynamic-schema` · under “The 3-file split”

3 prose lines changed.

````diff
- | `renderers.tsx` | React implementations keyed by the same names. TypeScript enforces that every
+ | `renderers.tsx` | React implementations keyed by the same names. TypeScript enforces that every definition has a renderer. |
+ | `catalog.ts` | `createCatalog(definitions, renderers, { includeBasicCatalog: true })`: merges your custom components with CopilotKit's built-in primitives. |
````

**Low — Voice** · _local snapshot edit, not an upstream change_

`/claude-sdk-python/voice` · route `/voice` · under “Voice”

1 prose line changed.

````diff
+ You have a working chat surface and you want users to be able to speak instead of type. By the end of this guide, the chat composer will sprout a mic button, recorded audio will be transcribed by the runtime, and the transcript will auto-send to the agent like any other message.
````

### 13:07 UTC — 1 page, highest severity low

**Low — Multimodal Attachments** · _local snapshot edit, not an upstream change_

`/claude-sdk-python/multimodal-attachments` · route `/multimodal-attachments` · under “Supported file types”

1 prose line changed.

````diff
+ | **Image** | `image/*` | Thumbnail with lightbox | Supported by most vision-capable models (GPT-4o, Claude, etc.) |
````
