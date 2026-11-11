// Byte-exact copy of a snippet on https://docs.copilotkit.ai/claude-sdk-python/generative-ui/a2ui
// ("Enable on the runtime without a catalog", title app/api/copilotkit/[[...slug]]/route.ts). Type-checked, never served or rendered: `_doc` is a private folder and
// nothing imports it. Undefined names on the page are suppressed, not filled in.
import { CopilotRuntime, InMemoryAgentRunner } from "@copilotkit/runtime/v2";

const runtime = new CopilotRuntime({
  // @ts-expect-error verbatim doc code: `myAgent` is never defined on the page (TS2304)
  agents: { default: myAgent },
  a2ui: { injectA2UITool: true },
  runner: new InMemoryAgentRunner(),
});
