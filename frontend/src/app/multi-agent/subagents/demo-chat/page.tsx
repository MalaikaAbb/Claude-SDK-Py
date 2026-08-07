"use client";

import {
  CopilotChat,
  UseAgentUpdate,
  useAgent,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import { DelegationLog, type Delegation } from "../delegation-log";

const AGENT_ID = "subagents";

/**
 * The frontend is the page's, and it is correct. The log will stay empty.
 *
 * `research_agent`, `writing_agent` and `critique_agent` are backend tools, and
 * the docs publish no way to register a backend tool against
 * ClaudeAgentAdapter. The supervisor's prompt tells it those three tools exist;
 * with none registered it explains its plan and stops.
 *
 * The `delegations` slot the log reads is also written by the run loop the page
 * calls the "subagents-delegation-flow region" — which is never published
 * either. See the notes page.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/multi-agent/subagents" subtitle={`agent: ${AGENT_ID}`}>
      <Demo />
    </DemoFrame>
  );
}

function Demo() {
  const { agent } = useAgent({
    agentId: AGENT_ID,
    updates: [UseAgentUpdate.OnStateChanged, UseAgentUpdate.OnRunStatusChanged],
  });

  useConfigureSuggestions({
    suggestions: [
      {
        title: "Research, write, critique",
        message:
          "Write a short brief on why remote teams struggle with onboarding.",
      },
    ],
    available: "always",
  });

  const state = (agent.state ?? {}) as { delegations?: Delegation[] };

  return (
    <div className="grid h-full grid-cols-1 gap-4 p-4 lg:grid-cols-[1fr_420px]">
      <DelegationLog
        delegations={state.delegations ?? []}
        isRunning={agent.isRunning}
      />
      <div className="min-h-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
        <CopilotChat agentId={AGENT_ID} className="h-full" />
      </div>
    </div>
  );
}
