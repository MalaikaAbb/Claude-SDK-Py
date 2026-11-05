import { HttpAgent } from "@ag-ui/client";
import {
  CopilotRuntime,
  InMemoryAgentRunner,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";

import { AGENT_URL, COMPONENTS_AGENT_IDS } from "@/lib/agents";

/**
 * The runtime behind the eight Components and surfaces routes.
 *
 * The doc's route builds a `BuiltInAgent` over TanStack AI and OpenAI. That is
 * the page's framework-neutral sample, not this integration's backend, so here
 * the same runtime fronts the Python agents over AG-UI instead — every other
 * line of the page's config is kept.
 *
 * `generativeUI: true` is the Transports page's runtime option: the
 * generative-UI middleware runs on every run. On a tool-transport run it adds
 * the `render_ui` tool plus its guide and validates each operation before it
 * streams to the client; on a markdown run it only passes the envelope
 * through. Leaving the key out would behave the same way for these agents —
 * it is spelled out because the Transports page is about it.
 *
 * A separate endpoint from /api/copilotkit for the same reason the two A2UI
 * routes have one: that runtime carries the fixed-schema `a2ui` middleware,
 * and these pages are about a different, newer layer. The `[[...slug]]`
 * catch-all is load-bearing — see the declarative-gen-ui route.
 */
const agents = Object.fromEntries(
  COMPONENTS_AGENT_IDS.map((id) => [id, new HttpAgent({ url: `${AGENT_URL}/${id}` })]),
);

const LICENSE_TOKEN = process.env.COPILOTKIT_LICENSE_TOKEN;

const runtime = new CopilotRuntime({
  agents,
  generativeUI: true,
  runner: new InMemoryAgentRunner(),
  ...(LICENSE_TOKEN ? { licenseToken: LICENSE_TOKEN } : {}),
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit-components",
});

export { handler as GET, handler as POST, handler as PATCH, handler as DELETE };
