/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ADAPT THIS FILE — 3 of 3
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * One entry per doc page, in the order the doc nav lists them.
 *
 * Entries are deliberately short. `docUrl`, `demoUrl` and the output filename
 * are derived from `project.config.ts` plus the fields below, so no entry can
 * point at the wrong framework's docs and filenames stay in nav order without
 * anyone numbering them by hand.
 *
 * ── Where this list came from ──────────────────────────────────────────────
 * Generated from `frontend/src/lib/nav-config.ts`, which is this app's single
 * source of truth for route -> doc-page mapping. Every route carrying
 * `hasDemo: true` is registered here, in nav order; routes without a
 * `demo-chat` page are reference material and are deliberately absent, because
 * `demoUrl` is always `route + demoSuffix` and the doctor errors on any that
 * is not 200.
 *
 * Re-derive rather than hand-edit when the nav changes, then re-check the line
 * ranges below.
 *
 * ── The prompts are part of the test, not filler ───────────────────────────
 * A prompt has one job: make the page do the thing the doc page is about. That
 * sounds obvious and is easy to get wrong — "Can you tell me a joke?" produces a
 * perfectly good reply on the Tool Call Rendering route while calling no tool,
 * rendering no card, and demonstrating nothing. Every prompt below either
 * reproduces the page's own `useConfigureSuggestions` entry or names the thing
 * the page's tool exists to do.
 *
 * Three routes ignore `prompt` entirely because they are driven some other way —
 * Voice fills the composer from its sample-audio button, Programmatic Control
 * runs the page's own hard-coded message from a button, and Multimodal attaches
 * a file first. Their `prompt` is set to what actually gets sent, so this file
 * does not describe a run that never happens.
 *
 * ── The line ranges ────────────────────────────────────────────────────────
 * `startLine`/`endLine` are what the simulated IDE highlights, and they drift
 * the moment someone edits a demo page. `npm run doctor` checks each range
 * points at real code; where a file carries `[!code highlight]` or `#region`
 * markers it also checks the range still covers one. It cannot check that the
 * range points at the *interesting* code, so each one below was opened and read:
 * several used to land on a closing comment, a blank line, or the middle of a
 * constant.
 */

import { definePages } from '../core/types';

export const PAGES = definePages([
  {
    id: "quickstart",
    name: "Getting Started - Quickstart",
    videoName: "Quickstart",
    docPath: "quickstart?agent=bring-your-own",
    route: "quickstart",
    // Tab one is the dependency manifest, deliberately and permanently: a demo
    // video is only evidence if the viewer can see which package versions it
    // worked against. See ADAPT.md step 3.
    ideFile: "frontend/package.json",
    startLine: 12,
    endLine: 28,
    extraTabs: [
      { filePath: "frontend/src/app/quickstart/demo-chat/page.tsx", startLine: 15, endLine: 31 },
      // The runtime lives at `[[...slug]]/route.ts`, not `route.ts`: this repo
      // needs multi-route mode for the thread REST verbs, and a single-segment
      // route 404s everything but the bare URL. The path without the slug
      // segment does not exist, and pointed the IDE at a missing file.
      {
        filePath: "frontend/src/app/api/copilotkit/[[...slug]]/route.ts",
        startLine: 87,
        endLine: 101,
      },
      { filePath: "backend/src/agent_server.py", startLine: 52, endLine: 56 },
    ],
    prompt: "Can you tell me a joke?",
    waitAfterPromptMs: 4000,
  },
  {
    id: "prebuilt-components-chat",
    name: "Prebuilt Components - CopilotChat",
    videoName: "CopilotChat",
    docPath: "prebuilt-components/chat",
    route: "prebuilt-components/chat",
    ideFile: "frontend/src/app/prebuilt-components/chat/demo-chat/page.tsx",
    startLine: 23,
    endLine: 35,
    // The page's own first suggestion.
    prompt: "Write a short sonnet about AI.",
    waitAfterPromptMs: 4000,
  },
  {
    id: "prebuilt-components-sidebar",
    name: "Prebuilt Components - CopilotSidebar",
    videoName: "CopilotSidebar",
    docPath: "prebuilt-components/sidebar",
    route: "prebuilt-components/sidebar",
    ideFile: "frontend/src/app/prebuilt-components/sidebar/demo-chat/page.tsx",
    startLine: 29,
    endLine: 45,
    prompt: "What is the difference between a sidebar and a popup chat?",
    waitAfterPromptMs: 4000,
  },
  {
    id: "prebuilt-components-popup",
    name: "Prebuilt Components - CopilotPopup",
    videoName: "CopilotPopup",
    docPath: "prebuilt-components/popup",
    route: "prebuilt-components/popup",
    ideFile: "frontend/src/app/prebuilt-components/popup/demo-chat/page.tsx",
    startLine: 22,
    endLine: 43,
    prompt: "Why would I pick a popup over a sidebar?",
    waitAfterPromptMs: 4000,
  },
  {
    id: "prebuilt-components-chat-controls",
    name: "Prebuilt Components - Open, close, and feedback",
    videoName: "OpenCloseAndFeedback",
    docPath: "prebuilt-components/chat-controls",
    route: "prebuilt-components/chat-controls",
    ideFile: "frontend/src/app/prebuilt-components/chat-controls/demo-chat/page.tsx",
    // The sidebar with its onThumbsUp/onThumbsDown wiring — the half the
    // handler proves by watching the feedback log gain a row. The external
    // open/close button is the `ChatControls` component lower in the same file.
    startLine: 109,
    endLine: 119,
    prompt: "In one sentence, what is a copilot sidebar for?",
    waitAfterPromptMs: 4000,
  },
  {
    id: "custom-look-and-feel-css",
    name: "Custom Look and Feel - CSS Customization",
    videoName: "CSSCustomization",
    docPath: "custom-look-and-feel/css",
    route: "custom-look-and-feel/css",
    ideFile: "frontend/src/app/custom-look-and-feel/css/demo-chat/page.tsx",
    startLine: 20,
    endLine: 38,
    prompt: "Can you tell me a joke?",
    waitAfterPromptMs: 4000,
  },
  {
    id: "custom-look-and-feel-slots",
    name: "Custom Look and Feel - Slots",
    videoName: "Slots",
    docPath: "custom-look-and-feel/slots",
    route: "custom-look-and-feel/slots",
    ideFile: "frontend/src/app/custom-look-and-feel/slots/demo-chat/page.tsx",
    startLine: 29,
    endLine: 56,
    prompt: "Can you tell me a joke?",
    waitAfterPromptMs: 4000,
  },
  {
    id: "custom-look-and-feel-headless-ui",
    name: "Custom Look and Feel - Headless UI",
    videoName: "HeadlessUI",
    docPath: "custom-look-and-feel/headless-ui",
    route: "custom-look-and-feel/headless-ui",
    ideFile: "frontend/src/app/custom-look-and-feel/headless-ui/demo-chat/page.tsx",
    // `send` — the doc's verbatim addMessage + runAgent pair, which is the page.
    // The old range stopped at the `useAgent` line and a blank.
    startLine: 71,
    endLine: 88,
    prompt: "Name three colours, comma separated.",
    waitAfterPromptMs: 4000,
  },
  {
    id: "custom-look-and-feel-reasoning-messages",
    name: "Custom Look and Feel - Reasoning Messages",
    videoName: "ReasoningMessages",
    docPath: "custom-look-and-feel/reasoning-messages",
    route: "custom-look-and-feel/reasoning-messages",
    ideFile: "frontend/src/app/custom-look-and-feel/reasoning-messages/demo-chat/page.tsx",
    startLine: 91,
    endLine: 99,
    // Has to be worth thinking about, or Claude emits no thinking blocks, the
    // adapter emits no REASONING_MESSAGE_* events, and the card never renders.
    // The page's own first suggestion.
    prompt:
      "A train leaves at 2:15pm going 60mph. Another leaves the same station at 3:00pm going 75mph. When does the second catch the first?",
    waitAfterPromptMs: 4000,
  },
  {
    id: "multimodal-attachments",
    name: "Input Modalities - Multimodal Attachments",
    videoName: "MultimodalAttachments",
    docPath: "multimodal-attachments",
    route: "multimodal-attachments",
    ideFile: "frontend/src/app/multimodal-attachments/demo-chat/page.tsx",
    // The `attachments` block itself: enabled, accept filter, maxSize, and both
    // error callbacks. The old range covered the component's opening lines and
    // the error list markup instead.
    startLine: 57,
    endLine: 86,
    // The handler attaches a solid-red PNG before this is sent.
    prompt: "What colour is the image I attached?",
    waitAfterPromptMs: 4000,
  },
  {
    id: "voice",
    name: "Input Modalities - Voice",
    videoName: "Voice",
    docPath: "voice",
    route: "voice",
    ideFile: "frontend/src/app/voice/demo-chat/page.tsx",
    startLine: 25,
    endLine: 48,
    // Not typed: the handler clicks "Try a sample audio", which writes exactly
    // this into the composer through the native value setter. Kept in sync with
    // SAMPLE_TEXT in the page.
    prompt: "What can a Claude Agent SDK agent do that a plain chatbot cannot?",
    waitAfterPromptMs: 4000,
  },
  {
    id: "generative-ui-reasoning",
    name: "Generative UI - Reasoning",
    videoName: "Reasoning",
    docPath: "generative-ui/reasoning",
    route: "generative-ui/reasoning",
    ideFile: "frontend/src/app/generative-ui/reasoning/demo-chat/page.tsx",
    startLine: 50,
    endLine: 59,
    // The page's own second suggestion — a puzzle, so the thinking channel has
    // something to carry.
    prompt:
      "Three boxes are labelled apples, oranges, and mixed. Every label is wrong. How many fruit must you draw to fix all three?",
    waitAfterPromptMs: 4000,
  },
  {
    id: "generative-ui-tool-based",
    name: "Generative UI - Components as Tools",
    videoName: "ComponentsAsTools",
    docPath: "generative-ui/tool-based",
    route: "generative-ui/tool-based",
    ideFile: "frontend/src/app/generative-ui/tool-based/demo-chat/page.tsx",
    startLine: 43,
    endLine: 48,
    // Named data, so the chart has something real to draw and the recording
    // shows labelled bars rather than an invented placeholder.
    prompt: "Chart quarterly revenue for last year: Q1 120, Q2 145, Q3 138, Q4 190.",
    waitAfterPromptMs: 4000,
  },
  {
    id: "generative-ui-tool-rendering",
    name: "Generative UI - Tool Call Rendering",
    videoName: "ToolCallRendering",
    docPath: "generative-ui/tool-rendering",
    route: "generative-ui/tool-rendering",
    ideFile: "frontend/src/app/generative-ui/tool-rendering/demo-chat/page.tsx",
    startLine: 74,
    endLine: 112,
    prompt: "What's the weather in Tokyo?",
    waitAfterPromptMs: 4000,
  },
  {
    id: "generative-ui-state-rendering",
    name: "Generative UI - State Rendering",
    videoName: "StateRendering",
    docPath: "generative-ui/state-rendering",
    route: "generative-ui/state-rendering",
    ideFile: "frontend/src/app/generative-ui/state-rendering/demo-chat/page.tsx",
    startLine: 39,
    endLine: 42,
    // Must produce a document, or the canvas this page is about stays empty.
    prompt: "Draft a one-paragraph product brief for a habit tracker.",
    waitAfterPromptMs: 4000,
  },
  {
    id: "generative-ui-a2ui-dynamic-schema",
    name: "Generative UI - A2UI · Dynamic Schema",
    videoName: "A2UIDynamicSchema",
    docPath: "generative-ui/a2ui/dynamic-schema",
    route: "generative-ui/a2ui/dynamic-schema",
    ideFile: "frontend/src/app/generative-ui/a2ui/dynamic-schema/demo-chat/page.tsx",
    startLine: 26,
    endLine: 36,
    prompt: "Show me a dashboard of this quarter's sales.",
    waitAfterPromptMs: 4000,
  },
  {
    id: "generative-ui-a2ui-fixed-schema",
    name: "Generative UI - A2UI · Fixed Schema",
    videoName: "A2UIFixedSchema",
    docPath: "generative-ui/a2ui/fixed-schema",
    route: "generative-ui/a2ui/fixed-schema",
    ideFile: "frontend/src/app/generative-ui/a2ui/fixed-schema/demo-chat/page.tsx",
    startLine: 29,
    endLine: 48,
    // Names both airports, so `display_flight` has its origin/destination
    // arguments without a clarifying turn.
    prompt: "Find me a flight from SFO to JFK.",
    waitAfterPromptMs: 4000,
  },
  {
    id: "frontend-tools",
    name: "App Control - Frontend Tools",
    videoName: "FrontendTools",
    docPath: "frontend-tools",
    route: "frontend-tools",
    ideFile: "frontend/src/app/frontend-tools/demo-chat/page.tsx",
    startLine: 36,
    endLine: 50,
    // The tool's description asks for gradients, so naming one makes the
    // repaint unmistakable on video.
    prompt: "Change the page background to a warm sunset gradient.",
    waitAfterPromptMs: 4000,
  },
  {
    id: "human-in-the-loop",
    name: "App Control - Human in the Loop",
    videoName: "HumanInTheLoop",
    docPath: "human-in-the-loop",
    route: "human-in-the-loop",
    ideFile: "frontend/src/app/human-in-the-loop/demo-chat/page.tsx",
    startLine: 94,
    endLine: 116,
    // Supplies both of book_call's arguments (topic, attendee), so the model
    // calls the tool instead of asking who the call is with.
    prompt: "Please book an intro call with the sales team to discuss pricing.",
    waitAfterPromptMs: 4000,
  },
  {
    id: "human-in-the-loop-governed-actions",
    name: "App Control - Governed Action Approval",
    videoName: "GovernedActionApproval",
    docPath: "human-in-the-loop/governed-actions",
    route: "human-in-the-loop/governed-actions",
    ideFile: "frontend/src/app/human-in-the-loop/governed-actions/demo-chat/page.tsx",
    // GovernedActionApproval — the page's useInterrupt block, which the first
    // half of the recording drives. The tool-call block follows it.
    startLine: 117,
    endLine: 161,
    extraTabs: [
      { filePath: "frontend/src/app/human-in-the-loop/governed-actions/governed-action.tsx", startLine: 26, endLine: 45 },
      { filePath: "backend/src/agents/governance.py", startLine: 100, endLine: 128 },
      { filePath: "backend/src/agents/governance_bridge.py", startLine: 112, endLine: 170 },
    ],
    // One prompt per tab, both require_approval under the server policy:
    // outside mail for useInterrupt, a 20% discount for useHumanInTheLoop.
    prompt: "Email the Q3 pricing sheet to dana@globex.com.",
    prompts: [
      "Email the Q3 pricing sheet to dana@globex.com.",
      "Give Initech a 20% discount on their next invoice.",
    ],
    waitAfterPromptMs: 4000,
  },
  {
    id: "programmatic-control",
    name: "App Control - Programmatic Control",
    videoName: "ProgrammaticControl",
    docPath: "programmatic-control",
    route: "programmatic-control",
    ideFile: "frontend/src/app/programmatic-control/demo-chat/page.tsx",
    // `run` — addMessage then runAgent, which is the whole page. The old range
    // (27-31) covered an unused id helper, a type alias and a blank line.
    startLine: 31,
    endLine: 45,
    // Not typed: the handler clicks "Run agent" and the page appends this
    // message itself. Kept in sync with the string in `run`.
    prompt: "Summarize the latest sales data",
    waitAfterPromptMs: 4000,
  },
  {
    id: "shared-state",
    name: "Shared State - Shared State",
    videoName: "SharedState",
    docPath: "shared-state",
    route: "shared-state",
    ideFile: "frontend/src/app/shared-state/demo-chat/page.tsx",
    // handlePreferencesChange — the UI→agent write the handler drives by
    // typing a name into the preferences panel.
    startLine: 81,
    endLine: 90,
    // Two turns: write something for the agent to keep, then ask it back. The
    // second turn is what shows whether the state round-tripped.
    prompt: "Remember that I prefer morning meetings and hate slide decks.",
    prompts: [
      "Remember that I prefer morning meetings and hate slide decks.",
      "What do you know about me so far?",
    ],
    waitAfterPromptMs: 4000,
  },
  {
    id: "shared-state-rendering-in-app",
    name: "Shared State - Render state in your app",
    videoName: "RenderStateInYourApp",
    docPath: "shared-state/rendering-in-app",
    route: "shared-state/rendering-in-app",
    ideFile: "frontend/src/app/shared-state/rendering-in-app/demo-chat/page.tsx",
    // The subscription with no chat component in its subtree, which is the
    // page's point. The old range landed inside the INITIAL_CANVAS_STATE
    // literal.
    startLine: 62,
    endLine: 66,
    prompt: "Remember that I ship on Fridays and that the Q3 review is on the 14th.",
    waitAfterPromptMs: 4000,
  },
  {
    id: "shared-state-streaming",
    name: "Shared State - State Streaming",
    videoName: "StateStreaming",
    docPath: "shared-state/streaming",
    route: "shared-state/streaming",
    ideFile: "frontend/src/app/shared-state/streaming/demo-chat/page.tsx",
    startLine: 37,
    endLine: 43,
    prompt: "Write a short essay about why small teams ship faster.",
    waitAfterPromptMs: 4000,
  },
  {
    id: "shared-state-agent-readonly",
    name: "Shared State - Agent Read-Only Context",
    videoName: "AgentReadOnlyContext",
    docPath: "shared-state/agent-readonly",
    route: "shared-state/agent-readonly",
    ideFile: "frontend/src/app/shared-state/agent-readonly/demo-chat/page.tsx",
    startLine: 63,
    endLine: 74,
    // Asks for values that exist only in `useAgentContext`, so the answer is
    // itself the evidence that the one-way channel delivered.
    prompt: "What's my name and what timezone am I in?",
    waitAfterPromptMs: 4000,
  },
  {
    id: "multi-agent-subagents",
    name: "Multi-Agent - Sub-Agents",
    videoName: "SubAgents",
    docPath: "multi-agent/subagents",
    route: "multi-agent/subagents",
    ideFile: "frontend/src/app/multi-agent/subagents/demo-chat/page.tsx",
    startLine: 37,
    endLine: 40,
    // The page's own suggestion: a request the supervisor would delegate if it
    // had anything to delegate to. It does not — the three delegation tools are
    // backend tools with no registration path — so the log stays empty and the
    // supervisor explains its plan. That is the documented state of this route.
    prompt: "Write a short brief on why remote teams struggle with onboarding.",
    waitAfterPromptMs: 4000,
  },
  {
    id: "agent-config",
    name: "Agent Config - Agent Config",
    videoName: "AgentConfig",
    docPath: "agent-config",
    route: "agent-config",
    ideFile: "frontend/src/app/agent-config/demo-chat/page.tsx",
    startLine: 49,
    endLine: 59,
    // Deliberately neutral: the handler sets tone/expertise/length on the panel
    // first, so the answer's shape is the only place that config can show up.
    prompt: "Explain what a database index is.",
    waitAfterPromptMs: 4000,
  },
]);
