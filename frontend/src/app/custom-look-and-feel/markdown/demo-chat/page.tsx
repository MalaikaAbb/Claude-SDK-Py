"use client";

import { CopilotChat } from "@copilotkit/react-core/v2";
import { useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

// Harness-only: defines `my-link` / `my-heading`, which the doc never does.
import "../markdown.css";

const AGENT_ID = "chat-slots";

type Mode = "default" | "components" | "class-string" | "replace";

// #region replace — verbatim from "Replace the renderer"
const PlainText = ({ content }: { content: string }) => (
  <pre className="whitespace-pre-wrap">{content}</pre>
);
// #endregion

/**
 * The three markdownRenderer forms from the doc, one per mode, plus the
 * untouched default for comparison. Each chat is keyed by mode so switching
 * gives a fresh mount rather than restyling a half-streamed message.
 */
export default function Page() {
  const [mode, setMode] = useState<Mode>("default");

  return (
    <DemoFrame
      parentPath="/custom-look-and-feel/markdown"
      subtitle={`agent: ${AGENT_ID}`}
    >
      <div className="flex h-full flex-col">
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-2 dark:border-slate-800">
          {(["default", "components", "class-string", "replace"] as const).map(
            (m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-md px-3 py-1 text-xs font-medium ${
                  mode === m
                    ? "bg-[var(--accent)] text-white"
                    : "border border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"
                }`}
              >
                {m}
              </button>
            ),
          )}
        </div>

        <div className="chat-markdown-demo-scope min-h-0 flex-1">
          {mode === "default" && (
            <CopilotChat key="default" agentId={AGENT_ID} className="h-full" />
          )}

          {mode === "components" && (
            // #region components — verbatim from "Restyle individual HTML tags"
            <CopilotChat
              key="components"
              agentId={AGENT_ID}
              className="h-full"
              messageView={{
                assistantMessage: {
                  markdownRenderer: {
                    components: {
                      a: ({ node, children, ...props }) => (
                        <a {...props} className="my-link">
                          {children}
                        </a>
                      ),
                      h2: ({ node, children, ...props }) => (
                        <h2 {...props} className="my-heading">
                          {children}
                        </h2>
                      ),
                    },
                  },
                },
              }}
            />
            // #endregion
          )}

          {mode === "class-string" && (
            // #region class-string — verbatim from "Restyle the whole markdown block"
            <CopilotChat
              key="class-string"
              agentId={AGENT_ID}
              className="h-full"
              messageView={{
                assistantMessage: { markdownRenderer: "text-sm leading-7" },
              }}
            />
            // #endregion
          )}

          {mode === "replace" && (
            // #region replace-usage — verbatim from "Replace the renderer"
            <CopilotChat
              key="replace"
              agentId={AGENT_ID}
              className="h-full"
              messageView={{ assistantMessage: { markdownRenderer: PlainText } }}
            />
            // #endregion
          )}
        </div>
      </div>
    </DemoFrame>
  );
}
