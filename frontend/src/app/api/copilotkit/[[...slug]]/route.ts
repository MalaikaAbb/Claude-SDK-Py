import { HttpAgent } from "@ag-ui/client";
import {
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
 * SSE mode, deliberately — Intelligence is NOT attached to this runtime.
 *
 * When a provider connects to an Intelligence runtime, the client starts a
 * thread adapter for EVERY agent that runtime advertises on `/info`: a
 * `GET /threads?agentId=…`, a `POST /threads/subscribe`, and a WebSocket that
 * retries on failure (`MAX_SOCKET_RETRIES = 5`, 15s timeout) — on every page,
 * whether or not it mounts a chat. This runtime advertises 25, so attaching
 * Intelligence here meant ~25 list fetches and 25 retrying sockets per page
 * load. That is enough to lock up a machine in dev, where Next also mirrors
 * every browser warning back to the server.
 *
 * The Rich Threads routes use `/api/copilotkit-threads`, which registers
 * exactly one agent. See that file.
 */
const runtime = new CopilotRuntime({
  agents,
  a2ui,
  runner: new InMemoryAgentRunner(),
  ...(LICENSE_TOKEN ? { licenseToken: LICENSE_TOKEN } : {}),
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit",
});

// Four verbs, not one. GET serves `/info` and the thread list, POST runs
// agents, and PATCH/DELETE are how threads are renamed, archived and deleted.
export { handler as GET, handler as POST, handler as PATCH, handler as DELETE };
