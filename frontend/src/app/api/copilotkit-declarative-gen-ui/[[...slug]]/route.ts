import { HttpAgent } from "@ag-ui/client";
import {
  CopilotRuntime,
  InMemoryAgentRunner,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";

import { AGENT_URL, A2UI_DYNAMIC_AGENT_ID } from "@/lib/agents";

/**
 * A second runtime for the A2UI dynamic-schema route, matching the doc's
 * `runtimeUrl="/api/copilotkit-declarative-gen-ui"`.
 *
 * Note the absence of an `a2ui` block. That is the whole point of the page:
 * passing a catalog to the provider auto-enables A2UI and injects the
 * `generate_a2ui` tool, so the runtime needs no configuration at all. It has
 * to be a separate endpoint from /api/copilotkit because that one turns
 * injection off for the fixed-schema agent.
 *
 * The `[[...slug]]` segment is load-bearing, for the same reason it is on
 * /api/copilotkit — and skipping it here did not merely lose thread REST, it
 * broke chat outright. Transport detection in `@copilotkit/core` probes
 * `GET {runtimeUrl}/info` first and falls back to a single-route `POST
 * {runtimeUrl}` carrying an `{method:"info"}` envelope. Without a catch-all
 * that GET 404s, so the client resolved this endpoint to `transport: "single"`
 * — and on that path every runtime fetch goes through
 * `createSingleRouteResourceRequest`, which opens with a bare
 * `new URL(runtimeUrl)`. A relative `runtimeUrl` has no origin to parse, so it
 * threw `TypeError: Invalid URL` before the run request was ever sent. The
 * catch-all makes `/info` resolve, transport lands on `"rest"`, and that code
 * path is never entered. See the Known issues section of the README.
 */
const agents = {
  [A2UI_DYNAMIC_AGENT_ID]: new HttpAgent({
    url: `${AGENT_URL}/${A2UI_DYNAMIC_AGENT_ID}`,
  }),
};

const LICENSE_TOKEN = process.env.COPILOTKIT_LICENSE_TOKEN;

const runtime = new CopilotRuntime({
  agents,
  runner: new InMemoryAgentRunner(),
  ...(LICENSE_TOKEN ? { licenseToken: LICENSE_TOKEN } : {}),
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit-declarative-gen-ui",
});

export { handler as GET, handler as POST, handler as PATCH, handler as DELETE };
