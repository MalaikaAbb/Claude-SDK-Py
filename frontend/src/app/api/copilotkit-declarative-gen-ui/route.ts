import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { HttpAgent } from "@ag-ui/client";
import { NextRequest } from "next/server";

import { AGENT_URL } from "@/lib/agents";

// A second runtime for the A2UI dynamic-schema route, matching the doc's
// `runtimeUrl="/api/copilotkit-declarative-gen-ui"`.
//
// Note the absence of an `a2ui` block. That is the whole point of the page:
// passing a catalog to the provider auto-enables A2UI and injects the
// `generate_a2ui` tool, so the runtime needs no configuration at all. It has
// to be a separate endpoint from /api/copilotkit because that one turns
// injection off for the fixed-schema agent.
const serviceAdapter = new ExperimentalEmptyAdapter();

const runtime = new CopilotRuntime({
  agents: {
    "declarative-gen-ui": new HttpAgent({
      url: `${AGENT_URL}/declarative-gen-ui`,
    }),
  },
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit-declarative-gen-ui",
  });

  return handleRequest(req);
};
