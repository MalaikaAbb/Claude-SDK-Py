"use client";

import { CopilotChat } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import "../theme.css";

const AGENT_ID = "chat-customization-css";

/**
 * The CSS page's three levels of re-skinning, all live at once:
 * design tokens on `[data-copilotkit]`, `.copilotKit*` class hooks, and the
 * `labels` / `icons` props.
 *
 * `theme.css` holds the doc's stylesheet; see its header for the one change
 * made to it (scoping the two global blocks under `.chat-css-demo-scope`, so
 * the theme does not leak into the other twenty-five routes).
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/custom-look-and-feel/css"
      subtitle={`agent: ${AGENT_ID}`}
    >
      <div className="chat-css-demo-scope h-full overflow-hidden">
        <CopilotChat
          agentId={AGENT_ID}
          className="h-full"
          labels={{
            welcomeMessageText: "Hello! How can I help you today?",
            modalHeaderTitle: "My Copilot",
            chatInputPlaceholder: "Ask me anything!",
          }}
        />
      </div>
    </DemoFrame>
  );
}
