"use client";

import { CopilotChat, useConfigureSuggestions } from "@copilotkit/react-core/v2";
import { standardUI } from "@copilotkit/react-core/v2/generative-ui";

import { DemoFrame } from "@/components/demo-frame";

import { ComponentsProvider } from "../_components/provider";

const AGENT_ID = "gen-ui-components";

/**
 * The page's whole frontend: `generativeUI={{ ui: standardUI }}` on the
 * provider and an unmodified `<CopilotChat />`.
 *
 * With the catalog on the provider, every run carries the 69 standard
 * components; the runtime turns that into a `render_ui` tool plus a guide, and
 * whatever the agent renders lands in the chat as a surface. Nothing here
 * registers a tool or a renderer.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/generative-ui/components" subtitle={`agent: ${AGENT_ID}`}>
      <ComponentsProvider generativeUI={{ ui: standardUI }}>
        <Chat />
      </ComponentsProvider>
    </DemoFrame>
  );
}

function Chat() {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "Compare plans",
        message: "Compare the Starter, Team, and Enterprise plans in a table",
      },
      {
        title: "Chart something",
        message: "Show a bar chart of monthly signups: Jan 40, Feb 55, Mar 72, Apr 90.",
      },
    ],
    available: "always",
  });

  return <CopilotChat agentId={AGENT_ID} className="h-full" />;
}
