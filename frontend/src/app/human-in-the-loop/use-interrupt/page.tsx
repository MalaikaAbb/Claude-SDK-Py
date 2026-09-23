"use client";

import { CopilotChat } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import { GovernedActionApproval } from "../governed-action-approval";

const AGENT_ID = "hitl-in-chat";

/**
 * The Governed Action Approval page's `useInterrupt` pattern, mounted next to
 * a chat. The hook and card live in `../governed-action-approval.tsx`,
 * verbatim from the doc.
 *
 *   https://docs.copilotkit.ai/claude-sdk-python/human-in-the-loop/governed-actions
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/human-in-the-loop"
      subtitle={`useInterrupt · agent: ${AGENT_ID}`}
    >
      <GovernedActionApproval />
      <CopilotChat agentId={AGENT_ID} className="h-full" />
    </DemoFrame>
  );
}
