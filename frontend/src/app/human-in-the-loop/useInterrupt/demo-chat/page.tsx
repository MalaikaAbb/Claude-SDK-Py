"use client";

import { CopilotChat } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import { ApprovalInterrupt } from "../approval-interrupt";

const AGENT_ID = "gen-ui-interrupt";

/**
 * What the page publishes, put together: the `interrupt_agent` prompt (on the
 * `gen-ui-interrupt` adapter) and the generic `ApprovalInterrupt` render.
 *
 * The page's frontend for this framework, a `useFrontendTool` named
 * `schedule_meeting` with a Promise-resolving handler and an inline picker, is
 * not printed (its snippet region is missing). It is not filled in, so the
 * prompt points at a tool that does not exist, and this adapter registers no
 * deferred tools, so it never emits an interrupt for `ApprovalInterrupt`.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/human-in-the-loop/useInterrupt"
      subtitle={`agent: ${AGENT_ID} · schedule_meeting not published`}
    >
      <ApprovalInterrupt />
      <CopilotChat agentId={AGENT_ID} className="h-full" />
    </DemoFrame>
  );
}
