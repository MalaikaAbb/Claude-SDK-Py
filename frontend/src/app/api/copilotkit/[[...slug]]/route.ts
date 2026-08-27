import { HttpAgent } from "@ag-ui/client";
import {
  CopilotKitIntelligence,
  CopilotRuntime,
  InMemoryAgentRunner,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";

import { AGENT_IDS, AGENT_URL, A2UI_FIXED_AGENT_ID } from "@/lib/agents";

/**
 * The Copilot Runtime, on the v2 surface the Quickstart now builds it on.
 *
 * Three things moved when the doc switched off the v1 runtime, and all three
 * are load-bearing:
 *
 *   - The import is `@copilotkit/runtime/v2`. There is no `serviceAdapter` on
 *     this surface at all — `ExperimentalEmptyAdapter` belonged to the v1
 *     GraphQL runtime and has no counterpart here.
 *   - `createCopilotRuntimeHandler` returns a plain fetch handler rather than a
 *     `{ handleRequest }` wrapper, so the route is just the verb exports below.
 *   - The Quickstart keeps the file at `route.ts` and passes
 *     `mode: "single-route"`, which serves one POST carrying a
 *     `{ method, params, body }` envelope. That is enough for chat and nothing
 *     else.
 *
 * This harness needs the *other* mode. Rich Threads are REST: listing,
 * renaming, archiving and deleting a thread are separate verbs on separate
 * paths, and `/info` is what tells the client whether Intelligence is on at
 * all. `mode: "multi-route"` (the default) serves that subtree, which is why
 * this file sits at `[[...slug]]/route.ts` — a single-segment route would 404
 * everything except the bare URL. Three routes in this repo would break under
 * the Quickstart's literal config, so the deviation is deliberate and is
 * called out on the Quickstart page.
 */

// One HttpAgent per registered agent. The Quickstart registers exactly one
// (`claude_agent`) at the server root; this harness needs a conversation per
// doc route, so the Python server mounts each at `/{agent_id}`.
const agents = Object.fromEntries(
  AGENT_IDS.map((id) => [id, new HttpAgent({ url: `${AGENT_URL}/${id}` })]),
);

/**
 * Server-side only, and deliberately not `NEXT_PUBLIC_`. A project key
 * prefixed for the browser would ship in the client bundle.
 */
const INTELLIGENCE_API_KEY = process.env.INTELLIGENCE_API_KEY;

/**
 * A SECOND, SEPARATE credential — and the one that unlocks the Threads Drawer.
 *
 * `INTELLIGENCE_API_KEY` authorizes the runtime against the platform: it is
 * what makes `/info` report Intelligence mode and what makes the thread REST
 * endpoints return real rows. It does NOT advertise a licence.
 *
 * `licenseToken` is what does. The runtime builds a licence checker from it,
 * and `/info` reports the status off that checker. Client-side feature UIs read
 * that field, and `<CopilotThreadsDrawer>` renders its locked view unless the
 * status is valid — regardless of whether threads actually work.
 *
 * So a runtime can serve threads perfectly while every drawer in the app shows
 * a locked panel. Set both to avoid that.
 */
const LICENSE_TOKEN = process.env.COPILOTKIT_LICENSE_TOKEN;

/**
 * The A2UI block the fixed-schema page prescribes: enabled for that one agent,
 * with injection off because in that pattern the agent owns `display_flight`
 * itself and a second injected `generate_a2ui` would give the model two ways to
 * draw one card.
 *
 * The dynamic-schema route deliberately does not go through this runtime — it
 * has its own at /api/copilotkit-declarative-gen-ui, where the catalog on the
 * provider is what turns A2UI on and injects the tool.
 */
const a2ui = { injectA2UITool: false, agents: [A2UI_FIXED_AGENT_ID] };

/**
 * `CopilotRuntimeOptions` is a union, not one object with optional fields:
 * Intelligence mode requires both `intelligence` and `identifyUser`, and the
 * SSE shape declares both as `undefined`. So the two are built separately
 * rather than spread conditionally into one literal.
 *
 * Without a key the runtime falls back to SSE with an in-memory runner. Chat
 * still works on all 24 agents; the three Rich Threads routes and the
 * Inspector's Threads tab stay locked, and the key is never read.
 */
function buildRuntime(): CopilotRuntime {
  if (!INTELLIGENCE_API_KEY) {
    return new CopilotRuntime({
      agents,
      a2ui,
      runner: new InMemoryAgentRunner(),
      ...(LICENSE_TOKEN ? { licenseToken: LICENSE_TOKEN } : {}),
    });
  }

  return new CopilotRuntime({
    agents,
    a2ui,
    ...(LICENSE_TOKEN ? { licenseToken: LICENSE_TOKEN } : {}),
    intelligence: new CopilotKitIntelligence({
      // apiUrl and wsUrl default to the managed platform. They are DIFFERENT
      // hosts — api.intelligence… and realtime.intelligence… are deployed
      // separately, so wsUrl cannot be derived by scheme-swapping apiUrl.
      // Override both together or neither.
      apiKey: INTELLIGENCE_API_KEY,
    }),
    // Off, because it cannot work through ClaudeAgentAdapter and costs three
    // Claude runs per new thread to discover that.
    //
    // The runtime names a thread by cloning the agent and sending it two
    // messages: a system message ("Return JSON only in this exact shape:
    // {\"title\":\"...\"}") and a user message carrying the transcript. It then
    // requires an assistant reply that is a plain string of at most 8 words.
    //
    // ClaudeAgentAdapter reads only `messages[-1]` — `get_user_message` in
    // ag_ui_claude_sdk/utils.py says so outright ("we only use the last one").
    // The system message is discarded, so the model answers the transcript
    // prompt under THIS agent's system prompt and replies conversationally.
    // normalizeGeneratedTitle then rejects it and the runtime logs "Thread name
    // generation returned an empty or invalid title" three times before falling
    // back to "Untitled".
    //
    // Set this to true to watch that happen; nothing else changes.
    generateThreadNames: false,
    // Threads are per-user. Without this every visitor shares one history.
    // `Providers` sends these headers so the harness has a stable identity to
    // key threads on; a real app would read them from a verified session, which
    // is what the Thread & History Lifecycle page shows.
    identifyUser: (request) => ({
      id: request.headers.get("x-user-id") ?? "anonymous",
      name: request.headers.get("x-user-name") ?? "Anonymous",
    }),
  });
}

const handler = createCopilotRuntimeHandler({
  runtime: buildRuntime(),
  basePath: "/api/copilotkit",
});

// Four verbs, not one. GET serves `/info` and the thread list, POST runs
// agents, and PATCH/DELETE are how threads are renamed, archived and deleted.
export { handler as GET, handler as POST, handler as PATCH, handler as DELETE };
