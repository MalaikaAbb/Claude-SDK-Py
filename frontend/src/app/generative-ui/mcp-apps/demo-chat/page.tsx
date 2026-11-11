"use client";

import { DemoFrame } from "@/components/demo-frame";

import MCPAppsDemo from "../mcp-apps-demo";

/**
 * The Code tab's demo page, unchanged, inside this repo's demo chrome. Its
 * own `<CopilotKit>` points at /api/copilotkit-mcp-apps.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/generative-ui/mcp-apps" subtitle="agent: mcp-apps · Excalidraw MCP server">
      <MCPAppsDemo />
    </DemoFrame>
  );
}
