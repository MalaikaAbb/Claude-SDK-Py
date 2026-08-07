"use client";

import {
  CopilotChat,
  CopilotChatReasoningMessage,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import { ReasoningBlock } from "../reasoning-block";

const AGENT_ID = "reasoning-custom";

/**
 * The page's `reasoning-custom` cell: the whole reasoning card replaced.
 *
 * This is the third of the slot's three override styles. Reasoning Messages
 * swaps individual sub-slots and keeps CopilotKit's card; this hands the slot a
 * component and keeps nothing — no collapse, no "Thought for X seconds", just
 * the banner, always open.
 *
 * The `as unknown as typeof CopilotChatReasoningMessage` cast is the doc's.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/generative-ui/reasoning" subtitle={`agent: ${AGENT_ID}`}>
      <Chat />
    </DemoFrame>
  );
}

function Chat() {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "Plan a migration",
        message:
          "We have 40 services on Postgres 12. Reason through the order to upgrade them in.",
      },
      {
        title: "A logic puzzle",
        message:
          "Three boxes are labelled apples, oranges, and mixed. Every label is wrong. How many fruit must you draw to fix all three?",
      },
    ],
    available: "always",
  });

  return (
    <CopilotChat
      agentId={AGENT_ID}
      className="h-full"
      messageView={{
        reasoningMessage:
          ReasoningBlock as unknown as typeof CopilotChatReasoningMessage,
      }}
    />
  );
}
