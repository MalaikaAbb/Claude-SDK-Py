"use client";

import {
  CopilotChat,
  CopilotChatAssistantMessage,
  CopilotChatInput,
  CopilotChatView,
} from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import {
  CustomAssistantMessage,
  CustomDisclaimer,
  CustomWelcomeScreen,
} from "../slot-overrides";

const AGENT_ID = "chat-slots";

/**
 * The page's three overrides on one `<CopilotChat>`.
 *
 * The locals and their casts are the page's `slot-overrides.snippet.tsx`
 * verbatim — including the `as unknown as typeof …` double casts, which are
 * how the page reconciles a plain component with each slot's declared type.
 * The component bodies live in `../slot-overrides.tsx`; the page declares them
 * and never writes them.
 */
export default function Page() {
  const welcomeScreen =
    CustomWelcomeScreen as unknown as typeof CopilotChatView.WelcomeScreen;

  const messageView = {
    assistantMessage:
      CustomAssistantMessage as unknown as typeof CopilotChatAssistantMessage,
  };

  const input = {
    disclaimer:
      CustomDisclaimer as unknown as typeof CopilotChatInput.Disclaimer,
  };

  return (
    <DemoFrame
      parentPath="/custom-look-and-feel/slots"
      subtitle={`agent: ${AGENT_ID}`}
    >
      <CopilotChat
        agentId={AGENT_ID}
        className="h-full"
        welcomeScreen={welcomeScreen}
        messageView={messageView}
        input={input}
      />
    </DemoFrame>
  );
}
