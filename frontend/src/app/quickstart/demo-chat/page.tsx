"use client";

import { CopilotSidebar } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

/**
 * The Quickstart's `app/page.tsx`, which is a `<main>` and a `<CopilotSidebar />`.
 *
 * The doc names the agent once, on the provider (`agent="claude_agent"`). This
 * app has a single root provider shared by every route, so the agent is named
 * per surface with `agentId` instead — same binding, chosen at the component
 * rather than the tree.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/quickstart" subtitle="agent: claude_agent">
      <main className="h-full overflow-y-auto p-10">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Your App
        </h1>
        <p className="mt-3 max-w-prose text-sm text-slate-600 dark:text-slate-400">
          The sidebar on the right is talking to a{" "}
          <code>ClaudeAgentAdapter</code> running in the Python server on port
          8000. Ask it anything.
        </p>
        <CopilotSidebar agentId="claude_agent" defaultOpen />
      </main>
    </DemoFrame>
  );
}
