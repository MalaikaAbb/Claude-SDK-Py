import { HttpAgent } from "@ag-ui/client";
import {
  CopilotKitIntelligence,
  CopilotRuntime,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";

import { AGENT_URL, THREADS_AGENT_ID } from "@/lib/agents";

/**
 * The only Intelligence-mode runtime here, and the only one registering a
 * single agent. Those two facts are the same decision.
 *
 * The client starts a thread adapter for EVERY agent an Intelligence runtime
 * advertises — a list fetch, a subscribe, and a retrying WebSocket each — on
 * every page, whether or not it mounts a chat. The app-wide runtime advertises
 * 25, so Intelligence there produced ~25 sockets per page load and could
 * hang the machine. Here it advertises one.
 */
const LICENSE_TOKEN = process.env.COPILOTKIT_LICENSE_TOKEN;
const INTELLIGENCE_API_KEY = process.env.INTELLIGENCE_API_KEY;

const agents = {
  [THREADS_AGENT_ID]: new HttpAgent({
    url: `${AGENT_URL}/${THREADS_AGENT_ID}`,
  }),
};

/**
 * `CopilotRuntimeOptions` is a union, not one object with optional fields:
 * Intelligence mode requires both `intelligence` and `identifyUser`, and SSE
 * mode requires `intelligence` to be absent. So the two shapes are built in
 * separate branches rather than spread conditionally into one literal.
 *
 * Without a key this endpoint still answers — in SSE mode, with nothing to
 * list. The Rich Threads routes then show their empty/locked states, which is
 * the documented fallback.
 */
function buildRuntime(): CopilotRuntime {
  if (!INTELLIGENCE_API_KEY) {
    return new CopilotRuntime({
      agents,
      ...(LICENSE_TOKEN ? { licenseToken: LICENSE_TOKEN } : {}),
    });
  }

  return new CopilotRuntime({
    agents,
    ...(LICENSE_TOKEN ? { licenseToken: LICENSE_TOKEN } : {}),
    intelligence: new CopilotKitIntelligence({ apiKey: INTELLIGENCE_API_KEY }),
    // Off, because it cannot work through ClaudeAgentAdapter and costs three
    // Claude runs per new thread to discover that. ClaudeAgentAdapter reads
    // only `messages[-1]`, so the naming system message is discarded and the
    // model answers conversationally; normalizeGeneratedTitle rejects that and
    // the runtime falls back to "Untitled" after three runs.
    generateThreadNames: false,
    // Threads are per-user. Without this every visitor shares one history.
    identifyUser: (request) => ({
      id: request.headers.get("x-user-id") ?? "anonymous",
      name: request.headers.get("x-user-name") ?? "Anonymous",
    }),
  });
}

const handler = createCopilotRuntimeHandler({
  runtime: buildRuntime(),
  basePath: "/api/copilotkit-threads",
});

export { handler as GET, handler as POST, handler as PATCH, handler as DELETE };
