/**
 * The nav, the route headers, and the README status table all read from here,
 * so a doc page and its implementation status are described exactly once.
 *
 * Route paths mirror the doc URLs under docs.copilotkit.ai/claude-sdk-python.
 * `agentId` is the id the agent is registered under in
 * `backend/src/agents/registry.py`, which is also the FastAPI path it is
 * mounted at — so a route, its doc page, and its agent line up in one place.
 *
 * On the statuses: five routes are `broken` for the same reason, and it is a
 * documentation gap rather than a bug in this repo. Their doc pages publish a
 * backend *tool* (get_weather, write_document, display_flight, the three
 * delegation tools) but no framework page shows how to register a backend tool
 * against `ClaudeAgentAdapter`. The Quickstart's `run_with_claude_agent_sdk`
 * bridge would, except it opens by calling six helpers it never defines. This
 * repo ships the doc's code as published and does not invent the bridge — see
 * README §9.
 */

/**
 * There is exactly one doc-sync date in this repo, and it is not here: it is
 * `syncedAt` in `doc-snapshot/manifest.json`, written every time the sync
 * button runs. A hand-maintained date alongside it only ever drifted out of
 * agreement with the machine one, so it was removed — `/doc-sync` is the
 * single place that answers "how current are these docs".
 */
export const DOCS_ROOT = "https://docs.copilotkit.ai/claude-sdk-python";

export type RouteStatus = "working" | "partial" | "reference" | "broken" | "not-started";

export interface RouteMeta {
  path: string;
  title: string;
  docPath: string;
  summary: string;
  status: RouteStatus;
  statusNote?: string;
  /** True when the page exists but the framework's doc sidebar omits it. */
  offNav?: boolean;
  /** Owns a live surface at `<path>/demo-chat`. */
  hasDemo?: boolean;
  /** Agent id from `backend/src/agents/registry.py`. */
  agentId?: string;
}

export function demoPath(route: RouteMeta): string | undefined {
  if (!route.hasDemo) return undefined;
  return route.path === "/" ? "/demo-chat" : `${route.path}/demo-chat`;
}

export interface NavGroup {
  title: string;
  routes: RouteMeta[];
}

/** The shared explanation behind every `broken` status in this repo. */
export const TOOL_BRIDGE_GAP =
  "The page's backend tool is published as a schema and a handler, but no doc page shows how to register a backend tool against ClaudeAgentAdapter, so the agent cannot call it.";

export const NAV: NavGroup[] = [
  {
    title: "Getting Started",
    routes: [
      {
        path: "/",
        title: "Introduction",
        docPath: "/claude-sdk-python",
        summary: "What this harness covers, and where the docs run out.",
        status: "reference",
        statusNote: "Landing page — orientation, the agent roster, and the tool-bridge gap.",
      },
      {
        path: "/quickstart",
        hasDemo: true,
        agentId: "claude_agent",
        title: "Quickstart",
        docPath: "/claude-sdk-python/quickstart?agent=bring-your-own",
        summary:
          "The bring-your-own-agent path: ClaudeAgentAdapter behind FastAPI, reached over AG-UI by the Copilot Runtime.",
        status: "working",
      },
    ],
  },
  {
    title: "Prebuilt Components",
    routes: [
      {
        path: "/prebuilt-components/chat",
        hasDemo: true,
        agentId: "agentic_chat",
        title: "CopilotChat",
        docPath: "/claude-sdk-python/prebuilt-components/chat",
        summary:
          "The base inline chat surface, sized to fill whatever container you give it.",
        status: "working",
        offNav: true,
      },
      {
        path: "/prebuilt-components/sidebar",
        hasDemo: true,
        agentId: "prebuilt-sidebar",
        title: "CopilotSidebar",
        docPath: "/claude-sdk-python/prebuilt-components/sidebar",
        summary:
          "The collapsible docked chat that sits alongside your main content rather than covering it.",
        status: "working",
        offNav: true,
      },
      {
        path: "/prebuilt-components/popup",
        hasDemo: true,
        agentId: "prebuilt-popup",
        title: "CopilotPopup",
        docPath: "/claude-sdk-python/prebuilt-components/popup",
        summary:
          "The floating launcher that opens an overlay chat on top of the page.",
        status: "working",
        offNav: true,
      },
      {
        path: "/prebuilt-components/chat-controls",
        hasDemo: true,
        agentId: "chat-controls",
        title: "Open, close, and feedback",
        docPath: "/claude-sdk-python/prebuilt-components/chat-controls",
        summary:
          "Driving modal state from your own UI with useCopilotChatConfiguration, and capturing thumbs up/down.",
        status: "working",
        offNav: true,
      },
    ],
  },
  {
    title: "Rich Threads",
    routes: [
      {
        path: "/prebuilt-components/copilot-threads-drawer",
        hasDemo: true,
        agentId: "threads",
        title: "Threads Drawer",
        docPath: "/claude-sdk-python/prebuilt-components/copilot-threads-drawer",
        summary:
          "The drop-in conversation switcher: a drawer and a chat sharing one configuration provider, with no active-thread state of your own.",
        status: "working",
        statusNote:
          "Needs CopilotKit Intelligence. Without INTELLIGENCE_API_KEY the runtime falls back to SSE and the list has nothing to show; without a licence token the drawer renders its locked view.",
      },
      {
        path: "/headless-threads",
        hasDemo: true,
        agentId: "threads",
        title: "Headless Threads",
        docPath: "/claude-sdk-python/headless-threads",
        summary:
          "The same thread store behind your own list UI, including the rename action the prebuilt drawer does not surface.",
        status: "working",
        statusNote:
          "Same Intelligence precondition as the drawer. The two-step 'New conversation' reset is this repo's, joining two doc fragments.",
      },
      {
        path: "/threads-lifecycle",
        hasDemo: true,
        agentId: "threads",
        title: "Thread & History Lifecycle",
        docPath: "/claude-sdk-python/threads-lifecycle",
        summary:
          "Where a threadId comes from and what moves it: mint, run, hydrate, switch — with the live id and its explicit flag on screen.",
        status: "working",
        statusNote:
          "Same Intelligence precondition. Scoping to a signed-in user, first-message thread creation and the checkpointer comparison are out of scope for a local harness.",
      },
    ],
  },
  {
    title: "Custom Look and Feel",
    routes: [
      {
        path: "/custom-look-and-feel/css",
        hasDemo: true,
        agentId: "chat-customization-css",
        title: "CSS Customization",
        docPath: "/claude-sdk-python/custom-look-and-feel/css",
        summary:
          "Re-skinning the chat with the doc's Halcyon variables and the .copilotKit* class hooks.",
        status: "working",
        offNav: true,
      },
      {
        path: "/custom-look-and-feel/slots",
        hasDemo: true,
        agentId: "chat-slots",
        title: "Slots",
        docPath: "/claude-sdk-python/custom-look-and-feel/slots",
        summary:
          "Overriding chat sub-components at all three levels: class strings, prop objects, and whole components.",
        status: "working",
        offNav: true,
      },
      {
        path: "/custom-look-and-feel/headless-ui",
        hasDemo: true,
        agentId: "headless-simple",
        title: "Headless UI",
        docPath: "/claude-sdk-python/custom-look-and-feel/headless-ui",
        summary:
          "A chat built from useAgent, useCopilotKit and useRenderToolCall alone, with no CopilotKit chrome.",
        status: "working",
        offNav: true,
      },
      {
        path: "/custom-look-and-feel/reasoning-messages",
        hasDemo: true,
        agentId: "reasoning-default",
        title: "Reasoning Messages",
        docPath: "/claude-sdk-python/custom-look-and-feel/reasoning-messages",
        summary:
          "The built-in reasoning card, and the header/content sub-slots that replace parts of it.",
        status: "working",
        offNav: true,
        statusNote:
          "Reasoning arrives from Claude extended thinking, which the adapter turns into REASONING_MESSAGE_* events. The doc's own reasoning_agent.py bypasses the adapter entirely — see README §9.",
      },
    ],
  },
  {
    title: "Input Modalities",
    routes: [
      {
        path: "/multimodal-attachments",
        hasDemo: true,
        agentId: "multimodal",
        title: "Multimodal Attachments",
        docPath: "/claude-sdk-python/multimodal-attachments",
        summary:
          "Drag-and-drop file attachments sent to the agent as AG-UI content parts.",
        status: "working",
      },
      {
        path: "/voice",
        hasDemo: true,
        agentId: "voice",
        title: "Voice",
        docPath: "/claude-sdk-python/voice",
        summary:
          "A second runtime carrying a TranscriptionService, which is what makes the composer grow a mic button.",
        status: "working",
        statusNote:
          "The mic transcribes through OpenAI Whisper, so it needs OPENAI_API_KEY. Without one the route still runs via the doc's sample-audio button.",
      },
    ],
  },
  {
    title: "Generative UI",
    routes: [
      {
        path: "/generative-ui/reasoning",
        hasDemo: true,
        agentId: "reasoning-custom",
        title: "Reasoning",
        docPath: "/claude-sdk-python/generative-ui/reasoning",
        summary:
          "Replacing the whole reasoning card through the messageView.reasoningMessage slot.",
        status: "working",
        statusNote: "Same extended-thinking dependency as Reasoning Messages.",
      },
      {
        path: "/generative-ui/tool-based",
        hasDemo: true,
        agentId: "gen-ui-tool-based",
        title: "Components as Tools",
        docPath: "/claude-sdk-python/generative-ui/tool-based",
        summary:
          "useComponent registering a React component as a tool the agent calls to render it.",
        status: "working",
        statusNote:
          "Works because useComponent registers a *frontend* tool, which the adapter forwards to Claude on its own.",
      },
      {
        path: "/generative-ui/tool-rendering",
        hasDemo: true,
        agentId: "tool-rendering",
        title: "Tool Call Rendering",
        docPath: "/claude-sdk-python/generative-ui/tool-rendering",
        summary:
          "Named renderers for get_weather and search_flights, plus the wildcard catch-all from useDefaultRenderTool.",
        status: "broken",
        statusNote:
          "The renderers are live but nothing calls them: get_weather ships as a schema and a handler with no way to reach the model. Ask for weather and you get prose, not a card.",
      },
      {
        path: "/generative-ui/state-rendering",
        hasDemo: true,
        agentId: "shared-state-streaming",
        title: "State Rendering",
        docPath: "/claude-sdk-python/generative-ui/state-rendering",
        summary:
          "Rendering agent state as it changes, driven by the same write_document tool as State Streaming.",
        status: "broken",
        statusNote:
          "The useAgent subscription is live, but the doc's stream_document_state consumes a raw Anthropic stream this backend never produces.",
      },
      {
        path: "/generative-ui/a2ui/dynamic-schema",
        hasDemo: true,
        agentId: "declarative-gen-ui",
        title: "A2UI · Dynamic Schema",
        docPath: "/claude-sdk-python/generative-ui/a2ui/dynamic-schema",
        summary:
          "A bring-your-own-catalog dashboard where a secondary LLM designs the surface per request.",
        status: "working",
        statusNote:
          "The catalog is the doc's; passing it on the provider auto-injects generate_a2ui as a frontend tool, so no backend tool is needed. The doc's renderers.tsx has no import block — see README §9.",
      },
      {
        path: "/generative-ui/a2ui/fixed-schema",
        hasDemo: true,
        agentId: "a2ui-fixed-schema",
        title: "A2UI · Fixed Schema",
        docPath: "/claude-sdk-python/generative-ui/a2ui/fixed-schema",
        summary:
          "A flight card whose component tree is authored as JSON up front; the tool supplies only the data.",
        status: "broken",
        statusNote:
          "display_flight is a backend tool, so it is unreachable. The doc also omits flight_schema.json and the SURFACE_ID/CATALOG_ID constants, and its renderers.tsx has no import block — see README §9.",
      },
    ],
  },
  {
    title: "App Control",
    routes: [
      {
        path: "/frontend-tools",
        hasDemo: true,
        agentId: "frontend_tools",
        title: "Frontend Tools",
        docPath: "/claude-sdk-python/frontend-tools",
        summary:
          "A tool the agent calls that executes in the browser and changes the page.",
        status: "working",
      },
      {
        path: "/human-in-the-loop",
        hasDemo: true,
        agentId: "hitl-in-chat",
        title: "Human in the Loop",
        docPath: "/claude-sdk-python/human-in-the-loop",
        summary:
          "useHumanInTheLoop suspending the run behind a time picker until the user answers.",
        status: "working",
      },
      {
        path: "/programmatic-control",
        hasDemo: true,
        agentId: "programmatic-control",
        title: "Programmatic Control",
        docPath: "/claude-sdk-python/programmatic-control",
        summary:
          "Driving runs from code with addMessage, runAgent, stopAgent and subscribe — no chat component.",
        status: "partial",
        statusNote:
          "addMessage / runAgent / subscribe all work. The page's own promise-based pause section renders as a placeholder in the published docs: 'snippet skipped: region headless-promise-primitives missing'.",
      },
    ],
  },
  {
    title: "Shared State",
    routes: [
      {
        path: "/shared-state",
        hasDemo: true,
        agentId: "shared-state-read-write",
        title: "Shared State",
        docPath: "/claude-sdk-python/shared-state",
        summary:
          "The two-way channel: the UI writes preferences through setState, the agent writes notes back.",
        status: "broken",
        statusNote:
          "The UI-to-agent direction works. The agent-to-UI direction does not: set_notes is a backend tool with no registration path, and the adapter's ag_ui_update_state substitute does not carry notes back to the panel in practice.",
      },
      {
        path: "/shared-state/rendering-in-app",
        hasDemo: true,
        agentId: "shared-state-read-write",
        title: "Render state in your app",
        docPath: "/claude-sdk-python/shared-state/rendering-in-app",
        summary:
          "The same agent state rendered as a main-view canvas rather than inside the chat.",
        status: "working",
        statusNote:
          "The doc page is framework-neutral and ships a generic Canvas, so this route follows the google-adk layout: canvas as primary content, chat docked beside it.",
      },
      {
        path: "/shared-state/streaming",
        hasDemo: true,
        agentId: "shared-state-streaming",
        title: "State Streaming",
        docPath: "/claude-sdk-python/shared-state/streaming",
        summary:
          "Forwarding a tool argument into a state key while it is still being generated.",
        status: "broken",
        statusNote:
          "Same gap as State Rendering: write_document is a backend tool, and stream_document_state needs a raw Anthropic stream the adapter does not expose.",
      },
      {
        path: "/shared-state/agent-readonly",
        hasDemo: true,
        agentId: "readonly-state-agent-context",
        title: "Agent Read-Only Context",
        docPath: "/claude-sdk-python/shared-state/agent-readonly",
        summary:
          "useAgentContext as a one-way UI-to-agent channel — props for the agent, with no setter.",
        status: "working",
        statusNote:
          "The adapter folds input_data.context into the system prompt itself, which is exactly what the doc's snippet does by hand.",
      },
    ],
  },
  {
    title: "Multi-Agent",
    routes: [
      {
        path: "/multi-agent/subagents",
        hasDemo: true,
        agentId: "subagents",
        title: "Sub-Agents",
        docPath: "/claude-sdk-python/multi-agent/subagents",
        summary:
          "A supervisor delegating to research, writing and critique sub-agents, with a live delegation log.",
        status: "broken",
        statusNote:
          "The three delegation tools are backend tools, so the supervisor has nothing to call. The log renders and stays empty.",
      },
    ],
  },
  {
    title: "Agent Config",
    routes: [
      {
        path: "/agent-config",
        hasDemo: true,
        agentId: "agent-config",
        title: "Agent Config",
        docPath: "/claude-sdk-python/agent-config",
        summary:
          "A typed config object the UI owns, published to the agent and folded into the system prompt each turn.",
        status: "partial",
        statusNote:
          "The doc's useAgentContext frontend works. Its backend half does not: read_properties reads forwarded_props, and the adapter drops every key outside its ALLOWED_FORWARDED_PROPS whitelist — tone, expertise and responseLength are all outside it.",
      },
    ],
  },
  {
    title: "Doc Sync",
    routes: [
      {
        path: "/doc-sync",
        title: "Doc drift",
        docPath: "/claude-sdk-python",
        summary:
          "Re-fetches the markdown behind every tracked doc page and diffs it against the stored snapshot, flagging changes inside code blocks.",
        status: "reference",
      },
    ],
  },
];

export const ALL_ROUTES: RouteMeta[] = NAV.flatMap((g) => g.routes);

export function findRoute(path: string): RouteMeta | undefined {
  return ALL_ROUTES.find((r) => r.path === path);
}

export function docUrl(route: RouteMeta): string {
  return `https://docs.copilotkit.ai${route.docPath}`;
}

export const STATUS_LABEL: Record<RouteStatus, string> = {
  working: "Working",
  partial: "Partial",
  reference: "Reference",
  broken: "Broken",
  "not-started": "Not started",
};
