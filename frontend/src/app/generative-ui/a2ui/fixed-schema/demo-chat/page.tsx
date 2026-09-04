"use client";

import { CopilotChat, CopilotKit } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";
import { nestedInspectorSetting } from "@/lib/inspector";

import { catalog } from "../a2ui/catalog";

const AGENT_ID = "a2ui-fixed-schema";

/**
 * Its own provider, because A2UI is configured per-provider: `a2ui={{ catalog }}`
 * is what registers the component vocabulary the surface will be drawn with.
 *
 * The matching half is on the runtime, which sets `injectA2UITool: false` for
 * this agent — in this pattern the agent owns `display_flight` and returns the
 * operations container itself, so it must not also be handed a `generate_a2ui`
 * tool.
 *
 * `display_flight` is a backend tool, and the docs publish no way to register
 * one against ClaudeAgentAdapter. This repo bridges that itself:
 * `backend/src/agents/flights_mcp_server.py` wraps the published tool in an
 * in-process MCP server whose result is the `a2ui_operations` container the
 * runtime's A2UI middleware detects. The catalog here and
 * `injectA2UITool: false` on the runtime are the page's own wiring. See the
 * notes page and README §9.1 / §9.4.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/generative-ui/a2ui/fixed-schema"
      subtitle={`agent: ${AGENT_ID}`}
    >
      <CopilotKit
        runtimeUrl="/api/copilotkit"
        agent={AGENT_ID}
        a2ui={{ catalog }}
        // This provider owns the inspector on this route, because the chat
        // below runs on *its* core — the app-wide one would show an empty
        // event list. The root provider stands down here; the routing lives in
        // `lib/inspector.ts`, which also guarantees only one ever mounts.
        enableInspector={nestedInspectorSetting}
      >
        <CopilotChat agentId={AGENT_ID} className="h-full" />
      </CopilotKit>
    </DemoFrame>
  );
}
