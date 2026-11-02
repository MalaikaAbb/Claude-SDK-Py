"use client";

import { CopilotKit } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";
import { nestedInspectorSetting } from "@/lib/inspector";

import { AGENT_ID, Chat } from "../chat";

/**
 * The demo's `page.tsx` from the showcase source the doc's Code tab loads
 * (the doc page itself does not print it), inside this repo's demo frame.
 * `runtimeUrl` and the agent id are as published; `h-screen` became `h-full`
 * so the chat fits under the frame's header bar.
 *
 * Everything that matters is in `chat.tsx`: the assistant-message slot is
 * replaced with `JsonRenderAssistantMessage`, which turns a `{ root, elements }`
 * JSON reply into components and falls back to a normal bubble otherwise.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/generative-ui/json-render" subtitle={`agent: ${AGENT_ID}`}>
      <CopilotKit
        runtimeUrl="/api/copilotkit-declarative-json-render"
        agent={AGENT_ID}
        // Owns the inspector on this route — see `lib/inspector.ts`.
        enableInspector={nestedInspectorSetting}
      >
        <div className="flex justify-center items-center h-full w-full">
          <div className="h-full w-full max-w-4xl">
            <Chat />
          </div>
        </div>
      </CopilotKit>
    </DemoFrame>
  );
}
