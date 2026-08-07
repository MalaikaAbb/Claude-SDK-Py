"use client";

import { CopilotChat, CopilotKit } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";
import { nestedInspectorSetting } from "@/lib/inspector";

import { myCatalog } from "../a2ui/catalog";

const AGENT_ID = "declarative-gen-ui";

/**
 * A single prop — `a2ui={{ catalog }}` — is the entire frontend setup.
 *
 * The provider registers the catalog, wires the built-in A2UI activity-message
 * renderer, and auto-injects the `generate_a2ui` tool. That last part is why
 * this route needs its own runtime: /api/copilotkit turns injection *off* for
 * the fixed-schema agent, and here it has to stay on.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/generative-ui/a2ui/dynamic-schema"
      subtitle={`agent: ${AGENT_ID}`}
    >
      <CopilotKit
        runtimeUrl="/api/copilotkit-declarative-gen-ui"
        agent={AGENT_ID}
        a2ui={{ catalog: myCatalog }}
        // Owns the inspector on this route — see the fixed-schema demo and
        // `lib/inspector.ts`.
        enableInspector={nestedInspectorSetting}
      >
        <CopilotChat agentId={AGENT_ID} className="h-full" />
      </CopilotKit>
    </DemoFrame>
  );
}
