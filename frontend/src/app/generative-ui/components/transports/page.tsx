import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/components/transports" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The agent can send UI two ways. The default <em>tool</em> transport
          gives it a <code>render_ui</code> tool, and the runtime validates
          each operation before streaming it. The <em>markdown</em> transport
          has it write fenced blocks in its reply instead (see{" "}
          <Link
            href="/generative-ui/components/markdown-mode"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Markdown mode
          </Link>
          ). Either way, <code>agentIds</code> on the provider limits which
          agents get the UI at all.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Compare the Starter, Team, and Enterprise plans in a table"]}
            expect="Send it in both columns. Left (in agentIds): a rendered table. Right (not in agentIds): a plain-text or markdown answer, because that agent never received the catalog or the render_ui tool."
            fail="Both columns render UI: agentIds is not scoping. Neither does: the tool transport is not reaching the agent at all — check the same prompt on the parent Components and surfaces page."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/generative-ui/components/transports/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The runtime"
        description="generativeUI: true is the page's runtime option — the middleware runs on every run of every agent here."
      >
        <SourceCode file="frontend/src/app/api/copilotkit-components/[[...slug]]/route.ts" />
      </Panel>

      <Panel title="Notes">
        <ul className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            The page&apos;s <code>agentIds</code> example uses{" "}
            <code>&quot;shop&quot;</code>. The demo uses its own agent id, plus
            a second, identical agent left out of the list so the difference
            is visible side by side.
          </li>
          <li>
            The runtime option has four forms — left out, <code>true</code>,{" "}
            <code>{"{ agents: [...] }"}</code>, <code>false</code>. Only{" "}
            <code>true</code> is wired; the installed types describe the same
            four.
          </li>
          <li>
            The page says the agent must use the run&apos;s tools and context.
            On this integration both arrive through{" "}
            <code>ClaudeAgentAdapter</code>&apos;s own frontend-tool and context
            handling — no backend code is involved.
          </li>
        </ul>
      </Panel>
    </>
  );
}
