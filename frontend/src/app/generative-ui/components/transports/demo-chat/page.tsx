"use client";

import { CopilotChat, useConfigureSuggestions } from "@copilotkit/react-core/v2";
import { standardUI } from "@copilotkit/react-core/v2/generative-ui";

import { DemoFrame } from "@/components/demo-frame";

import { ComponentsProvider } from "../../_components/provider";

const AGENT_ID = "gen-ui-transports";
const PLAIN_AGENT_ID = "gen-ui-transports-plain";

/**
 * The tool transport (the default — no `transport` key), scoped with the
 * page's `agentIds` option. The page's sample id is `"shop"`; here it is the
 * left-hand agent's id.
 *
 * Both chats share one provider and one runtime, and both backend agents are
 * identical. The only difference is that the right-hand agent is not in
 * `agentIds`, so its runs carry no envelope: no catalog, no `render_ui`. Send
 * the same prompt to both and only the left one should draw UI.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/generative-ui/components/transports" subtitle={`agents: ${AGENT_ID} · ${PLAIN_AGENT_ID}`}>
      <ComponentsProvider generativeUI={{ ui: standardUI, agentIds: [AGENT_ID] }}>
        <Suggestions />
        <div className="grid h-full grid-cols-1 md:grid-cols-2">
          <Column title={`${AGENT_ID} — in agentIds`} agentId={AGENT_ID} />
          <Column title={`${PLAIN_AGENT_ID} — not in agentIds`} agentId={PLAIN_AGENT_ID} />
        </div>
      </ComponentsProvider>
    </DemoFrame>
  );
}

function Suggestions() {
  useConfigureSuggestions({
    suggestions: [
      { title: "Compare plans", message: "Compare the Starter, Team, and Enterprise plans in a table" },
      { title: "Chart", message: "Show a pie chart of browser market share, made-up numbers." },
    ],
    available: "always",
  });
  return null;
}

function Column({ title, agentId }: { title: string; agentId: string }) {
  return (
    <div className="flex min-h-0 flex-col border-slate-200 md:border-r dark:border-slate-800">
      <p className="shrink-0 border-b border-slate-200 px-3 py-1.5 font-mono text-[11px] text-slate-500 dark:border-slate-800">
        {title}
      </p>
      <div className="min-h-0 flex-1">
        <CopilotChat agentId={agentId} className="h-full" />
      </div>
    </div>
  );
}
