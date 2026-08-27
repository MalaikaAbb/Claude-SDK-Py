# CopilotKit + Claude Agent SDK (Python) Test Suite

A navigable, working test harness for the CopilotKit ↔ Claude Agent SDK (Python) integration — one route per doc page, each running the thing its page teaches, or reporting precisely why it cannot.

| | |
|---|---|
| **Doc sync date** | Machine-maintained — `doc-snapshot/manifest.json` → `syncedAt`, rewritten on every sync |
| **Doc root tracked** | <https://docs.copilotkit.ai/claude-sdk-python> |
| **Frontend packages** | `@copilotkit/react-core` `@copilotkit/runtime` `@copilotkit/a2ui-renderer` `@copilotkit/voice` `^1.69.0` · `@ag-ui/client` `@ag-ui/core` `^0.0.57` · Next `16.3.0` · React `19.2.8` |
| **Backend packages** | `ag-ui-claude-sdk>=0.1.5` · `claude-agent-sdk>=0.2.132` · `ag-ui-protocol>=0.1.19` · `anthropic>=0.68.0` |
| **Routes** | 31 total — 18 ✅ working · 5 ⚠️ partial · 6 ❌ broken · 2 reference |
| **CI** | none |

---

## 2. Overview

The Claude Agent SDK integration runs a Python agent behind a FastAPI endpoint that speaks the AG-UI protocol, and CopilotKit's Next.js runtime forwards browser conversations to it. Unlike the other Python integrations, the agent does not call the Anthropic API in-process: the Claude Agent SDK drives the Claude CLI as a subprocess, which is why `ClaudeAgentAdapter` is built once at module scope rather than per request.

This repo turns every page under [docs.copilotkit.ai/claude-sdk-python](https://docs.copilotkit.ai/claude-sdk-python) that it tracks into a route with a live surface, the repo code behind it, and a link to the page it is testing — so the published sample and the running implementation can be diffed on the spot.

It is a QA tool, so it reports failures as findings rather than hiding them. **Six routes are marked ❌ Broken, and all six trace back to the same upstream reason** — see [§9](#9-known-issues--docvsimplementation-discrepancies). No missing doc code has been invented to paper over that; the published code sits in `backend/src/agents/doc_reference/` exactly as printed, unwired, with its gaps annotated.

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
the first row. *Pass:* two auto-named rows; clicking one replays that
conversation. *Fail:* a locked panel means no valid licence token; an empty list
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
*Try:* "Say hello." *Pass:* a gradient welcome card, then every assistant reply in a tinted card tagged "slot", and an indigo disclaimer. *Fail:* default chrome on any of the three.

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

**`/generative-ui/tool-rendering`** — ❌ **Broken.** Renderers are live; nothing calls them.
*Try:* "What's the weather in San Francisco?" *Pass (as a report):* a prose reply opening by noting it has no weather tool. *Would-be-fail:* a `WeatherCard` would mean the tool bridge landed upstream — raise the status.

**`/generative-ui/state-rendering`** — ❌ **Broken.** Same cell and same gap as State Streaming.
*Try:* "Draft a one-paragraph product brief for a habit tracker." *Pass (as a report):* empty canvas with a LIVE badge, then the whole brief at once. *Fail:* an empty canvas after the turn — the state write never happened at all.

**`/generative-ui/a2ui/dynamic-schema`** — a bring-your-own-catalog dashboard designed per request by a secondary LLM.
*Try:* "Build me a dashboard for a fictional SaaS: MRR, churn, active seats, and a bar chart of signups by month." *Pass:* a progress indicator, then Card / Metric / DataTable / PieChart / BarChart appearing one at a time. *Fail:* a markdown table, or raw JSON in the chat.

**`/generative-ui/a2ui/fixed-schema`** — ❌ **Broken.** Catalog and runtime are wired; the tool is unreachable.
*Try:* "Find me a flight from SFO to JFK." *Pass (as a report):* a one-sentence prose reply, no card.

### App Control

**`/frontend-tools`** — a tool the agent calls that runs in the browser.
*Try:* "Make the background a warm sunset gradient." *Pass:* the background transitions, the printed CSS updates, the agent confirms. *Fail:* the agent describes a gradient instead of applying one.

**`/human-in-the-loop`** — `useHumanInTheLoop` suspending the run behind a picker.
*Try:* "Book an intro call with the sales team." *Pass:* a four-slot picker appears inline and the run visibly pauses; picking swaps it for a confirmation and the agent's next message names your time. *Fail:* the agent invents a time without asking, or picking does nothing.

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

Legend: ✅ Working · ⚠️ Partial · ❌ Broken · 📖 Reference

| Doc page | Route | Status | Notes |
|---|---|---|---|
| [Introduction](https://docs.copilotkit.ai/claude-sdk-python) | `/` | 📖 | Landing page — orientation and the agent roster. |
| [Quickstart](https://docs.copilotkit.ai/claude-sdk-python/quickstart?agent=bring-your-own) | `/quickstart` | ✅ | |
| [CopilotChat](https://docs.copilotkit.ai/claude-sdk-python/prebuilt-components/chat) | `/prebuilt-components/chat` | ✅ | Page resolves but is absent from the doc sidebar. |
| [CopilotSidebar](https://docs.copilotkit.ai/claude-sdk-python/prebuilt-components/sidebar) | `/prebuilt-components/sidebar` | ✅ | Off-sidebar. `MainContent`/`Suggestions` supplied locally. |
| [CopilotPopup](https://docs.copilotkit.ai/claude-sdk-python/prebuilt-components/popup) | `/prebuilt-components/popup` | ✅ | Off-sidebar. |
| [Chat controls](https://docs.copilotkit.ai/claude-sdk-python/prebuilt-components/chat-controls) | `/prebuilt-components/chat-controls` | ✅ | Off-sidebar. Doc's `analytics.track` replaced by an on-page log. |
| [Threads Drawer](https://docs.copilotkit.ai/claude-sdk-python/prebuilt-components/copilot-threads-drawer) | `/prebuilt-components/copilot-threads-drawer` | ⚠️ | Needs Intelligence + a licence token. Locked view without one. |
| [Headless Threads](https://docs.copilotkit.ai/claude-sdk-python/headless-threads) | `/headless-threads` | ⚠️ | Same precondition. The two-step "New conversation" reset joins two doc fragments. |
| [Thread & History Lifecycle](https://docs.copilotkit.ai/claude-sdk-python/threads-lifecycle) | `/threads-lifecycle` | ⚠️ | Same precondition. User-scoping, first-message thread creation and the checkpointer comparison are out of scope locally. |
| [CSS customization](https://docs.copilotkit.ai/claude-sdk-python/custom-look-and-feel/css) | `/custom-look-and-feel/css` | ✅ | Off-sidebar. One doc snippet is v1 and not implemented — see §9. |
| [Slots](https://docs.copilotkit.ai/claude-sdk-python/custom-look-and-feel/slots) | `/custom-look-and-feel/slots` | ✅ | Off-sidebar. The three slot components are declared by the doc, not defined. |
| [Headless UI](https://docs.copilotkit.ai/claude-sdk-python/custom-look-and-feel/headless-ui) | `/custom-look-and-feel/headless-ui` | ✅ | Off-sidebar. `headless-simple` only; `headless-complete` is not published in full. |
| [Reasoning Messages](https://docs.copilotkit.ai/claude-sdk-python/custom-look-and-feel/reasoning-messages) | `/custom-look-and-feel/reasoning-messages` | ✅ | Off-sidebar. Runs on the adapter's native thinking support, not the doc's 300-line agent. |
| [Multimodal Attachments](https://docs.copilotkit.ai/claude-sdk-python/multimodal-attachments) | `/multimodal-attachments` | ✅ | The one page with no backend half, correctly. |
| [Voice](https://docs.copilotkit.ai/claude-sdk-python/voice) | `/voice` | ✅ | Mic needs `OPENAI_API_KEY`; sample-audio button works without it. |
| [Reasoning](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/reasoning) | `/generative-ui/reasoning` | ✅ | `ReasoningBlock` is one of the few components published in full. |
| [Components as Tools](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/tool-based) | `/generative-ui/tool-based` | ✅ | Works because `useComponent` registers a *frontend* tool. |
| [Tool Call Rendering](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/tool-rendering) | `/generative-ui/tool-rendering` | ❌ | `get_weather` is a backend tool with no registration path. |
| [State Rendering](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/state-rendering) | `/generative-ui/state-rendering` | ❌ | Same cell and gap as State Streaming. |
| [A2UI · Dynamic Schema](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/a2ui/dynamic-schema) | `/generative-ui/a2ui/dynamic-schema` | ✅ | Catalog auto-injects `generate_a2ui` as a frontend tool. `renderers.tsx` has no imports — see §9. |
| [A2UI · Fixed Schema](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/a2ui/fixed-schema) | `/generative-ui/a2ui/fixed-schema` | ❌ | `display_flight` unreachable; `flight_schema.json`, `SURFACE_ID`, `CATALOG_ID` unpublished. |
| [Frontend Tools](https://docs.copilotkit.ai/claude-sdk-python/frontend-tools) | `/frontend-tools` | ✅ | |
| [Human-in-the-Loop](https://docs.copilotkit.ai/claude-sdk-python/human-in-the-loop) | `/human-in-the-loop` | ✅ | Pattern 1 only; `useInterrupt` needs LangGraph. |
| [Programmatic Control](https://docs.copilotkit.ai/claude-sdk-python/programmatic-control) | `/programmatic-control` | ⚠️ | The page's promise-based section is a build placeholder — see §9. |
| [Shared State](https://docs.copilotkit.ai/claude-sdk-python/shared-state) | `/shared-state` | ❌ | UI→agent works; agent→UI does not. `set_notes` unreachable and the `ag_ui_update_state` substitute does not carry notes back. |
| [Render state in your app](https://docs.copilotkit.ai/claude-sdk-python/shared-state/rendering-in-app) | `/shared-state/rendering-in-app` | ✅ | Framework-neutral page; follows the google-adk layout. |
| [State Streaming](https://docs.copilotkit.ai/claude-sdk-python/shared-state/streaming) | `/shared-state/streaming` | ❌ | Backend tool **and** a raw Anthropic stream the adapter never exposes. |
| [Agent Read-Only Context](https://docs.copilotkit.ai/claude-sdk-python/shared-state/agent-readonly) | `/shared-state/agent-readonly` | ✅ | The adapter does the doc's context loop for you. |
| [Sub-Agents](https://docs.copilotkit.ai/claude-sdk-python/multi-agent/subagents) | `/multi-agent/subagents` | ❌ | Delegation tools unreachable; the delegation-flow region is unpublished. |
| [Agent Config](https://docs.copilotkit.ai/claude-sdk-python/agent-config) | `/agent-config` | ⚠️ | Frontend half works; the published backend half reads a channel the frontend never writes. |
| [Doc root](https://docs.copilotkit.ai/claude-sdk-python) | `/doc-sync` | 📖 | Not a doc page. Reports drift between `doc-snapshot/` and the live docs. |

Pages in the framework's doc sidebar that this repo does **not** track: CLI, Build with agents, the four Concepts pages, Agentic Protocols, the six Threads pages, MCP Apps, the seven Runtime pages, Deploy to any runtime, Authentication, Inspector, VS Code Extension, the four Intelligence Platform pages, AWS AgentCore, Telemetry.

---

## 9. Known issues / doc-vs-implementation discrepancies

### 9.1 The backend tool bridge is incomplete — this is the big one

Five routes fail for one reason. The Quickstart's `main.py` is the only complete backend the framework publishes, and it builds a `ClaudeAgentAdapter` with `"tools": []`. Five pages then publish a **backend** tool — an Anthropic schema plus a Python handler — and no page shows how to register one against that adapter.

The Quickstart's ["Backend tools and state"](https://docs.copilotkit.ai/claude-sdk-python/quickstart) section looks like the missing link. Its `run_with_claude_agent_sdk` excerpt opens by calling six things the docs never define:

`_build_sdk_tools` · `_set_state` · `_normalize_claude_agent_sdk_model` · `_with_initial_state` · `COPILOTKIT_MCP_SERVER_NAME` · `COPILOTKIT_TOOL_PREFIX`

...plus the `ExecuteTool` type, and without any import block. The surrounding prose says the tools reach the model through `create_sdk_mcp_server`, so the shape is guessable — but guessing is not this harness's job.

**Affected:** `/generative-ui/tool-rendering`, `/generative-ui/state-rendering`, `/shared-state`, `/shared-state/streaming`, `/generative-ui/a2ui/fixed-schema`, `/multi-agent/subagents`.

### 9.2 The feature pages target a backend that is never published

Related but distinct. The backend snippets on the feature pages are not written against `ClaudeAgentAdapter` at all — they are fragments of a hand-rolled streaming loop over the raw Anthropic Messages API. The [Frontend Tools](https://docs.copilotkit.ai/claude-sdk-python/frontend-tools) page says so outright: *"Runs that carry frontend tools use the direct Messages API path rather than the Claude Agent SDK."* That loop is never published in full, so there is no second server to drop these fragments into either. Every one is reproduced under `backend/src/agents/doc_reference/`.

### 9.3 `renderers.tsx` has no import block, on both A2UI pages

[Fixed schema](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/a2ui/fixed-schema)'s `renderers.tsx` begins at `export const renderers: CatalogRenderers<Definitions> = {` with nothing above it, then uses `Card`, `Badge`, `Separator`, `UIButton`, the `s()` helper, and the `CatalogRenderers` and `Definitions` types — none imported or defined. [Dynamic schema](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/a2ui/dynamic-schema) has the same defect at greater length: add `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Button`, `DonutChart`, `AnimatedBar`, `useSeenIndices`, `CHART_COLORS`, `CHART_TOOLTIP_STYLE` and eight Recharts exports.

Here the real CopilotKit exports are imported from `@copilotkit/a2ui-renderer`; the design-system primitives are rebuilt in `frontend/src/app/generative-ui/a2ui/_components/primitives.tsx`, whose header flags it as the one self-defined file in the A2UI routes.

### 9.4 A2UI fixed schema is missing three more pieces

`flight_schema.json` is loaded by the published code and never published, and neither is `booked_schema.json`. `SURFACE_ID` and `CATALOG_ID` are used by `_display_flight_operations` and defined on neither side of the page — `CATALOG_ID` can be recovered from the page's own `catalog.ts`, `SURFACE_ID` cannot. The page also documents the Book button as inert: `a2ui.render` in the Python SDK does not yet accept `action_handlers`.

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

This repo therefore sets `generateThreadNames: false` — three Claude runs per new thread, each spawning a CLI subprocess turn, for a guaranteed-useless result. Flip it back to `true` to observe the failure; nothing else changes.

The same root cause is worth holding on to generally: **any runtime feature that works by injecting a system message will be silently dropped by this adapter.**

### 9.16 `useHumanInTheLoop` does not infer its args type

The page annotates its render callback `any`, which hides the cause: unlike `useRenderTool`, the hook does not infer from `parameters`, so `args` falls back to `Record<string, unknown>` and `args.topic` is `unknown`. This repo passes the generic explicitly instead of silencing it.

### 9.17 Cross-framework content on Claude pages

Several pages carry blocks from other integrations: A2UI dynamic-schema's opt-out section imports `get_a2ui_tools` from `ag_ui_langgraph` and `ChatOpenAI` from `langchain_openai`; Agent Config's third block is LangGraph (`RunnableConfig`, `my_agent_node`); Programmatic Control's long interrupt example is LangGraph-only; Voice carries a `WhenFrameworkHas` block describing the Google ADK agent hop; A2UI fixed-schema's action-handler pointer links into `/integrations/langgraph/`. The Shared State page also credits a `PreferencesInjectorMiddleware`, and Agent Read-Only Context a `CopilotKitMiddleware`, neither of which exists in this integration.

### 9.18 Undefined helpers, throughout

Near-universal across the frontend snippets: `createMessageId`, `parseJsonResult`, `useAgenticChatSuggestions`, `useReasoningDefaultSuggestions`, `useReasoningCustomSuggestions`, `useFrontendToolsSuggestions`, `MainContent`, `Suggestions`, `TimePickerCard`, `WeatherCard`, `FlightListCard`, `StockCard`, `D20Card`, `CustomCatchallRenderer`, `BarChart`, `barChartPropsSchema`, `NotesCard`'s shadcn wrappers, `DemoLayout`, `ACTIVITIES`, `SUB_AGENT_STYLE`, `useAttachmentsConfig`, `useAutoScroll`, `buildContent`, `createClaudeHttpAgent`, `analytics`, `toast`. Each is either written minimally in this repo — flagged in the file header and on the route page — or replaced by the real export it was standing in for.

Several pages also print the same file two or three times, cut at different points, which reads as duplication rather than progression: Tool Call Rendering, Slots, Human-in-the-Loop, Sub-Agents and A2UI fixed-schema all do this.

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

**Thread names are all "Untitled".** Expected. `generateThreadNames` is off
because the adapter drops the runtime's injected system message and the title
can never be valid. See §9.15.

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
│           ├── registry.py    the 25 agents; id = AG-UI agent id = mount path
│           └── doc_reference/ published doc code that cannot be wired — never imported
│               ├── __init__.py             ← why this directory exists
│               ├── claude_agent_sdk_adapter.py   the incomplete tool bridge
│               ├── tool_rendering.py  state_streaming.py  shared_state.py
│               ├── subagents.py  a2ui_fixed.py  agent_config.py
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
        │   └── copilotkit-declarative-gen-ui/route.ts A2UI dynamic-schema
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
- [A2UI · Dynamic Schema](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/a2ui/dynamic-schema)
- [A2UI · Fixed Schema](https://docs.copilotkit.ai/claude-sdk-python/generative-ui/a2ui/fixed-schema)

**App Control**
- [Frontend Tools](https://docs.copilotkit.ai/claude-sdk-python/frontend-tools)
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
