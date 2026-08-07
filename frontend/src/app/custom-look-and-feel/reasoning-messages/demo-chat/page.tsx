"use client";

import { CopilotChat, useConfigureSuggestions } from "@copilotkit/react-core/v2";
import type { ButtonHTMLAttributes, HTMLAttributes } from "react";

import { DemoFrame } from "@/components/demo-frame";

const AGENT_ID = "reasoning-default";

/**
 * The page's two sub-slot overrides, on top of the built-in reasoning card.
 *
 * `messageView.reasoningMessage` accepts either a whole component (that is the
 * Generative UI · Reasoning route) or an object of sub-slots. This is the
 * second form: `header` and `contentView` are replaced, and the card's
 * collapse behaviour and lifecycle stay CopilotKit's.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/custom-look-and-feel/reasoning-messages"
      subtitle={`agent: ${AGENT_ID}`}
    >
      <Chat />
    </DemoFrame>
  );
}

function CustomHeader({
  isOpen,
  label,
  hasContent,
  isStreaming,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  isOpen?: boolean;
  label?: string;
  hasContent?: boolean;
  isStreaming?: boolean;
}) {
  return (
    <button
      className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium"
      {...props}
    >
      {isStreaming ? "🧠" : "💡"}
      <span>{label}</span>
      {hasContent && (
        <span className="ml-auto text-xs">{isOpen ? "Hide" : "Show"}</span>
      )}
    </button>
  );
}

function CustomContent({
  isStreaming,
  hasContent,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  isStreaming?: boolean;
  hasContent?: boolean;
}) {
  if (!hasContent && !isStreaming) return null;

  return (
    <div className="px-4 pb-3 font-mono text-sm text-gray-500" {...props}>
      {children}
      {isStreaming && <span className="ml-1 animate-pulse">▊</span>}
    </div>
  );
}

function Chat() {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "A multi-step problem",
        message:
          "A train leaves at 2:15pm going 60mph. Another leaves the same station at 3:00pm going 75mph. When does the second catch the first?",
      },
      {
        title: "Weigh a trade-off",
        message:
          "Should a small team pick Postgres or SQLite for a new internal tool? Reason it through before answering.",
      },
    ],
    available: "always",
  });

  return (
    <CopilotChat
      agentId={AGENT_ID}
      className="h-full"
      messageView={{
        reasoningMessage: { header: CustomHeader, contentView: CustomContent },
      }}
    />
  );
}
