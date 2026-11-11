"use client";

import { CopilotChat } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import { GovernedActionApproval } from "../governed-action-approval";
import { GovernedActionTool } from "../governed-action-tool";

const AGENT_ID = "governed-actions";

/**
 * Both of the page's approval variants on one chat. One `useInterrupt` per
 * page, so this is the only interrupt render mounted here.
 *
 * - `GovernedActionTool` (useHumanInTheLoop) registers the frontend tool
 *   `approve_governed_action`, which the adapter hands to Claude. This half
 *   can run: Claude may call it with a made-up GovernedAction.
 * - `GovernedActionApproval` (useInterrupt) waits for an interrupt carrying
 *   `metadata.action`. The page publishes no backend, so nothing emits one.
 *
 * The agent is the Quickstart adapter with its default prompt; the page
 * prints no agent, policy engine or `executeSideEffect`.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/human-in-the-loop/governed-actions"
      subtitle={`agent: ${AGENT_ID} · useHumanInTheLoop + useInterrupt`}
    >
      <GovernedActionApproval />
      <GovernedActionTool />
      <CopilotChat agentId={AGENT_ID} className="h-full" />
    </DemoFrame>
  );
}
