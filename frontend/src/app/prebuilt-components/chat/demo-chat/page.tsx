"use client";

import { CopilotChat, useConfigureSuggestions } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

/**
 * The doc's `agentic-chat` demo: a `<CopilotChat>` filling its container, with
 * starter suggestions wired in.
 *
 * The page's first snippet calls a `useAgenticChatSuggestions()` helper it
 * never defines; its second shows the same thing as a direct
 * `useConfigureSuggestions` call. That is the real export, so it is used here.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/prebuilt-components/chat" subtitle="agent: agentic_chat">
      <Chat />
    </DemoFrame>
  );
}

function Chat() {
  useConfigureSuggestions({
    suggestions: [
      { title: "Write a sonnet", message: "Write a short sonnet about AI." },
      {
        title: "What can you do?",
        message: "What can you help me with?",
      },
    ],
    available: "always",
  });

  return <CopilotChat agentId="agentic_chat" className="h-full" />;
}
