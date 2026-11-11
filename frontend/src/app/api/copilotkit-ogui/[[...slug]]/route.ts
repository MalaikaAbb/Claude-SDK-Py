// From the Code tab of
// https://docs.copilotkit.ai/claude-sdk-python/generative-ui/open-generative-ui
// (src/app/api/copilotkit-ogui/route.ts). The `CopilotRuntime` block is
// verbatim, including its comments and `@ts-ignore`. Harness changes are
// marked `HARNESS:`.

import { HttpAgent, type AbstractAgent } from "@ag-ui/client";
import {
  CopilotRuntime,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";

import { AGENT_URL } from "@/lib/agents";

// Dedicated runtime for the Open Generative UI demos.
// Isolated here because the `openGenerativeUI` runtime flag sets
// `openGenerativeUIEnabled: true` globally on the probe response, which
// causes the CopilotKit provider's setTools effect to wipe per-demo
// `useFrontendTool`/`useComponent` registrations in the default runtime.

// HARNESS: the Code tab points both names at one agent at `${AGENT_URL}/`,
// built with `createClaudeHttpAgent` from the unpublished
// `@/app/api/_shared/claude-http-agent`. This repo mounts one adapter per id
// (each with its Code-tab prompt hint), reached with a plain `HttpAgent`.
const agentNames = ["open-gen-ui", "open-gen-ui-advanced"];
const agents: Record<string, AbstractAgent> = {};
for (const name of agentNames) {
  agents[name] = new HttpAgent({ url: `${AGENT_URL}/${name}` });
}

// HARNESS: the Code tab builds the handler inside a POST-only try/catch with
// `mode: "single-route"` and the unpublished `internalRuntimeErrorResponse`.
// With the page's relative `runtimeUrl`, single-route throws `Invalid URL` on
// the first message in this CopilotKit version (README §9.19), so this sits
// at `[[...slug]]` on the default multi-route mode, like every other runtime
// route here.
const copilotHandler = createCopilotRuntimeHandler({
  // Server-side config is identical for minimal and advanced cells —
  // the advanced behaviour (sandbox -> host function calls) is wired
  // entirely on the frontend via `openGenerativeUI.sandboxFunctions` on
  // the provider. The single `openGenerativeUI` flag below turns on
  // Open Generative UI for the listed agent(s); the runtime middleware
  // converts each agent's streamed `generateSandboxedUi` tool call into
  // `open-generative-ui` activity events.
  runtime: new CopilotRuntime({
    // @ts-ignore -- see main route.ts
    agents,
    openGenerativeUI: {
      agents: ["open-gen-ui", "open-gen-ui-advanced"],
    },
  }),
  basePath: "/api/copilotkit-ogui",
});

export {
  copilotHandler as GET,
  copilotHandler as POST,
  copilotHandler as PATCH,
  copilotHandler as DELETE,
};
