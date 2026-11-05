import { HttpAgent } from "@ag-ui/client";
import {
  CopilotRuntime,
  InMemoryAgentRunner,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";

import { AGENT_URL, HASHBROWN_AGENT_ID } from "@/lib/agents";

/**
 * The runtime for the Hashbrown route, at the `runtimeUrl` its page.tsx
 * publishes (`/api/copilotkit-declarative-hashbrown`), with the one agent that page addresses.
 *
 * Nothing generative-UI specific happens here: the agent writes JSON as plain
 * assistant text, and the chat's assistant-message slot renders it. So the
 * runtime needs no `a2ui` or `generativeUI` option. The `[[...slug]]`
 * catch-all is load-bearing — see the declarative-gen-ui route and README §9.19.
 */
const agents = {
  [HASHBROWN_AGENT_ID]: new HttpAgent({ url: `${AGENT_URL}/${HASHBROWN_AGENT_ID}` }),
};

const LICENSE_TOKEN = process.env.COPILOTKIT_LICENSE_TOKEN;

const runtime = new CopilotRuntime({
  agents,
  runner: new InMemoryAgentRunner(),
  ...(LICENSE_TOKEN ? { licenseToken: LICENSE_TOKEN } : {}),
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit-declarative-hashbrown",
});

export { handler as GET, handler as POST, handler as PATCH, handler as DELETE };
