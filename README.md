# CopilotKit + Claude Agent SDK (Python) Test Suite

A navigable, working test harness for the CopilotKit ↔ Claude Agent SDK (Python) integration — one route per doc page, each running the thing its page teaches, or reporting precisely why it cannot.

| | |
|---|---|
| **Doc sync date** | Machine-maintained — `doc-snapshot/manifest.json` → `syncedAt`, rewritten on every sync |
| **Doc root tracked** | <https://docs.copilotkit.ai/claude-sdk-python> |
| **Frontend packages** | `@copilotkit/react-core` `@copilotkit/runtime` `@copilotkit/a2ui-renderer` `@copilotkit/voice` `^1.69.0` · `maplibre-gl` `^5` (§9.20) · `@json-render/*` `0.18.0` + `zod4` · `@hashbrownai/*` `0.5.0-beta.4` · `@ag-ui/client` `@ag-ui/core` `1.0.2` (exact, plus npm `overrides`; §9.23) · Next `16.3.0` · React `19.2.8` |
| **Backend packages** | `ag-ui-claude-sdk>=0.1.5` · `claude-agent-sdk>=0.2.132` · `ag-ui-protocol>=0.1.19` · `anthropic>=0.68.0` |
| **Routes** | 41 total — 18 ✅ working · 5 ⚠️ partial · 6 ❌ broken · 2 reference · 10 🚧 not yet run live |
| **CI** | none |

---

## 2. Overview

The Claude Agent SDK integration runs a Python agent behind a FastAPI endpoint that speaks the AG-UI protocol, and CopilotKit's Next.js runtime forwards browser conversations to it. Unlike the other Python integrations, the agent does not call the Anthropic API in-process: the Claude Agent SDK drives the Claude CLI as a subprocess, which is why `ClaudeAgentAdapter` is built once at module scope rather than per request.

This repo turns every page under [docs.copilotkit.ai/claude-sdk-python](https://docs.copilotkit.ai/claude-sdk-python) that it tracks into a route with a live surface, the repo code behind it, and a link to the page it is testing — so the published sample and the running implementation can be diffed on the spot.

It is a QA tool, so it reports failures as findings rather than hiding them. **Four routes are marked ❌ Broken, and all four trace back to the same upstream reason** — see [§9](#9-known-issues--docvsimplementation-discrepancies). No missing doc code has been invented to paper over that; the published code sits in `backend/src/agents/doc_reference/` exactly as printed, unwired, with its gaps annotated.

---

## 3. Architecture

```
Browser
  │  chat surface from @copilotkit/react-core/v2
  ▼
Next.js  ·  localhost:3000
  │  /api/copilotkit/[[...slug]]        → all 25 agents · Intelligence · threads
  │  /api/copilotkit-voice/[[...slug]]  → voice only, v2 runtime + TranscriptionService
  │  /api/copilotkit-declarative-gen-ui → A2UI dynamic-schema only
  │  CopilotRuntime resolves agentId → HttpAgent(`${AGENT_URL}/${agentId}`)
  ▼  AG-UI over HTTP (SSE back)
FastAPI  ·  localhost:8000              (Python 3.11+)
  │  one POST endpoint per agent, at /{agent_id}
  │  each holds a module-scope ClaudeAgentAdapter
  ▼
Claude Agent SDK  →  Claude CLI subprocess  →  Anthropic API
```

**Backend language: Python / FastAPI.** Two processes, two ports. Sessions are in-process, so conversations reset when the Python server restarts.

Three things `ClaudeAgentAdapter` does on every run, none of them documented, all load-bearing here:

- **Frontend tools.** It reads `input_data.tools`, converts each through `convert_agui_tool_to_claude_sdk`, packs them into a `create_sdk_mcp_server("ag_ui", …)` server and auto-grants `mcp__ag_ui__<name>`. This is why `useFrontendTool`, `useComponent`, `useHumanInTheLoop` and A2UI dynamic-schema all work with `"tools": []` on the adapter.
- **State and context.** `build_state_context_addendum` appends `input_data.context` and `input_data.state` to the system prompt, and when state is present it registers an `ag_ui_update_state` tool whose calls become `StateSnapshotEvent`s.
- **Reasoning.** It maps Claude's `thinking_delta` blocks onto AG-UI `REASONING_MESSAGE_*` events.

What it has **no** documented path for is registering a tool the *backend* owns and executes. That single gap is what breaks the six Broken routes.

---

## 4. Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | 20+ | Next 16 requires it |
| Python | 3.11+ | `ag-ui-claude-sdk` floor |
| `uv` | any recent | <https://docs.astral.sh/uv/getting-started/installation/> |
| npm | bundled with Node | the lockfile in `frontend/` is npm's |
| Anthropic API key | — | <https://console.anthropic.com/settings/keys> · **required** |
| OpenAI API key | — | **optional**, mic transcription on `/voice` only |
| CopilotKit Intelligence account | — | **optional**, the three Rich Threads routes only. Free developer tier. |

Everything except Rich Threads runs with no CopilotKit account. Threads are
stored and synced server-side, so those three routes need an Intelligence
project — and they are marked ⚠️ Partial rather than ✅ Working for exactly that
reason. Nothing in this repo mocks a thread list: a faked one would be a false
pass.

The Claude Agent SDK spawns the Claude CLI as a subprocess. `claude-agent-sdk` vendors what it needs, so there is no separate CLI install step — but the first run of each agent is slower while that subprocess starts.

---

## 5. Setup

```bash
# 1 — clone
git clone <this-repo> claude-sdk-python
cd claude-sdk-python

# 2 — frontend deps
cd frontend && npm install && cd ..

# 3 — backend deps
uv sync --directory backend

# 4 — environment (see .env.example for the annotated original)
cp .env.example backend/.env        # then trim to the backend block
cp .env.example frontend/.env.local # then trim to the frontend block
```

There are **two** env files because there are two processes.

**`backend/.env`**

| Variable | Required | What it does |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ | Read by the Claude Agent SDK. Without it every run returns an authentication error. |
| `ANTHROPIC_MODEL` | — | Model for all 25 agents. Defaults to `claude-opus-4-8`, the Quickstart's current value. |
| `AGENT_HOST` / `AGENT_PORT` | — | Where the agent server listens. Default `localhost:8000`. Change together with `AGENT_URL` or not at all. |
| `LOG_LEVEL` | — | `DEBUG` shows the adapter assembling its MCP server from frontend tools each run — useful when debugging tool routes. |

**`frontend/.env.local`**

| Variable | Required | What it does |
|---|---|---|
| `AGENT_URL` | — | Where the Next runtime forwards runs. Defaults to `http://localhost:8000`. |
| `OPENAI_API_KEY` | — | Whisper transcription for the `/voice` mic. Everything else works without it. |
| `INTELLIGENCE_API_KEY` | — | Puts the runtime in Intelligence mode. This is what makes threads **work**. Not `NEXT_PUBLIC_` — it must stay server-side. |
| `COPILOTKIT_LICENSE_TOKEN` | — | A **separate** credential. `/info` reports a licence status from it, and `<CopilotThreadsDrawer>` renders its locked view unless that status is valid. Set both or the drawer shows a locked panel over a working thread store. |
| `NEXT_PUBLIC_DEMO_USER_ID` / `_NAME` | — | The identity `identifyUser` keys threads on. Change it in a second browser profile to watch two thread lists diverge. |
| `NEXT_PUBLIC_COPILOTKIT_INSPECTOR` | — | Set to `off` to disable the inspector overlay app-wide. On for localhost otherwise. |

**Ports:** frontend `3000`, backend `8000`.

---

## 6. Running the project

There is no single command — start each process in its own terminal.

```bash
# terminal 1 — agent server
uv run --directory backend python src/agent_server.py
```

Successful startup:

```
INFO:__main__:Mounted 25 agents: a2ui-fixed-schema, agent-config, agentic_chat, …
INFO:     Uvicorn running on http://localhost:8000 (Press CTRL+C to quit)
```

If `ANTHROPIC_API_KEY` is unset you will also see a warning naming it — the server still starts, but every run will fail.

```bash
# terminal 2 — frontend
cd frontend && npm run dev
```

```
▲ Next.js 16.3.0
- Local:  http://localhost:3000
✓ Ready in 1.8s
```

Smoke test both at once:

```bash
curl -s http://localhost:8000/health | python3 -m json.tool
# {"status": "ok", "agents": [...], "count": 25}
```

Then open **<http://localhost:3000>** and go to `/quickstart` first — it is the shortest confirmation the two processes are talking.

---

## 7. What to expect — walkthrough per section

Every route has a notes page at its path and a chrome-free live surface at `<path>/demo-chat`. The notes page carries the same Try-it / Pass / Fail block summarised here, plus the repo source and the doc link.

### Getting Started

**`/`** — Introduction. Orientation, the agent roster, and an up-front statement of where the docs run out. No agent.

**`/quickstart`** — The bring-your-own-agent path end to end: `ClaudeAgentAdapter` behind FastAPI, reached by an `HttpAgent`.
*Try:* "Tell me in one sentence what this app can do."
*Pass:* tokens stream in a word at a time, markdown renders.
*Fail:* an error banner — the Python server is down, or `ANTHROPIC_API_KEY` is unset.

### Prebuilt Components

**`/prebuilt-components/chat`** — `<CopilotChat>`, the root primitive, filling its container.
*Try:* "Write a short sonnet about AI." *Pass:* suggestion pills before the first message, then a streamed reply filling the pane. *Fail:* a chat collapsed to zero height means the container has no height to fill.

**`/prebuilt-components/sidebar`** — the docked variant, a sibling of your content rather than a child.
*Try:* toggle it. *Pass:* the panel slides without moving the text underneath. *Fail:* content jumps, or the panel overlays like a popup.

**`/prebuilt-components/popup`** — the floating launcher, with a `labels` override.
*Try:* look at the composer. *Pass:* the placeholder reads "Ask the popup anything…", which is the `labels` prop landing. *Fail:* the default placeholder.

**`/prebuilt-components/chat-controls`** — `useCopilotChatConfiguration` for modal state, plus thumbs-up/down callbacks.
*Try:* "Say something I can rate", then thumb it. *Pass:* the two buttons toggle the sidebar and track `isModalOpen`; ratings append to the on-page log. *Fail:* buttons render but do nothing — no provider in the tree owns modal state.

### Rich Threads

All three need CopilotKit Intelligence — see Prerequisites. Without it chat
still works and the thread list has nothing to list.

**`/prebuilt-components/copilot-threads-drawer`** — ⚠️ **Partial.** The drop-in
switcher: a drawer and a chat inside one shared configuration provider, with no
active-thread state of your own.
*Try:* send a message, press New Conversation, send another, then click back to
the first row, then press the header's own "New conversation" button. *Pass:*
two auto-named rows; clicking one replays that conversation; the header button
clears the chat and deselects the row. *Fail:* a locked panel means no valid licence token; an empty list
with a working chat means no API key.

**`/headless-threads`** — ⚠️ **Partial.** The same store behind your own list,
including the rename action the drawer does not surface.
*Try:* send a message, press Rename, then Archive, then New conversation.
*Pass:* the row title becomes "Renamed", archiving hides it, and New
conversation clears the chat. *Fail:* if New conversation appears to do nothing,
the chat is reusing its mount-time id — the route explains the two-step reset.

**`/threads-lifecycle`** — ⚠️ **Partial.** Where a `threadId` comes from and what
moves it, with the live id and its `explicit` flag on screen.
*Try:* send a message, press New chat, then pick a conversation and compare Open
conversation against Set id, no replay. *Pass:* the id changes on New chat;
`explicit: true` replays history and `explicit: false` shows the welcome screen.
*Fail:* buttons that log a warning and move nothing mean something is passing an
authoritative `threadId` prop — the setters no-op when the id is prop-controlled.

### Custom Look and Feel

**`/custom-look-and-feel/css`** — three levels of re-skinning at once: v2 design tokens, `.copilotKit*` class hooks, and `labels`.
*Try:* "Hello." *Pass:* cream paper background, a monospace user message with an ember left border and a `→` prefix, header reading "My Copilot". *Fail:* default styling — `theme.css` did not load.

**`/custom-look-and-feel/slots`** — three slots replaced with whole components.
*Try:* "Say hello." *Pass:* a gradient welcome card, then every assistant reply in a tinted card tagged "slot", and an indigo disclaimer. *Fail:* default chrome on any of the three. The page's newer `toolCallsView` example is shown on the notes page as compiled source only; nothing on the demo exercises it.

**`/custom-look-and-feel/markdown`** — ⚠️ **Partial, not yet run live.** The `markdownRenderer` slot in its three forms (Streamdown `components` map, class string, full replacement), switchable on one chat.
*Try:* "Reply with a '## Links' heading, then a markdown link to https://copilotkit.ai and a short **bold** sentence", in each mode. *Pass:* `components` gives an uppercase heading with an orange rule and an orange wavy link (no `node` or `data-streamdown` attribute on the `<a>`); `class-string` makes the block smaller; `replace` shows the raw markdown in a `<pre>`. *Fail:* all modes look the same, or the `<a>` carries `node="[object Object]"`.

**`/custom-look-and-feel/headless-ui`** — a chat with no CopilotKit chrome, built from `useAgent` + `useCopilotKit` + `useRenderToolCall`.
*Try:* "Give me three ideas for a weekend project." *Pass:* right-aligned user bubble, "Thinking…", then a streamed reply. *Fail:* the message goes out but nothing streams back.

**`/custom-look-and-feel/reasoning-messages`** — the built-in reasoning card with two sub-slots replaced.
*Try:* the two-trains problem. *Pass:* a 🧠 header with Hide/Show, body in grey monospace with a blinking `▊`, emoji flipping to 💡 when thinking ends. *Fail:* no card at all — the model answered without a thinking block; ask something that needs working out.

### Input Modalities

**`/multimodal-attachments`** — drag-and-drop attachments as AG-UI content parts.
*Try:* drop a PNG, ask "what is in this image?". *Pass:* a thumbnail with lightbox, and Claude describes it. Dropping a `.txt` adds an `invalid-type` line to the red banner. *Fail:* no paperclip in the composer.

**`/voice`** — a second runtime carrying a `TranscriptionService`, which is what makes the composer grow a mic.
*Try:* click 🎙 "Try a sample audio", or the mic. *Pass:* the sample button drops a sentence in the composer; the mic records, transcribes, and auto-sends. *Fail:* no mic button means `/info` is not advertising transcription. A mic error means `OPENAI_API_KEY` is unset — the sample button still works.

### Generative UI

**`/generative-ui/reasoning`** — the whole reasoning card replaced via the slot.
*Try:* the three-boxes puzzle. *Pass:* an amber banner tagged REASONING, always expanded. *Fail:* the default grey card.

**`/generative-ui/tool-based`** — `useComponent` registering a React component as a tool.
*Try:* "Chart quarterly revenue: Q1 120, Q2 145, Q3 138, Q4 190." *Pass:* a bar chart renders inline. *Fail:* a markdown table instead — the model answered in prose.

**`/generative-ui/tool-rendering`** — ⚠️ **Partial.** `get_weather` reaches Claude through a repo-authored MCP bridge, not doc code (§9.1).
*Try:* "What's the weather in San Francisco?" *Pass:* a `WeatherCard` renders — loading first, then 68° / Sunny — followed by a one-sentence summary. *Fail:* prose with no card; check the backend log for the `weather` MCP server.

**`/generative-ui/state-rendering`** — ❌ **Broken.** Same cell and same gap as State Streaming.
*Try:* "Draft a one-paragraph product brief for a habit tracker." *Pass (as a report):* empty canvas with a LIVE badge, then the whole brief at once. *Fail:* an empty canvas after the turn — the state write never happened at all.

**`/generative-ui/a2ui`** — 📖 **Reference.** The A2UI overview: its two setup snippets (catalog on the provider, `a2ui` on the runtime), the Python helper list and the surface colour variables, each shown verbatim next to the route that actually runs that path.
*Try:* open it and follow the links. *Pass:* the snippets match the page, and the Dynamic Schema / Fixed Schema links lead to the live demos. *Fail:* none — no live surface.

**`/generative-ui/a2ui/dynamic-schema`** — a bring-your-own-catalog dashboard designed per request by a secondary LLM.
*Try:* "Build me a dashboard for a fictional SaaS: MRR, churn, active seats, and a bar chart of signups by month." *Pass:* a progress indicator, then Card / Metric / DataTable / PieChart / BarChart appearing one at a time. *Fail:* a markdown table, or raw JSON in the chat.

**`/generative-ui/a2ui/fixed-schema`** — ⚠️ **Partial.** `display_flight` reaches Claude through a repo-authored MCP bridge; the schema JSON and two constants are repo-supplied (§9.1, §9.4).
*Try:* "Find me a flight from SFO to JFK." *Pass:* a flight card mounts — Flight Details, SFO → JFK, airline badge, price, Book button — then a one-sentence reply. *Fail:* prose with no card; check the backend log for the `flights` MCP server.

### Generative UI · JSON Render and Hashbrown

Two ways to let the agent draw a dashboard without any tool call. In both, the agent's whole reply is JSON, and the chat's `assistantMessage` slot is replaced with a renderer that turns it into components. Both are 🚧 **not yet run live in the browser**. Each agent was run directly and returned exactly the JSON shape its renderer expects.

**`/generative-ui/json-render`**: a `{ root, elements }` spec rendered through a typed `@json-render/react` registry (MetricCard, BarChart, PieChart).
*Try:* "Show me the sales dashboard with metrics and a revenue chart". *Pass:* once the reply finishes, a metric card with a bar chart under it replaces the bubble. *Fail:* raw JSON left in the chat, meaning the reply did not parse.

**`/generative-ui/hashbrown`**: a `{ ui: [...] }` envelope parsed while it streams by `@hashbrownai/react`, so the dashboard builds up piece by piece (Markdown, metric, pieChart, barChart, dealCard).
*Try:* the "Sales dashboard" suggestion. *Pass:* a heading, a metric card, then two charts appear one after another while the reply is still streaming. *Fail:* nothing until the end (no progressive parsing), or an empty message (the reply did not match the kit's schema).

### Generative UI · Open-ended

**`/generative-ui/mcp-apps`** — ❌ **Broken — reference only.** The Code tab's agent, runtime and page are shown verbatim and not wired up: each imports something no page publishes.
*Try:* nothing to run. *Pass (today):* the page renders the published code and its gap callout. §9.23.

**`/generative-ui/open-generative-ui`** — ❌ **Broken — reference only.** No agent is published; the runtime, sandbox functions, prompt hints and the two frontend fragments are shown as published and not wired up.
*Try:* nothing to run. *Pass (today):* the page renders the published code and its gap callout. §9.24.

### Generative UI · Components and surfaces

The eight routes below are all 🚧 **Not yet run live**. They compile, serve, and reach their own runtime (`/api/copilotkit-components`, which lists all nine agents on `/info`), but nobody has yet chatted through them against Claude. Every demo brings its own provider because `generativeUI` is a provider prop. The section is marked Experimental on the doc (A2UI 1.0, spec `cbaa5ee`).

**`/generative-ui/components`**: the standard catalog on the provider and a plain `CopilotChat`. The agent answers with UI through the runtime-injected `render_ui` tool.
*Try:* "Compare the Starter, Team, and Enterprise plans in a table" (the doc's own test prompt). *Pass:* a real rendered table inside the reply. *Fail:* a markdown table, meaning `render_ui` never reached Claude or it chose prose. A one-line rejection inside the message means the runtime's validation refused an operation.

**`/generative-ui/components/surfaces`**: `GenerativeUISurface` targets outside the chat: `featured` (allowlisted to two components, with a fallback), a `recommendations-<id>` per selected product, and `sidebar-notes` (`autoScroll={false}`). The provider carries the doc's `errorBoundary`.
*Try:* "Show the three cheapest products in the featured row", then "Show me the featured products again." *Pass:* the dashed fallback row becomes a ProductGrid; the second prompt deletes it and the fallback returns. *Fail:* the grid lands in the chat instead, or the on-page errorBoundary log fills with rejections.

**`/generative-ui/components/catalogs`**: the doc's `shopUI` from `createGenerativeUI`, extended (`extends`) with the standard catalog plus `cartUI`/`Panel`/`Hero`, and `exportA2UICatalog` output shown live on the right.
*Try:* "Show me the three cheapest products in a product grid." *Pass:* your ProductCards (image, name, $price) in a two-column grid; the export panel lists them. *Fail:* standard Cards instead, or "exportA2UICatalog threw" in the panel.

**`/generative-ui/components/standard-catalog`**: `standardUI.omit(["Map","Video","HtmlView"])`, `overrides: { Card }`, plus an app `ProductCard`.
*Try:* "Put a short welcome message inside a Card", then "Show me a map of Paris." *Pass:* the Card has the override's large rounded corners, and the map request produces anything but a map. *Fail:* a default Card, or a map rendering despite the omit.

**`/generative-ui/components/state-and-actions`**: a real cart in React state, published with `useGenerativeUIState` and bound into `ProductCard.inCart`; `addToCart` implemented with `useGenerativeUIFunction`; a `PlanButton` whose `onChoose` event goes to the agent; a writable `CheckoutForm.email`.
*Try:* "Show ProductCards for the lamp, the chair and the mug", then click Add to cart. *Pass:* `addToCart(…, 1)` is logged, the cart updates, and the card's "in cart" count rises. The left-side "+" buttons move the same count. *Fail:* the count never moves (state or bind is not reaching the surface), or a click logs nothing (the event did not match the function).

**`/generative-ui/components/theming`**: the doc's `theme` (amber accent, 10px radius, a `dark` block) with three switches: provider theme, `.dark` ancestor, and a violet `.a2ui-surface` CSS override.
*Try:* "Show a Card with a title, a sentence, and two Buttons", then flip the switches. *Pass:* amber buttons; dark panel under `.dark`; violet only once the provider theme is off (the theme beats CSS). *Fail:* violet with the theme on, or no change at all.

**`/generative-ui/components/transports`**: the tool transport with `agentIds: ["gen-ui-transports"]`, shown next to an identical agent left out of the list.
*Try:* the plans prompt in both columns. *Pass:* UI on the left, text on the right. *Fail:* both columns the same.

**`/generative-ui/components/markdown-mode`**: `transport: "markdown"`. The agent writes ````a2ui` fences in its reply, and a `featured` side surface catches ````a2ui target=featured`.
*Try:* "Give me a plan estimator I can play with: a seats slider from 1 to 50 and the monthly price." *Pass:* a live Card with a working Slider mid-reply, with no visible JSON. *Fail:* raw JSON lines in a code block, which means fences are not being parsed.

**`/generative-ui/components/from-a2ui`**: the migration from the v0.9 `a2ui` renderer: the page's "After" `createGenerativeUI` catalog (`Airport`, `Arrow`, standard catalog) on the provider, with the Before code shown as text. **Broken — reference only:** the page publishes no agent, and none was added; the catalog is type-checked, not mounted.
*Try:* "Show a flight card from SFO (San Francisco) to JFK (New York) with a Book button". *Pass:* two Airport blocks with an arrow between them and a standard Button. *Fail:* text only, or a rejection naming a v0.9 shape.

### App Control

**`/frontend-tools`** — a tool the agent calls that runs in the browser.
*Try:* "Make the background a warm sunset gradient." *Pass:* the background transitions, the printed CSS updates, the agent confirms. *Fail:* the agent describes a gradient instead of applying one. The page's `useFrontendTools` (list of tools) snippet is shown on the notes page only.

**`/webmcp`** — ❌ **Broken as published.** `useFrontendTool` with `webmcp: { annotations: { readOnlyHint: true } }` mirrors `searchOrders` onto `document.modelContext`; a second page registers the same tool on a bare `CopilotKitCore` with no agent.
*Try:* in Chrome 149+ with WebMCP enabled, open `/webmcp/demo-chat` and call `searchOrders` with `status: "open"` from the Model Context Tool Inspector. *Pass (as a report):* the tool is listed with its schema and read-only hint; calling it fails with `ReferenceError: searchOrders is not defined`. *Fail:* no tool listed (browser lacks `document.modelContext`, or the option did not register).

**`/human-in-the-loop`** — `useHumanInTheLoop` suspending the run behind a picker.
*Try:* "Book an intro call with the sales team." *Pass:* a four-slot picker appears inline and the run visibly pauses; picking swaps it for a confirmation and the agent's next message names your time. *Fail:* the agent invents a time without asking, or picking does nothing.

**`/human-in-the-loop/useInterrupt`** — ❌ **Broken as published.** The page's published `interrupt_agent` prompt on a Claude adapter, with the page's Approve/Cancel `useInterrupt` example mounted beside the chat.
*Try:* "Book a call with the sales team to discuss pricing." *Pass (as a report):* a text reply and no picker: the `schedule_meeting` frontend tool the prompt names is not printed on the page, and no interrupt is emitted. *Fail:* a picker appears (something registered the tool).

**`/human-in-the-loop/headless`** — ❌ **Reference-only.** The page's one snippet is missing for this framework and it prints no agent, so the route only summarises the pattern and links to the HITL routes.
*Try:* open it. *Pass:* the broken callout and links render. *Fail:* none — there is no live surface.

**`/human-in-the-loop/governed-actions`** — ⚠️ **Partial, not yet run live.** Both of the page's approval variants on one chat: the `useHumanInTheLoop` tool `approve_governed_action` and the `useInterrupt` card.
*Try:* "Before you apply a 15% discount to order 1042, ask me to approve it with approve_governed_action (verdict require_approval)." *Pass:* an approval card with summary, tool, reference and arguments; Approve or Reject sends `{ approved, actionId, reference }` back and the agent replies to match. *Fail:* a text-only reply (no tool call), or buttons that do nothing.

**`/programmatic-control`** — ⚠️ **Partial.** `addMessage` / `runAgent` / `stopAgent` / `subscribe`, no chat component.
*Try:* "Ask for something long", then Stop. *Pass:* the reply pane fills with no chat on the page and the event log shows `onRunStartedEvent` → `onRunFinalized`; Stop cuts it short and still finalizes. *Fail:* buttons do nothing and the log stays empty.

### Shared State

**`/shared-state`** — ❌ **Broken.** Only the UI-to-agent direction carries.
*Try:* set name and tone on the left, ask "what do you know about me?"; then "remember that I prefer morning meetings". *Pass (as a report):* the agent uses your name and tone, but the Agent Scratch pad stays empty. *Fail:* preferences also ignored, meaning the surviving half has regressed and state is not reaching the prompt at all.

**`/shared-state/rendering-in-app`** — the same state rendered as the main view, chat docked beside it.
*Try:* "Remember that I ship on Fridays." *Pass:* the note appears in the main-view card, not the chat, and clearing from the canvas writes back. *Fail:* notes only inside the chat.

**`/shared-state/streaming`** — ❌ **Broken.** Two things missing, not one.
*Try:* "Write a short essay about why small teams ship faster." *Pass (as a report):* an empty canvas with a LIVE badge, then the whole document at once. *Fail:* nothing in the canvas at all after the turn.

**`/shared-state/agent-readonly`** — `useAgentContext` as a one-way UI → agent channel.
*Try:* "What's my name and what timezone am I in?", change the name, ask again. *Pass:* answered from current values without being told, and the second answer reflects the edit. *Fail:* the agent says it does not know who you are.

### Multi-Agent

**`/multi-agent/subagents`** — ❌ **Broken.** The supervisor has nothing to call.
*Try:* "Write a short brief on why remote teams struggle with onboarding." *Pass (as a report):* the supervisor describes the research → write → critique plan and writes the brief itself; the three chips stay dim and the log stays empty.

### Agent Config

**`/agent-config`** — ⚠️ **Partial.** The frontend half works; the published backend half cannot.
*Try:* "Explain what a database index is", then switch to casual + beginner + detailed and ask again. *Pass:* two visibly different answers to one question. *Fail:* identical answers — the config never reached the prompt.

---

## 8. Testing checklist / current status

Legend: ✅ Working · ⚠️ Partial · ❌ Broken · 📖 Reference · 🚧 Implemented, not yet run live

| Doc page | Route | Status | Notes |
|---|---|---|---|
| [Introduction](https://docs.copilotkit.ai/claude-sdk-python) | `/` | 📖 | Landing page — orientation and the agent roster. |
| [Quickstart](https://docs.copilotkit.ai/claude-sdk-python/quickstart?agent=bring-your-own) | `/quickstart` | ✅ | Page pins `@ag-ui/client@1.0.2`; `package.json` now matches, with `overrides` (§9.23). |
| [CopilotChat](https://docs.copilotkit.ai/claude-sdk-python/prebuilt-components/chat) | `/prebuilt-components/chat` | ✅ | Page resolves but is absent from the doc sidebar. |
| [CopilotSidebar](https://docs.copilotkit.ai/claude-sdk-python/prebuilt-components/sidebar) | `/prebuilt-components/sidebar` | ✅ | Off-sidebar. `MainContent`/`Suggestions` supplied locally. |
| [CopilotPopup](https://docs.copilotkit.ai/claude-sdk-python/prebuilt-components/popup) | `/prebuilt-components/popup` | ✅ | Off-sidebar. |
| [Chat controls](https://docs.copilotkit.ai/claude-sdk-python/prebuilt-components/chat-controls) | `/prebuilt-components/chat-controls` | ✅ | Off-sidebar. Doc's `analytics.track` replaced by an on-page log. |
| [Threads Drawer](https://docs.copilotkit.ai/claude-sdk-python/prebuilt-components/copilot-threads-drawer) | `/prebuilt-components/copilot-threads-drawer` | ⚠️ | Needs Intelligence + a licence token. Locked view without one. Demo adds the page's `NewConversationButton`; sidebar host (`YourMainContent` undefined), controlled-id, CSS-parts and `agentId` snippets shown as text. |
| [Headless Threads](https://docs.copilotkit.ai/claude-sdk-python/headless-threads) | `/headless-threads` | ⚠️ | Same precondition. The two-step "New conversation" reset joins two doc fragments. The thread-scoped `useAgent` snippet is shown as text, not run. |
| [Thread & History Lifecycle](https://docs.copilotkit.ai/claude-sdk-python/threads-lifecycle) | `/threads-lifecycle` | ⚠️ | Same precondition. User-scoping, first-message thread creation and the checkpointer comparison are out of scope locally. |
| [CSS customization](https://docs.copilotkit.ai/claude-sdk-python/custom-look-and-feel/css) | `/custom-look-and-feel/css` | ✅ | Off-sidebar. One doc snippet is v1 and not implemented — see §9. |
| [Slots](https://docs.copilotkit.ai/claude-sdk-python/custom-look-and-feel/slots) | `/custom-look-and-feel/slots` | ✅ | Off-sidebar. The three slot components are declared by the doc, not defined. The `toolCallsView` snippet is type-checked but not mounted (the slots agent has no tools). |
| [Markdown Rendering](https://docs.copilotkit.ai/claude-sdk-python/custom-look-and-feel/markdown) | `/custom-look-and-feel/markdown` | ⚠️ | Not yet run live. `my-link`/`my-heading` CSS borrowed from google-adk (the page never defines them). Reuses `chat-slots`. |
| [Headless UI](https://docs.copilotkit.ai/claude-sdk-python/custom-look-and-feel/headless-ui) | `/custom-look-and-feel/headless-ui` | ✅ | Off-sidebar. `headless-simple` only; `headless-complete` is not published in full. |
| [Reasoning Messages](https://docs.copilotkit.ai/claude-sdk-python/custom-look-and-feel/reasoning-messages) | `/custom-look-and-feel/reasoning-messages` | ✅ | Off-sidebar. Runs on the adapter's native thinking support, not the doc's 300-line agent. |
| [Multimodal Attachments](https://docs.copilotkit.ai/claude-sdk-python/multimodal-attachments) | `/multimodal-attachments` | ✅ | The one page with no backend half, correctly. |
| [Voice](https://docs.copilotkit.ai/claude-sdk-python/voice) | `/voice` | ✅ | Mic needs `OPENAI_API_KEY`; sample-audio button works without it. |
| [Reasoning](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/reasoning) | `/generative-ui/reasoning` | ✅ | `ReasoningBlock` is one of the few components published in full. |
| [Components as Tools](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/tool-based) | `/generative-ui/tool-based` | ✅ | Works because `useComponent` registers a *frontend* tool. Headless `CopilotChatToolCallsView` snippet is a fragment (`assistantMessage`, `allMessages` undefined); shown as text. |
| [Tool Call Rendering](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/tool-rendering) | `/generative-ui/tool-rendering` | ⚠️ | `get_weather` works via a repo-authored in-process MCP bridge (`weather_mcp_server.py`), not doc code — §9.1. Grouping snippets shown as text (`MyToolRow`, `ToolTimeline` undefined) — §9.24. |
| [State Rendering](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/state-rendering) | `/generative-ui/state-rendering` | ❌ | Same cell and gap as State Streaming. |
| [A2UI](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/a2ui) | `/generative-ui/a2ui` | 📖 | Overview. Snippets type-checked verbatim (`myCatalog`, `myAgent`, `children` undefined); Python helpers need the `copilotkit` package this backend lacks (§9.23). |
| [A2UI · Dynamic Schema](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/a2ui/dynamic-schema) | `/generative-ui/a2ui/dynamic-schema` | ✅ | Catalog auto-injects `generate_a2ui` as a frontend tool. `renderers.tsx` has no imports, and its runtime route needs a catch-all segment — see §9. |
| [A2UI · Fixed Schema](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/a2ui/fixed-schema) | `/generative-ui/a2ui/fixed-schema` | ⚠️ | `display_flight` works via a repo-authored MCP bridge (`flights_mcp_server.py`); `flight_schema.json`, `SURFACE_ID`, `CATALOG_ID` are repo-supplied — §9.1, §9.4. |
| [JSON Render](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/json-render) | `/generative-ui/json-render` | 🚧 | Not yet run live in the browser; the agent returns a spec that passes `parseSpec`. Page prints 4 of 13 files, the rest from its showcase source (§9.22). |
| [Hashbrown](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/hashbrown) | `/generative-ui/hashbrown` | 🚧 | Not yet run live in the browser; the agent returns a valid `ui` envelope. Page prints 3 of 11 files, the rest from its showcase source (§9.22). |
| [MCP Apps](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/mcp-apps) | `/generative-ui/mcp-apps` | ❌ | Reference only: Code-tab agent, runtime and page verbatim, not wired up (unpublished `normalize_claude_model`, `createClaudeHttpAgent`, `./chat`). Intelligence snippet shown as text (§9.23). |
| [Open Generative UI](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/open-generative-ui) | `/generative-ui/open-generative-ui` | ❌ | Reference only: no agent published (prompt hints only); runtime, sandbox functions and frontend fragments kept as published, not wired up (§9.24). |
| [Components and surfaces](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/components) | `/generative-ui/components` | 🚧 | Not yet run live. Standard catalog + `render_ui`. Runtime is the doc's config pointed at the Python agents instead of its TanStack/OpenAI sample. |
| [Surfaces](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/components/surfaces) | `/generative-ui/components/surfaces` | 🚧 | Not yet run live. `ProductRow`/`Product` and the product data are repo-supplied (the doc defines neither). |
| [Catalogs](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/components/catalogs) | `/generative-ui/components/catalogs` | 🚧 | Not yet run live. Doc catalog type-checks as published. `cartUI`, `Hero`, `Panel` are repo-supplied. Valibot tab not implemented. |
| [Standard catalog](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/components/standard-catalog) | `/generative-ui/components/standard-catalog` | 🚧 | Not yet run live. `ProductCard`/`productSchema` repo-supplied. |
| [State and actions](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/components/state-and-actions) | `/generative-ui/components/state-and-actions` | 🚧 | Not yet run live. Two published `shopUI` variants merged. `Cart` store and `PlanButton` repo-supplied. Event context rides `forwardedProps`, which the adapter whitelists. |
| [Theming](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/components/theming) | `/generative-ui/components/theming` | 🚧 | Not yet run live. `.dark` goes on a wrapper, not `<html>`. `mapStyle` not set. |
| [Transports](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/components/transports) | `/generative-ui/components/transports` | 🚧 | Not yet run live. Second agent added to show `agentIds` scoping. |
| [Markdown mode](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/components/markdown-mode) | `/generative-ui/components/markdown-mode` | 🚧 | Not yet run live. Default `sendContext` only. The `sendContext: false` Python fragment is in `doc_reference/markdown_mode.py`, unwired. |
| [Frontend Tools](https://docs.copilotkit.ai/claude-sdk-python/frontend-tools) | `/frontend-tools` | ✅ | The `useFrontendTools` list snippet is a fragment (`reports`, `navigate` undefined); shown as text, not run. |
| [Adopt from A2UI](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/components/from-a2ui) | `/generative-ui/components/from-a2ui` | ❌ | Reference only: no agent/backend on the page, none added; After catalog type-checked, not mounted. `Airport`/`Arrow` borrowed from aws-strands-py (§9.23). |
| [Frontend Tools](https://docs.copilotkit.ai/claude-sdk-python/frontend-tools) | `/frontend-tools` | ✅ | |
| [HITL Overview](https://docs.copilotkit.ai/claude-sdk-python/human-in-the-loop/index) | `/human-in-the-loop` | ✅ | Pattern 1 only; `useInterrupt` needs LangGraph. The sidebar now links the overview at `/human-in-the-loop/index` (same content as the bare URL). |
| [Pausing the Agent for Input](https://docs.copilotkit.ai/claude-sdk-python/human-in-the-loop/useInterrupt) | `/human-in-the-loop/useInterrupt` | ❌ | Frontend snippet missing on the page (`schedule_meeting` never printed); prompt-only agent; interrupts need `defer_tools`, not on the page (§9.23). |
| [Headless Interrupts](https://docs.copilotkit.ai/claude-sdk-python/human-in-the-loop/headless) | `/human-in-the-loop/headless` | ❌ | Reference-only: no code on the page for this framework (§9.24). |
| [Governed Action Approval UI](https://docs.copilotkit.ai/claude-sdk-python/human-in-the-loop/governed-actions) | `/human-in-the-loop/governed-actions` | ⚠️ | Not yet run live. Tool-call half only; no backend/policy engine/`executeSideEffect` published, verdicts are the model's; the `useInterrupt` card never fires (§9.25). |
| [WebMCP](https://docs.copilotkit.ai/claude-sdk-python/webmcp) | `/webmcp` | ❌ | `searchOrders` called, never defined (handler throws). No agent on the page, so no chat. Needs a WebMCP browser (§9.23). |
| [Human-in-the-Loop](https://docs.copilotkit.ai/claude-sdk-python/human-in-the-loop) | `/human-in-the-loop` | ✅ | Pattern 1 only; `useInterrupt` needs LangGraph. |
| [Programmatic Control](https://docs.copilotkit.ai/claude-sdk-python/programmatic-control) | `/programmatic-control` | ⚠️ | The page's promise-based section is a build placeholder — see §9. |
| [Shared State](https://docs.copilotkit.ai/claude-sdk-python/shared-state) | `/shared-state` | ❌ | UI→agent works; agent→UI does not. `set_notes` unreachable and the `ag_ui_update_state` substitute does not carry notes back. |
| [Render state in your app](https://docs.copilotkit.ai/claude-sdk-python/shared-state/rendering-in-app) | `/shared-state/rendering-in-app` | ✅ | Framework-neutral page; follows the google-adk layout. |
| [State Streaming](https://docs.copilotkit.ai/claude-sdk-python/shared-state/streaming) | `/shared-state/streaming` | ❌ | Backend tool **and** a raw Anthropic stream the adapter never exposes. |
| [Agent Read-Only Context](https://docs.copilotkit.ai/claude-sdk-python/shared-state/agent-readonly) | `/shared-state/agent-readonly` | ✅ | The adapter does the doc's context loop for you. |
| [Sub-Agents](https://docs.copilotkit.ai/claude-sdk-python/multi-agent/subagents) | `/multi-agent/subagents` | ❌ | Delegation tools unreachable; the delegation-flow region is unpublished. |
| [Agent Config](https://docs.copilotkit.ai/claude-sdk-python/agent-config) | `/agent-config` | ⚠️ | Frontend half works; the published backend half reads a channel the frontend never writes. |
| [Doc root](https://docs.copilotkit.ai/claude-sdk-python) | `/doc-sync` | 📖 | Not a doc page. Reports drift between `doc-snapshot/` and the live docs. |

Pages in the framework's doc sidebar that this repo does **not** track: CLI, Build with agents, the four Concepts pages, Agentic Protocols, the six Threads pages, the seven Runtime pages, Deploy to any runtime, Authentication, Inspector, VS Code Extension, the four Intelligence Platform pages, AWS AgentCore, Telemetry.

---

## 9. Known issues / doc-vs-implementation discrepancies

### 9.1 The backend tool bridge is incomplete — this is the big one

Four routes fail for one reason, and two more work only through a repo-authored bridge. The Quickstart's `main.py` is the only complete backend the framework publishes, and it builds a `ClaudeAgentAdapter` with `"tools": []`. Six pages then publish a **backend** tool — an Anthropic schema plus a Python handler — and no page shows how to register one against that adapter.

The Quickstart's ["Backend tools and state"](https://docs.copilotkit.ai/claude-sdk-python/quickstart) section looks like the missing link. Its `run_with_claude_agent_sdk` excerpt opens by calling six things the docs never define:

`_build_sdk_tools` · `_set_state` · `_normalize_claude_agent_sdk_model` · `_with_initial_state` · `COPILOTKIT_MCP_SERVER_NAME` · `COPILOTKIT_TOOL_PREFIX`

...plus the `ExecuteTool` type, and without any import block. The surrounding prose says the tools reach the model through `create_sdk_mcp_server`, so the shape is guessable — but guessing is not this harness's job.

**Affected:** `/generative-ui/state-rendering`, `/shared-state`, `/shared-state/streaming`, `/multi-agent/subagents`.

**The two bridges this repo does ship.** `/generative-ui/tool-rendering` and `/generative-ui/a2ui/fixed-schema` are the exceptions, and both are marked ⚠️ rather than ✅ because the bridge is repo-authored. `backend/src/agents/weather_mcp_server.py` wraps the page's verbatim `GET_WEATHER_TOOL` / `get_weather` (still in `doc_reference/tool_rendering.py`, untouched) with the Claude Agent SDK's own primitives:

- `tool(name, description, input_schema)` accepts the snippet's JSON Schema dict as-is; the handler unpacks `args["location"]`, calls `get_weather`, and returns the result as a JSON text block.
- `create_sdk_mcp_server(name="weather", tools=[...])` makes it an in-process server. `build_adapter` passes it through as `mcp_servers`, and the adapter merges it with its own `ag_ui` server instead of replacing it.
- The agent runs with `permission_mode: "dontAsk"`, so `mcp__weather__get_weather` must also be in `allowed_tools` or the call is denied silently.

The adapter strips the `mcp__weather__` prefix before emitting `TOOL_CALL_START`, so the page's `useRenderTool({ name: "get_weather" })` matches unchanged.

`backend/src/agents/flights_mcp_server.py` does the same for `display_flight`: it wraps the page's `DISPLAY_FLIGHT_TOOL` / `_display_flight_operations` from `doc_reference/a2ui_fixed.py` and returns the `a2ui_operations` container as a JSON text block. That text becomes the `TOOL_CALL_RESULT` content, which the runtime's A2UI middleware scans for an operations array, so the surface mounts with no further plumbing. This route needed three more repo-supplied values on top of the bridge — see §9.4.

The same shape would unblock the other four routes; it is not applied there because those pages also have gaps beyond registration (state write-back, a raw Anthropic stream, unpublished delegation flow), and the point of this harness is to report what the docs ship.

### 9.2 The feature pages target a backend that is never published

Related but distinct. The backend snippets on the feature pages are not written against `ClaudeAgentAdapter` at all — they are fragments of a hand-rolled streaming loop over the raw Anthropic Messages API. The [Frontend Tools](https://docs.copilotkit.ai/claude-sdk-python/frontend-tools) page says so outright: its demo server calls the Messages API directly for runs with frontend tools (the page now adds that the published `ClaudeAgentAdapter` needs no conversion, which is what `/frontend-tools` runs on). That loop is never published in full, so there is no second server to drop these fragments into either. Every one is reproduced under `backend/src/agents/doc_reference/`.

### 9.3 `renderers.tsx` has no import block, on both A2UI pages

[Fixed schema](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/a2ui/fixed-schema)'s `renderers.tsx` begins at `export const renderers: CatalogRenderers<Definitions> = {` with nothing above it, then uses `Card`, `Badge`, `Separator`, `UIButton`, the `s()` helper, and the `CatalogRenderers` and `Definitions` types — none imported or defined. [Dynamic schema](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/a2ui/dynamic-schema) has the same defect at greater length: add `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Button`, `DonutChart`, `AnimatedBar`, `useSeenIndices`, `CHART_COLORS`, `CHART_TOOLTIP_STYLE` and eight Recharts exports.

Here the real CopilotKit exports are imported from `@copilotkit/a2ui-renderer`; the design-system primitives are rebuilt in `frontend/src/app/generative-ui/a2ui/_components/primitives.tsx`, whose header flags it as the one self-defined file in the A2UI routes.

### 9.4 A2UI fixed schema is missing three more pieces

`flight_schema.json` is loaded by the published code and never published, and neither is `booked_schema.json`. `SURFACE_ID` and `CATALOG_ID` are used by `_display_flight_operations` and defined on neither side of the page — `CATALOG_ID` can be recovered from the page's own `catalog.ts`, `SURFACE_ID` cannot. The page also documents the Book button as inert: `a2ui.render` in the Python SDK does not yet accept `action_handlers`.

Because the route now runs through the §9.1 bridge, all three are supplied in `doc_reference/a2ui_fixed.py` and marked `NOT DOC CODE`: `CATALOG_ID = "copilotkit://flight-fixed-catalog"` (from `catalog.ts`), `SURFACE_ID = "flight-fixed-schema"` (this repo's value, shared with the TypeScript harness), and the two JSON files under `doc_reference/a2ui_schemas/`, copied from the Google ADK harness whose schema matches the component tree the page diagrams. `booked_schema.json` is shipped for completeness and never loaded.

### 9.5 Programmatic Control ships a build placeholder

This framework's interrupt pattern is promise-based, so [the page](https://docs.copilotkit.ai/claude-sdk-python/programmatic-control) selects its "Resolving a frontend tool call from a button" branch — and where the snippet should be, the published markdown contains:

```
<!-- snippet skipped: region 'headless-promise-primitives' missing in claude-sdk-python::interrupt-headless -->
```

The prose then refers to "the resulting `{ pending, resolveActive }` pair" that nothing on the page produces.

### 9.6 Agent Config's two halves use different channels

[The page](https://docs.copilotkit.ai/claude-sdk-python/agent-config) publishes a frontend half using `useAgentContext` (which travels as `input_data.context`) and a backend half, `read_properties(forwarded_props)`, which reads a field the frontend never writes. Even if the frontend used provider `properties`, `ClaudeAgentAdapter` filters `forwarded_props` through `ALLOWED_FORWARDED_PROPS`, and `tone` / `expertise` / `responseLength` are all outside that whitelist. The route works on the frontend half alone, because the adapter folds context into the system prompt itself.

### 9.7 An unpublished module is imported by three pages

`agents.claude_agent_sdk_adapter` is named on the Quickstart and imported by the Reasoning Messages page (`normalize_claude_model`) and the Sub-Agents page (same). Its contents are never published, so both files are unrunnable as printed.

### 9.8 The CSS page carries a v1 snippet

Its inline-style example imports `CopilotKitCSSProperties` from `@copilotkit/react-ui` and sets `--copilot-kit-primary-color`. Both are v1 — this integration installs `@copilotkit/react-core` only, and the v2 token is `--primary`. It is the one block on that page this repo does not implement. Its two font blocks also set `font-family: "Arial, sans-serif"` as a single quoted string rather than a stack, which matches no family.

### 9.9 The chat-controls open/close button never renders as written

[The page](https://docs.copilotkit.ai/claude-sdk-python/prebuilt-components/chat-controls) shows an `OpenChatButton` that reads `useCopilotChatConfiguration()` and returns `null` when there is no `setModalOpen`, with a comment saying one exists when a provider in the tree owns modal state and that *"the prebuilt CopilotPopup / CopilotSidebar create it for you"*.

They create it **below** themselves, not around themselves. `CopilotSidebar` builds its `CopilotChatConfigurationProvider` internally — twice, in fact, since `CopilotChat` and `CopilotSidebarView` each make one — so the context reaches only the sidebar's own subtree. A button placed beside the sidebar, which is exactly what the page's "drive the chat from your own UI" framing calls for, is outside it and renders nothing. `CopilotKitProvider` supplies no configuration provider either; the v1 `<CopilotKit>` wrapper does, via `CopilotKitInternal`, which is likely why the snippet reads as though it should work unaided.

The fix is to hoist a `CopilotChatConfigurationProvider` above both the controls and the sidebar. The two-way sync is already built in: a nested provider given an explicit `isModalDefaultOpen` mirrors its parent's `isModalOpen` downward whenever it changes, and its own `setModalOpen` pushes back up — so an outer button and the sidebar's toggle stay in agreement.

### 9.10 The `welcomeScreen` slot deletes the composer if replaced naively

[The slots page](https://docs.copilotkit.ai/claude-sdk-python/custom-look-and-feel/slots) describes `welcomeScreen` as "the empty-state view shown before the first message is sent" and its teaching extract declares `CustomWelcomeScreen: ComponentType` — a component taking no props.

That is the shape that breaks it. `welcomeScreen` is not decoration wrapped around the chat; it *is* the empty state, and it is handed `input` and `suggestionView` as ready-made elements that it must place itself. CopilotKit's default renders the welcome message, then the input, then the suggestions. A replacement that ignores those props removes the composer entirely, so the chat has no input area at all until a first message exists to switch the view over — and there is no way to send one.

The fix is to accept `ComponentProps<typeof CopilotChatView.WelcomeScreen>` and render `{input}` and `{suggestionView}`.

The page's other two overrides are safe for different reasons: `assistantMessage` wraps the default and spreads its props through, and `input.disclaimer` is leaf text with no children to forward. The hazard is specific to container slots.

### 9.11 The Quickstart's runtime mode cannot serve threads

[The Quickstart](https://docs.copilotkit.ai/claude-sdk-python/quickstart?agent=bring-your-own) now builds the runtime on `@copilotkit/runtime/v2`, keeps the file at `app/api/copilotkit/route.ts`, and passes `mode: "single-route"` — one POST carrying a `{ method, params, body }` envelope. That is enough for chat and nothing else.

Rich Threads are REST: list, rename, archive and delete are separate verbs on separate paths, and `/info` is what tells the client whether Intelligence is on. Those live in `mode: "multi-route"` (the default), which needs a catch-all segment. This repo therefore puts the route at `[[...slug]]/route.ts` and omits `mode`.

The failure mode if you follow the Quickstart literally and then add threads is quiet: `/info` keeps returning 200 so the app looks connected, while every thread call 404s. The same trap exists on the client — pinning `useSingleEndpoint={true}` against a multi-route handler produces the identical symptom, which is why the provider leaves it unset (`auto`).

### 9.12 Threads need two credentials, and only one of them makes threads work

`INTELLIGENCE_API_KEY` puts the runtime in Intelligence mode: it is what makes the thread endpoints return real rows. `COPILOTKIT_LICENSE_TOKEN` is a separate credential, and it is what `/info` reports a licence status from. `<CopilotThreadsDrawer>` reads that status and renders its locked view unless it is valid.

So a runtime can serve threads perfectly while every drawer in the app shows an upgrade panel — the drawer never checks whether threads actually work. Neither the [Threads Drawer](https://docs.copilotkit.ai/claude-sdk-python/prebuilt-components/copilot-threads-drawer) page nor [Headless Threads](https://docs.copilotkit.ai/claude-sdk-python/headless-threads) draws that distinction: the drawer page says only "without a license key, the drawer shows a locked view", and the headless page's runtime snippet sets `intelligence` and no licence at all.

The drawer page also passes `publicLicenseKey` on `CopilotKitProvider` — a browser-visible credential. This repo sets the licence on the runtime instead.

### 9.13 The thread list is scoped per agent, which no page states

`useThreads({ agentId })` writes that id into the thread store's fetch context, so the list it returns is per-agent. Neither [Threads Drawer](https://docs.copilotkit.ai/claude-sdk-python/prebuilt-components/copilot-threads-drawer), [Headless Threads](https://docs.copilotkit.ai/claude-sdk-python/headless-threads) nor [Thread & History Lifecycle](https://docs.copilotkit.ai/claude-sdk-python/threads-lifecycle) says so — the drawer page lists `agentId` as "agent whose threads to list (defaults to the chat configuration's agent)" and leaves it there, and all three samples use one agent throughout, so the constraint never comes up.

It bites as soon as you build more than one thread view. Point them at different agents and you get lists that never agree: a conversation started in the drawer is invisible to a headless list, and a lifecycle picker reading a third agent stays empty forever. The symptom reads like a sync failure — the one thing the docs promise Rich Threads *do* handle — rather than a configuration mistake.

All three routes here share `agentId="threads"`.

### 9.14 Intelligence makes every run depend on a WebSocket, with no opt-out

`IntelligenceAgentRunner` opens a Phoenix socket per run and joins `ingestion:{runId}`. If that channel cannot be joined the run fails with `Timed out joining channel` — **on every route in the harness**, not just the three thread ones. Chat is entirely gated on a WebSocket to a third-party host the moment `INTELLIGENCE_API_KEY` is set.

There is no way to keep threads and opt runs out. `CopilotRuntimeOptions` is a two-member union: the SSE variant takes `runner?` and declares `intelligence?: undefined`; the Intelligence variant requires `intelligence` and has no `runner` field at all. You get both planes or neither.

Worth knowing when diagnosing: the API plane and the realtime plane are **separate hosts** (`api.intelligence.copilotkit.ai` vs `realtime.intelligence.copilotkit.ai`), deployed independently — the config comments say `wsUrl` "cannot be derived by scheme-swapping `apiUrl`". So REST can authenticate perfectly, threads can be created and listed, and the socket can still fail to join. If you see threads appear while runs fail, that is the split you are looking at, and the fallback is to unset the key.

### 9.15 Thread names cannot be generated through ClaudeAgentAdapter

The runtime names a new thread by cloning the agent and sending it two messages: a system message instructing `Return JSON only in this exact shape: {"title":"..."}`, and a user message carrying the transcript. `selectGeneratedTitleFromMessages` then requires an assistant reply that is a plain string, and `normalizeGeneratedTitle` rejects anything over 8 words.

`ClaudeAgentAdapter` reads **only the last message**. `get_user_message` in `ag_ui_claude_sdk/utils.py` says so in a comment — *"Extract content from the LAST message (any role) … we just need the latest input"*. The injected system message is discarded, so the model answers the transcript prompt under whatever `system_prompt` the adapter was constructed with and replies conversationally. The title is rejected, three attempts are burned, and the thread falls back to `Untitled`.

This repo therefore sets `generateThreadNames: false` and names threads client-side instead, in `frontend/src/lib/use-auto-thread-name.ts` — the first few words of the first user message, written through `renameThread`, with no second model call. That file is repo-authored and flagged as such; it is the only not-from-docs code in the Rich Threads routes. Turning the flag back on — three Claude runs per new thread, each spawning a CLI subprocess turn, for a guaranteed-useless result. Flip it back to `true` to observe the failure; nothing else changes.

The same root cause is worth holding on to generally: **any runtime feature that works by injecting a system message will be silently dropped by this adapter.**

### 9.16 `useHumanInTheLoop` does not infer its args type

The page annotates its render callback `any`, which hides the cause: unlike `useRenderTool`, the hook does not infer from `parameters`, so `args` falls back to `Record<string, unknown>` and `args.topic` is `unknown`. This repo passes the generic explicitly instead of silencing it.

### 9.17 Cross-framework content on Claude pages

Several pages carry blocks from other integrations: A2UI dynamic-schema's opt-out section imports `get_a2ui_tools` from `ag_ui_langgraph` and `ChatOpenAI` from `langchain_openai`; Agent Config's third block is LangGraph (`RunnableConfig`, `my_agent_node`); Programmatic Control's long interrupt example is LangGraph-only; Voice carries a `WhenFrameworkHas` block describing the Google ADK agent hop; A2UI fixed-schema's action-handler pointer links into `/integrations/langgraph/`. The Shared State page also credits a `PreferencesInjectorMiddleware`, and Agent Read-Only Context a `CopilotKitMiddleware`, neither of which exists in this integration.

### 9.18 Undefined helpers, throughout

Near-universal across the frontend snippets: `createMessageId`, `parseJsonResult`, `useAgenticChatSuggestions`, `useReasoningDefaultSuggestions`, `useReasoningCustomSuggestions`, `useFrontendToolsSuggestions`, `MainContent`, `Suggestions`, `TimePickerCard`, `WeatherCard`, `FlightListCard`, `StockCard`, `D20Card`, `CustomCatchallRenderer`, `BarChart`, `barChartPropsSchema`, `NotesCard`'s shadcn wrappers, `DemoLayout`, `ACTIVITIES`, `SUB_AGENT_STYLE`, `useAttachmentsConfig`, `useAutoScroll`, `buildContent`, `createClaudeHttpAgent`, `analytics`, `toast`. Each is either written minimally in this repo — flagged in the file header and on the route page — or replaced by the real export it was standing in for.

Several pages also print the same file two or three times, cut at different points, which reads as duplication rather than progression: Tool Call Rendering, Slots, Human-in-the-Loop, Sub-Agents and A2UI fixed-schema all do this.

### 9.19 A relative `runtimeUrl` crashes any single-route endpoint

[The A2UI dynamic-schema page](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/a2ui/dynamic-schema) publishes `runtimeUrl="/api/copilotkit-declarative-gen-ui"` — a relative path, as every CopilotKit page does. That is fine against a catch-all runtime route and fatal against a single-segment one.

Transport detection in `@copilotkit/core` probes `GET {runtimeUrl}/info` and, when that 404s, falls back to a single-route `POST {runtimeUrl}` carrying an `{method:"info"}` envelope. A route exported at a fixed path answers only the second probe, so the client resolves the endpoint to `transport: "single"`. From then on every runtime fetch is routed through `createSingleRouteResourceRequest`, which opens with a bare `new URL(runtimeUrl)`. With no base argument that constructor requires an absolute URL, so a relative one throws before the request is built:

```
[CopilotKit] Agent error: Failed to construct 'URL': Invalid URL
  Code: agent_run_failed
  at createSingleRouteResourceRequest
  at ProxiedCopilotRuntimeAgent.runtimeFetch
```

Chat dies at submit, not at connect, so the page looks healthy until you send a message. The omission is local to that one function — `ProxiedCopilotRuntimeAgent.abortRun`, two methods down in the same class, resolves the same field correctly with `new URL(this.runtimeUrl, window.location.origin)`.

This repo keeps the doc's relative `runtimeUrl` verbatim and fixes it on the route side: `/api/copilotkit-declarative-gen-ui` now sits at `[[...slug]]/route.ts` on the `@copilotkit/runtime/v2` surface, like every other runtime route here. `/info` resolves, transport lands on `"rest"`, and the throwing code path is never entered. Passing an absolute `runtimeUrl` also works, but diverges from the published snippet.

### 9.20 `maplibre-gl` is "optional", but every Components page needs it to build

[The Standard catalog page](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/components/standard-catalog) says the `Map` component needs `npm install maplibre-gl` and otherwise falls back to a list of places. `@copilotkit/react-core@1.83.0` agrees on paper: `maplibre-gl` is a peer dependency with `peerDependenciesMeta.optional: true`.

In practice, `dist/v2/generative-ui.mjs` loads it with a literal `import("maplibre-gl")`, and Turbopack resolves that at build time. Without the package, **any** module importing `@copilotkit/react-core/v2/generative-ui` fails to compile. That covers all eight Components and surfaces routes, since `standardUI`, `createGenerativeUI` and `GenerativeUISurface` all come from there:

```
Error: Module not found: Can't resolve 'maplibre-gl'
  ./node_modules/@copilotkit/react-core/dist/v2/generative-ui.mjs:4282:23
  > 4282 | const module = await import("maplibre-gl");
```

It does not stay local, either. In `next dev`, once one of those routes has compiled, unrelated routes (`/status`, `/generative-ui/tool-based`, the A2UI demos) also return 500, and `next build` fails outright. This repo therefore installs `maplibre-gl@^5` even though no catalog here uses `Map` (the Standard catalog route omits it).

### 9.21 On Windows, a large catalog surfaces as "Claude Code not found"

Symptom, in the backend log, on a Components and surfaces route:

```
Claude Code not found at: …\backend\.venv\Lib\site-packages\claude_agent_sdk\_bundled\claude.exe
```

The binary is present and runs (`claude.exe --version` prints `2.1.259 (Claude Code)`). The message is wrong about the cause.

- `ClaudeAgentAdapter` appends every AG-UI context entry to the system prompt (`ag_ui_claude_sdk/adapter.py`, `build_state_context_addendum`).
- `claude-agent-sdk` hands that prompt to the CLI as one command-line argument, `--system-prompt <text>`.
- Windows caps a process command line at 32,767 characters. Past that, `CreateProcess` fails with `WinError 206 "The filename or extension is too long"`, which Python raises as `FileNotFoundError`. `subprocess_cli.py` catches every `FileNotFoundError` from the spawn and reports it as "Claude Code not found at: <path>".

Reproduced directly against the bundled exe: a 1,000-character `--system-prompt` launches, and a 40,000-character one fails with `WinError 206`. For scale, `exportA2UICatalog(standardUI)` alone serializes to about 221,000 characters. Any page whose generative-UI context carries a large share of that catalog fails before the model is called.

No doc page mentions it. Linux limits a single argument to 128 KiB, so it is not only a Windows problem.

**Workaround in this repo (not doc code):** `build_adapter` returns `FilePromptAdapter` (`backend/src/agents/chat_agents.py`), a `ClaudeAgentAdapter` subclass that overrides `build_options`. When a run's system prompt is longer than 8,000 characters, it writes the prompt to a temp file named by its hash and passes `system_prompt={"type": "file", "path": ...}`. The SDK already supports that form and turns it into `--system-prompt-file`. Shorter prompts are passed through unchanged, so every other route behaves as before. Verified with a 40,000-character context: the command line drops to about 300 characters, and Claude answers from the file's contents. A large catalog still costs tokens on every turn, though. Trimming it with `standardUI.omit([...])` is the doc's own advice (Transports page) but is not applied here.

### 9.22 JSON Render and Hashbrown print only part of their demos

[JSON Render](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/json-render) prints 4 of its demo's 13 files, and [Hashbrown](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/hashbrown) prints 3 of 11. Both say the rest, including the Python agent, is on the page's **Code** tab. That tab loads `showcase/integrations/claude-sdk-python` in the CopilotKit repo, so this repo copies the missing files from there unchanged: `page.tsx` (JSON Render), `suggestions.ts`, `types.ts`, `metric-card.tsx`, `charts/*`, and `byoc_json_render_agent.py` / `byoc_hashbrown_agent.py`. The printed files were diffed against that source and match it exactly.

Three things come along with the showcase files:

- **Theme variables.** The components use the showcase's theme variables (`--card`, `--border`, `--foreground`, `--muted-foreground`, `--primary`, `--destructive`, `--secondary`, `--font-body`). No doc page publishes them and this app does not define them, so the cards render with default colours.
- **Lint.** `charts/pie-chart.tsx` fails this repo's lint in both demos (`react-hooks/immutability`: a running total is reassigned inside `.map`). It renders fine and `next build` does not lint, so it is left as published.
- **Version drift.** The showcase pins `recharts` `^2.15`, and this app uses `^3.7`. The chart components type-check against 3.x.

### 9.23 The Quickstart pins `@ag-ui/client@1.0.2` (resolved)

The [Quickstart](https://docs.copilotkit.ai/claude-sdk-python/quickstart) install line is `npm install @copilotkit/runtime @copilotkit/react-core @ag-ui/client@1.0.2`. 1.0.2 is the exact version `@copilotkit/react-core` and `@copilotkit/runtime` 1.83.0 depend on. `frontend/package.json` used to declare `@ag-ui/client` and `@ag-ui/core` as `^1.0.3`, which installed a root 1.0.3 next to nested 1.0.2 copies, and `tsc` failed in every runtime route with "Types have separate declarations of a private property '_debug'" (`HttpAgent` not assignable to `AbstractAgent`). Both are now pinned to exactly `1.0.2`, and an `overrides` block forces `@ag-ui/client`, `core`, `encoder` and `proto` to 1.0.2 so only one copy is installed. On every CopilotKit bump, set these to whatever `node_modules/@copilotkit/react-core/package.json` pins. (`@hashbrownai/*` 0.5.0-beta.4 has no `@ag-ui` dependency, so it needs no nested override.)

### 9.23 Components as Tools' headless snippet is a fragment

[Components as Tools](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/tool-based) now shows `<CopilotChatToolCallsView message={assistantMessage} messages={allMessages} />` for headless chats. Neither variable is defined on the page, so `/generative-ui/tool-based` shows it as text; its demo uses `CopilotChat`, which renders tool calls itself.

### 9.24 Tool Call Rendering's grouping examples name undefined components

[Tool Call Rendering](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/tool-rendering)'s new "Grouping tool calls" section passes `MyToolRow` to `useDefaultRenderTool` and `ToolTimeline` to the `group` slot, and defines neither. The snippets are shown as text on `/generative-ui/tool-rendering`; the demo keeps the default grouped display.
### 9.23 `useFrontendTools` is published as a fragment

[Frontend Tools](https://docs.copilotkit.ai/claude-sdk-python/frontend-tools) now documents the plural `useFrontendTools` hook with a snippet that maps over `reports` and calls `navigate`. The page defines neither, nor the component around them, so `/frontend-tools` shows the snippet as text and does not run it.

### 9.24 The thread-scoped `useAgent` example is a fragment

[Headless Threads](https://docs.copilotkit.ai/claude-sdk-python/headless-threads) now shows `useAgent({ agentId, runtimeAgentId, threadId })` for one agent per thread. `threadId` comes from a component the page never prints, and `runtimeAgentId: "default"` names an agent this repo's threads runtime does not register (it registers `threads`). `/headless-threads` shows the snippet as text.

### 9.25 The Threads Drawer's sidebar layout renders an undefined component

[Threads Drawer](https://docs.copilotkit.ai/claude-sdk-python/prebuilt-components/copilot-threads-drawer)'s "Use the Drawer with a sidebar chat" sample renders `<YourMainContent />`, which the page never defines, so it is shown as text on the route. The own-button sample (`NewConversationButton`) is complete and runs on the demo.
### 9.23 Pausing the Agent for Input is missing its frontend

[Pausing the Agent for Input](https://docs.copilotkit.ai/claude-sdk-python/human-in-the-loop/useInterrupt) says that for this framework the pause is a `useFrontendTool` named `schedule_meeting` with a Promise-resolving handler, but the snippet that should show it is empty on the rendered page (its source region is missing). The backend prompt it does print tells Claude to call `schedule_meeting`. `/human-in-the-loop/useInterrupt` runs that prompt verbatim on the Quickstart adapter (`gen-ui-interrupt`) and does not write the tool, so the agent cannot pause. The page's generic Approve/Cancel `useInterrupt` example is mounted, but `ClaudeAgentAdapter` only emits AG-UI interrupts for `defer_tools`, which no page mentions, and resumes them on `{ behavior }` rather than the example's `{ approved }`.

### 9.24 Headless Interrupts has no code for this framework

[Headless Interrupts](https://docs.copilotkit.ai/claude-sdk-python/human-in-the-loop/headless) describes a Promise-based `useFrontendTool` whose pending state drives a picker outside the chat, but its only snippet (`headless-promise-primitives`) is missing on the rendered page and no agent is printed. `/human-in-the-loop/headless` is reference-only and status ❌.

### 9.25 Governed Action Approval publishes the UI and none of the governance

[Governed Action Approval UI](https://docs.copilotkit.ai/claude-sdk-python/human-in-the-loop/governed-actions) prints the `GovernedAction` envelope, a `useInterrupt` card and a `useHumanInTheLoop` tool, plus a `handleApproval` resume check that calls an undefined `executeSideEffect`. No agent, policy engine or emitter of `interrupt.metadata.action` is printed. `/human-in-the-loop/governed-actions` runs both frontend variants on the Quickstart adapter (`governed-actions`, default prompt): the tool-call card works mechanically with model-invented verdicts, and the interrupt card never appears. The Claude adapter's own interrupts (for `defer_tools`) carry `{ source, toolName, input }` and resume on `{ behavior }`, so the published card would not match them either. The interrupt card used to be an unlisted demo at `/human-in-the-loop/use-interrupt`; it moved here.

The published `useInterrupt` render returns `null` when `metadata.action` is missing, but react-core 1.83 types `render` as returning a `ReactElement`, so the doc block fails type-checking (TS2322). It is kept verbatim with a `@ts-expect-error` above `render`.
### 9.23 WebMCP's handler calls a function the page never defines

Both [WebMCP](https://docs.copilotkit.ai/claude-sdk-python/webmcp) snippets (the React `OrderSearch` tool and the core-only `CopilotKitCore`) call `searchOrders(status)`, which the page never defines. `/webmcp` keeps them verbatim with `@ts-expect-error` on that line and no stub, so calling the tool throws `ReferenceError`. The page prints no agent, so the route has no chat. The core-only snippet imports `@copilotkit/core`, which this repo gets only as a dependency of `@copilotkit/react-core`.
### 9.23 MCP Apps: agent, runtime and page each import unpublished code

[MCP Apps](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/mcp-apps)'s Code tab ships three files, and each imports something no page publishes: the agent (`mcp_apps_agent.py`, a raw Anthropic streaming loop) imports `normalize_claude_model` from `agents.claude_agent_sdk_adapter`; the runtime (`route.ts`) imports `createClaudeHttpAgent` from `@/app/api/_shared/claude-http-agent`; the demo page imports `Chat` from `./chat`. All three are kept verbatim and not wired up (`backend/src/agents/doc_reference/mcp_apps_agent.py`, `frontend/src/app/generative-ui/mcp-apps/_doc/`), with `@ts-expect-error` on the two unresolved frontend imports. Nothing is written in their place, so the route is reference-only. The "MCP Apps with Intelligence" snippet builds a `BuiltInAgent` on an OpenAI model and is shown as text only.

### 9.24 Open Generative UI publishes prompts but no agent

[Open Generative UI](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/open-generative-ui)'s Code tab has two agent modules that each define only a `SYSTEM_PROMPT_HINT`; the agent they describe ("the shared Claude backend in `src/agents/agent.py`") is never shown. Its runtime imports the unpublished `createClaudeHttpAgent` and `internalRuntimeErrorResponse`, and its demo page files are not served. The page's two frontend snippets are fragments that render an undefined `Chat`, pass an undefined `VISUALIZATION_DESIGN_SKILL` and import an unpublished `./suggestions`. Everything is kept as published and not wired up: prompt hints in `backend/src/agents/doc_reference/`, runtime and sandbox functions in `frontend/src/app/generative-ui/open-generative-ui/_doc/` (`@ts-expect-error` on the two unresolved imports), and the fragments as text on the route. Nothing is written in their place, so the route is reference-only.
### 9.23 Adopt from A2UI's catalog registers components it never defines

[Adopt from A2UI](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/components/from-a2ui)'s "After" catalog uses `z`, `Airport` and `Arrow` with no import or definition. `/generative-ui/components/from-a2ui` adds the `zod` import and borrows minimal `Airport`/`Arrow` from the aws-strands-py harness (`flight-components.tsx`, labelled). The page publishes no agent or backend, so the route is reference-only: no agent was added, and the After catalog is type-checked but not mounted. The page also says the 1.0 engine rejects v0.9 operations, which is what this repo's Fixed Schema `display_flight` returns, so that tool cannot be moved to the new engine as published.
### 9.23 The A2UI overview's snippets are fragments, and its Python helpers need an uninstalled package

[A2UI](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/a2ui) prints `<CopilotKit a2ui={{ catalog: myCatalog }}>{children}</CopilotKit>` and a runtime with `agents: { default: myAgent }`; none of the three names is defined, so `frontend/src/app/generative-ui/a2ui/_doc/` keeps both byte-exact with `@ts-expect-error` on those lines. Its "How it works" list uses `from copilotkit import a2ui`, but this backend's install line (the Quickstart's) has no `copilotkit` package; the snippet is kept unimported in `backend/src/agents/doc_reference/a2ui_helpers.py`.
### 9.23 Markdown Rendering's link and heading classes are never defined

[Markdown Rendering](https://docs.copilotkit.ai/claude-sdk-python/custom-look-and-feel/markdown)'s `components` example gives links `my-link` and h2s `my-heading`, but the page defines no CSS for either, so the verbatim override changes nothing visible. `/custom-look-and-feel/markdown` adds a scoped `markdown.css` (taken from the google-adk harness, labelled) to make it visible. The page names no backend; the route reuses the `chat-slots` agent.

---

## 10. Troubleshooting

The framework's doc sidebar has no Troubleshooting section, so these are this repo's actual symptoms.

**Every route errors immediately.** `ANTHROPIC_API_KEY` is unset in `backend/.env`. The server logs a warning naming it at startup.

**`Connection refused` in the browser console.** The Python server is not running, or `AGENT_URL` disagrees with `AGENT_HOST`/`AGENT_PORT`. Confirm with `curl http://localhost:8000/health`.

**A route 404s at the agent but the page loads.** The agent id in the route is not in `REGISTRY`. `/health` lists every mounted id; `frontend/src/lib/agents.ts` must match `backend/src/agents/registry.py`.

**The first message of a session is slow.** Expected. `ClaudeAgentAdapter` spawns a Claude CLI subprocess per thread on first use. Subsequent turns are fast.

**No reasoning card appears.** Only `/custom-look-and-feel/reasoning-messages` and `/generative-ui/reasoning` budget thinking tokens. Even there, Claude only emits a thinking block when the question warrants one — ask something that needs working out, or raise `REASONING_THINKING_TOKENS` in `backend/src/agents/chat_agents.py`.

**A frontend tool never fires.** Set `LOG_LEVEL=DEBUG` in `backend/.env` and look for *"Building dynamic MCP server with N frontend tools"*. If N is 0, the tool is not reaching the run — check `agentId` matches between the hook and the surface.

**The mic button is missing on `/voice`.** The runtime is not advertising `audioFileTranscriptionEnabled`. That route must use `/api/copilotkit-voice` with `useSingleEndpoint={false}`; the option only exists on the v2 handler.

**Mic returns an error.** `OPENAI_API_KEY` is unset. The guard in the voice route says so explicitly. Use the sample-audio button meanwhile.

**Two inspectors / a runaway console.** Two `CopilotKitInspector` elements on one page spin lit-html into an unbounded assert loop that can take out the tab and the dev server. `frontend/src/lib/inspector.ts` guarantees only one mounts — if you add a nested `<CopilotKit>`, add its route to `NESTED_PROVIDER_ROUTES` there. `NEXT_PUBLIC_COPILOTKIT_INSPECTOR=off` disables it entirely.

**The thread list is empty but chat works.** No `INTELLIGENCE_API_KEY`, so the runtime fell back to SSE with an in-memory runner. That fallback is deliberate — chat keeps working on all 25 agents — but nothing is persisted to list.

**Every route fails with `Timed out joining channel`.** The Intelligence
realtime socket cannot join, and runs are ingested over it — so this breaks all
chat, not just threads. Check that `wss://realtime.intelligence.copilotkit.ai`
is reachable and that the key is valid for the realtime plane; the API plane
authenticating (threads get created) does **not** imply the socket will join,
because they are separate hosts. To get chat back immediately, unset
`INTELLIGENCE_API_KEY` and restart — the runtime falls back to SSE. See §9.14.

**Thread names are all "Untitled" or blank.** `generateThreadNames` is off
because the adapter drops the runtime's injected system message, so the runtime
can only ever write its `Untitled` fallback. Names now come from
`lib/use-auto-thread-name.ts` instead — the first few words of the first user
message. Rows created before that landed keep their old name until renamed;
`Untitled` is treated as unnamed, so re-opening such a thread fixes it. See
§9.15.

**Each thread route shows a different list, and Lifecycle's picker is empty.**
`useThreads({ agentId })` scopes the list per agent, so three routes pointed at
three agents get three disjoint lists. All three Rich Threads routes here share
`agentId="threads"` for that reason. If you add a fourth thread view, give it
the same id or it will not see anything the others created.

**The drawer shows a locked panel.** `COPILOTKIT_LICENSE_TOKEN` is unset or invalid. Independent of whether threads work; see §9.12.

**Threads work but every visitor sees the same history.** `identifyUser` is returning one id for everyone. The harness keys on the `x-user-id` header the root provider sends, which is a fixed demo identity — change `NEXT_PUBLIC_DEMO_USER_ID` to watch the lists separate. A real app resolves this from a verified session.

**Thread calls 404 while `/info` returns 200.** The runtime is in single-route mode, or the client pinned `useSingleEndpoint={true}`. See §9.11.

**Shared state resets.** Sessions are in-process. Restarting the Python server clears every conversation and every state object.

---

## Doc drift detection

`/doc-sync` keeps this repo honest about the docs it mirrors. Press **Sync docs now** (on the landing page or on `/doc-sync`) and it fetches the markdown source behind all 27 tracked doc pages, diffs each against the copy stored in `doc-snapshot/`, replaces that copy, and reports what moved — ranked by whether the change can actually break an implementation.

Doc pages are fetched by appending `.md` to their URL, which returns the authored MDX rather than 250 KB of rendered HTML. Every response is checked for `text/markdown` before it is allowed near the snapshot: a URL that misses the markdown handler still answers `200` with the HTML app shell, and writing that in would destroy the baseline and report the whole corpus as rewritten on the next run. A run commits all pages or none.

**Severity is decided by where the edit landed**, not how big it was:

| Level | Trigger |
|---|---|
| **High** | a changed line inside a fenced code block, a changed fence count, or a page that now 404s and is gone from the sitemap |
| **Medium** | a changed heading, changed frontmatter `title`/`description`, or prose in the same section as changed code |
| **Low** | other prose |

**Sections checked** lists every tracked page in nav order with a mark — `✓` unchanged, `!` changed, `+` stored, `✗` 404, `~` unstable, `·` not checked. Expanding a row shows the comparison: for a changed page the diff (`−` existing snapshot, `+` newly fetched), and for an unchanged one the two matching hashes, which is the evidence the check ran.

**`doc-snapshot/CHANGELOG.md`** is the record that survives a re-sync. Because syncing replaces the copy it just compared against, the run *after* a change reports nothing — so the changelog is written at the moment of discovery and never rewritten later. Only changed pages are recorded; a clean run does not touch the file. It keeps the three most recent dated entries, counted rather than aged, so a change from six weeks ago still shows if nothing has happened since.

**One sync date.** `syncedAt` in `doc-snapshot/manifest.json`, rewritten on every run and shown on `/`, `/status` and `/doc-sync`. There is no hand-maintained date to keep in step with it.

**To test it**, edit any `doc-snapshot/pages/*.md` file and press the button — a line inside a code fence for High, a `##` heading for Medium, a sentence for Low. The comparison reads the stored file itself, so nothing else needs changing. Both `/doc-sync` and the changelog label the result as a local snapshot edit rather than upstream drift.

Commit `doc-snapshot/` — `pages/`, `manifest.json` and `CHANGELOG.md` are the baseline every diff is taken against. `reports/` is gitignored derived data.

---

## 11. Project structure

```
claude-sdk-python/
├── CLAUDE.md                  build instructions (same file in every framework repo)
├── README.md                  this file
├── .env.example               annotated; split into backend/.env + frontend/.env.local
│
├── backend/
│   ├── pyproject.toml         the Quickstart's dependency list
│   └── src/
│       ├── agent_server.py    FastAPI app; the Quickstart's endpoint, mounted per agent
│       └── agents/
│           ├── chat_agents.py the Quickstart's options dict → build_adapter()
│           ├── prompts.py     per-route system prompts, with doc provenance noted
│           ├── registry.py    the 36 agents; id = AG-UI agent id = mount path
│           ├── byoc_json_render_agent.py  byoc_hashbrown_agent.py   showcase prompts, verbatim (§9.22)
│           ├── weather_mcp_server.py   repo bridge: get_weather as an in-process MCP server (§9.1)
│           ├── flights_mcp_server.py   repo bridge: display_flight, same shape
│           └── doc_reference/ published doc code, as printed — only the two bridges above import it
│               ├── __init__.py             ← why this directory exists
│               ├── a2ui_schemas/           flight_schema.json, booked_schema.json — repo-supplied (§9.4)
│               ├── claude_agent_sdk_adapter.py   the incomplete tool bridge
│               ├── tool_rendering.py  state_streaming.py  shared_state.py
│               ├── subagents.py  a2ui_fixed.py  agent_config.py
│               ├── markdown_mode.py    Markdown mode's sendContext:false fragment
│               └── frontend_tools.py  agent_readonly.py   ← these two work anyway
│
└── frontend/
    ├── src/lib/
    │   ├── nav-config.ts      the spine: routes, doc paths, statuses, agent ids
    │   ├── agents.ts          agent id list + AGENT_URL; mirrors registry.py
    │   ├── source.ts          reads repo files so pages show their own code
    │   └── inspector.ts       which provider owns the inspector, decided once
    ├── src/components/        route-header, nav-sidebar, source-code, ui primitives
    └── src/app/
        ├── page.tsx           landing
        ├── status/            the status table
        ├── api/
        │   ├── copilotkit/[[...slug]]/route.ts        all 25 agents · Intelligence · A2UI
        │   ├── copilotkit-voice/[[...slug]]/route.ts  v2 runtime + TranscriptionService
        │   ├── copilotkit-declarative-gen-ui/[[...slug]]/route.ts  A2UI dynamic-schema
        │   ├── copilotkit-components/[[...slug]]/route.ts  Components and surfaces · generativeUI: true
        │   ├── copilotkit-declarative-json-render/[[...slug]]/route.ts  JSON Render
        │   └── copilotkit-declarative-hashbrown/[[...slug]]/route.ts    Hashbrown
        ├── generative-ui/components/   8 routes; _components/ holds the shared provider + product data
        └── <one directory per doc route>/
            ├── page.tsx       notes, source, doc link, try-it
            └── demo-chat/     the chrome-free live surface
```

Each route directory holds its own components alongside those two files, so a route can be read in one place.

---

## 12. References

Grouped as this repo's nav groups them. Pages marked ◦ resolve but are absent from the framework's doc sidebar.

**Getting Started**
- [Introduction](https://docs.copilotkit.ai/claude-sdk-python)
- [Quickstart — bring your own agent](https://docs.copilotkit.ai/claude-sdk-python/quickstart?agent=bring-your-own)

**Prebuilt Components**
- ◦ [CopilotChat](https://docs.copilotkit.ai/claude-sdk-python/prebuilt-components/chat)
- ◦ [CopilotSidebar](https://docs.copilotkit.ai/claude-sdk-python/prebuilt-components/sidebar)
- ◦ [CopilotPopup](https://docs.copilotkit.ai/claude-sdk-python/prebuilt-components/popup)
- ◦ [Open, close, and feedback](https://docs.copilotkit.ai/claude-sdk-python/prebuilt-components/chat-controls)

**Rich Threads**
- [Threads Drawer](https://docs.copilotkit.ai/claude-sdk-python/prebuilt-components/copilot-threads-drawer)
- [Headless Threads](https://docs.copilotkit.ai/claude-sdk-python/headless-threads)
- [Thread & History Lifecycle](https://docs.copilotkit.ai/claude-sdk-python/threads-lifecycle)

**Custom Look and Feel**
- ◦ [CSS Customization](https://docs.copilotkit.ai/claude-sdk-python/custom-look-and-feel/css)
- ◦ [Slots](https://docs.copilotkit.ai/claude-sdk-python/custom-look-and-feel/slots)
- ◦ [Markdown Rendering](https://docs.copilotkit.ai/claude-sdk-python/custom-look-and-feel/markdown)
- ◦ [Headless UI](https://docs.copilotkit.ai/claude-sdk-python/custom-look-and-feel/headless-ui)
- ◦ [Reasoning Messages](https://docs.copilotkit.ai/claude-sdk-python/custom-look-and-feel/reasoning-messages)

**Input Modalities**
- [Multimodal Attachments](https://docs.copilotkit.ai/claude-sdk-python/multimodal-attachments)
- [Voice](https://docs.copilotkit.ai/claude-sdk-python/voice)

**Generative UI**
- [Reasoning](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/reasoning)
- [Components as Tools](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/tool-based)
- [Tool Call Rendering](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/tool-rendering)
- [State Rendering](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/state-rendering)
- [A2UI](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/a2ui)
- [A2UI · Dynamic Schema](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/a2ui/dynamic-schema)
- [A2UI · Fixed Schema](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/a2ui/fixed-schema)
- [JSON Render](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/json-render)
- [Hashbrown](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/hashbrown)
- [MCP Apps](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/mcp-apps)
- [Open Generative UI](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/open-generative-ui)
- [Components and surfaces](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/components)
  - [Surfaces](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/components/surfaces)
  - [Catalogs](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/components/catalogs)
  - [Standard catalog](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/components/standard-catalog)
  - [State and actions](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/components/state-and-actions)
  - [Theming](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/components/theming)
  - [Transports](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/components/transports)
  - [Markdown mode](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/components/markdown-mode)
  - [Adopt from A2UI](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/components/from-a2ui)

**App Control**
- [Frontend Tools](https://docs.copilotkit.ai/claude-sdk-python/frontend-tools)
- [HITL Overview](https://docs.copilotkit.ai/claude-sdk-python/human-in-the-loop/index)
- [Pausing the Agent for Input](https://docs.copilotkit.ai/claude-sdk-python/human-in-the-loop/useInterrupt)
- [Headless Interrupts](https://docs.copilotkit.ai/claude-sdk-python/human-in-the-loop/headless)
- [Governed Action Approval UI](https://docs.copilotkit.ai/claude-sdk-python/human-in-the-loop/governed-actions)
- [WebMCP](https://docs.copilotkit.ai/claude-sdk-python/webmcp)
- [Human-in-the-Loop](https://docs.copilotkit.ai/claude-sdk-python/human-in-the-loop)
- [Programmatic Control](https://docs.copilotkit.ai/claude-sdk-python/programmatic-control)

**Shared State**
- [Shared State](https://docs.copilotkit.ai/claude-sdk-python/shared-state)
- [Render state in your app](https://docs.copilotkit.ai/claude-sdk-python/shared-state/rendering-in-app)
- [State Streaming](https://docs.copilotkit.ai/claude-sdk-python/shared-state/streaming)
- [Agent Read-Only Context](https://docs.copilotkit.ai/claude-sdk-python/shared-state/agent-readonly)

**Multi-Agent**
- [Sub-Agents](https://docs.copilotkit.ai/claude-sdk-python/multi-agent/subagents)

**Agent Config**
- [Agent Config](https://docs.copilotkit.ai/claude-sdk-python/agent-config)
