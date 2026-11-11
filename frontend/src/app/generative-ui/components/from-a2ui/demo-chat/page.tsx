"use client";

import { CopilotChat } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import { ComponentsProvider } from "../../_components/provider";
import { appUI } from "./app-ui";

const AGENT_ID = "gen-ui-from-a2ui";

/**
 * The "After" provider: `generativeUI={{ ui: appUI }}` and a plain chat, on
 * the same Components runtime as the other routes in this section. That
 * runtime has no `a2ui` option, which is what "Runtime, after" asks for.
 *
 * The page publishes no backend. The agent is this repo's Claude adapter on
 * the section's shared generative-UI prompt, like every other Components
 * route; `render_ui` comes from the runtime, not from the agent.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/generative-ui/components/from-a2ui" subtitle={`agent: ${AGENT_ID}`}>
      <ComponentsProvider generativeUI={{ ui: appUI }}>
        <CopilotChat agentId={AGENT_ID} className="h-full" />
      </ComponentsProvider>
    </DemoFrame>
  );
}
