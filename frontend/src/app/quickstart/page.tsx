import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/quickstart" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The bring-your-own-agent path, end to end. A{" "}
          <code>ClaudeAgentAdapter</code> from <code>ag_ui_claude_sdk</code> is
          exposed over AG-UI by a FastAPI endpoint; the Next runtime reaches it
          with an <code>HttpAgent</code>. Two processes, two ports — and a third
          hop the other Python integrations do not have, because the Claude
          Agent SDK drives the Claude CLI as a subprocess rather than calling
          the API in-process.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Tell me in one sentence what this app can do.",
              "Can you tell me a joke?",
            ]}
            expect="Tokens stream in a word at a time and the reply renders as markdown."
            fail="An error banner. Check that the Python server is up on :8000 and that ANTHROPIC_API_KEY is set in backend/.env."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/quickstart/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The three files that make it work"
        description="Read from this repo, so they can be diffed against the doc's samples directly."
      >
        <SourceCodeGroup
          files={[
            { file: "backend/src/agents/chat_agents.py", region: "build-adapter" },
            { file: "backend/src/agent_server.py", region: "mount" },
            { file: "frontend/src/app/api/copilotkit/route.ts" },
          ]}
        />
      </Panel>

      {/* <Panel title="Where this repo deviates from the page">
        <ul className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            <strong>One adapter per route, not one per app.</strong> The page
            mounts a single adapter at <code>/</code>. This harness needs a
            separate conversation per doc page, so it mounts twenty-five at{" "}
            <code>/&#123;agent_id&#125;</code>. The endpoint body is the
            page&apos;s, unchanged — including its <code>RunErrorEvent</code>{" "}
            path.
          </li>
          <li>
            <strong>The agent is named per surface.</strong> The doc names it
            once on the provider (<code>agent=&quot;claude_agent&quot;</code>).
            One root provider is shared by every route here, so each surface
            passes <code>agentId</code> instead — same binding, chosen at the
            component rather than the tree.
          </li>
        </ul>
      </Panel>

      <Panel title="The bridge the page shows but never finishes">
        <Callout tone="warn">
          <p className="leading-relaxed">
            The page&apos;s closing section, <em>Backend tools and state</em>,
            is what every tool-driven page in this integration depends on. It
            publishes one function, and that function opens by calling six
            things the docs never define. Five routes in this harness are Broken
            because of it.
          </p>
        </Callout>
        <div className="mt-4">
          <SourceCode file="backend/src/agents/doc_reference/claude_agent_sdk_adapter.py" />
        </div>
      </Panel> */}
    </>
  );
}
