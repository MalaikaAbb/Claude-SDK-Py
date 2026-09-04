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
            { file: "frontend/src/app/api/copilotkit/[[...slug]]/route.ts" },
          ]}
        />
      </Panel>

      <Panel
        title="What changed when the doc moved to the v2 runtime"
        description="The runtime route above is the piece that was rewritten. These are the four differences worth knowing before you diff it."
      >
        <ul className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            <strong>The import moved.</strong>{" "}
            <code>@copilotkit/runtime/v2</code>, not{" "}
            <code>@copilotkit/runtime</code>. There is no{" "}
            <code>serviceAdapter</code> on this surface at all —{" "}
            <code>ExperimentalEmptyAdapter</code> belonged to the v1 GraphQL
            runtime and has no counterpart, so the older sample no longer
            compiles against it.
          </li>
          <li>
            <strong>The handler shape changed.</strong>{" "}
            <code>createCopilotRuntimeHandler</code> returns a plain fetch
            handler rather than a <code>&#123; handleRequest &#125;</code>{" "}
            wrapper, so the route is just its verb exports.
          </li>
          <li>
            <strong>The model default changed</strong> — the page now names{" "}
            <code>claude-opus-4-8</code> where it used to name{" "}
            <code>claude-sonnet-4-6</code>. That value is{" "}
            <code>DEFAULT_ANTHROPIC_MODEL</code> in{" "}
            <code>chat_agents.py</code> above, and it applies to all 27 agents.
          </li>
          <li>
            <strong>The Quickstart added an Inspector step</strong> whose third
            check is whether the Threads tab is unlocked. That is the same
            Intelligence switch the Rich Threads routes depend on, which is why
            this repo now configures it — see below.
          </li>
        </ul>
      </Panel>

      <Panel
        title="Intelligence, and the one place this repo departs from the page"
        description="The runtime route in full. Everything the three Rich Threads routes need is configured here."
      >
        <Callout tone="warn" title="single-route serves chat and nothing else">
          <p className="leading-relaxed">
            The Quickstart keeps the file at <code>route.ts</code> and passes{" "}
            <code>mode: &quot;single-route&quot;</code>, which serves one POST
            carrying a <code>&#123; method, params, body &#125;</code> envelope.
            That is enough for a chat and nothing more.
          </p>
          <p className="mt-2 leading-relaxed">
            Rich Threads are REST: listing, renaming, archiving and deleting a
            thread are separate verbs on separate paths, and{" "}
            <code>/info</code> is what tells the client whether Intelligence is
            on at all. Those live in <code>mode: &quot;multi-route&quot;</code>,
            the default — which is why this file sits at{" "}
            <code>[[...slug]]/route.ts</code>. A single-segment route would 404
            everything except the bare URL, while <code>/info</code> kept
            returning 200, so the app would look connected and every thread call
            would fail.
          </p>
          <p className="mt-2 leading-relaxed">
            Three routes in this harness break under the Quickstart&apos;s
            literal config, so the deviation is deliberate rather than drift.
          </p>
        </Callout>
        <div className="mt-4">
          <SourceCode file="frontend/src/app/api/copilotkit/[[...slug]]/route.ts" />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Note the two credentials.{" "}
          <code>INTELLIGENCE_API_KEY</code> is what makes threads{" "}
          <em>work</em>; <code>COPILOTKIT_LICENSE_TOKEN</code> is what{" "}
          <code>/info</code> reports a licence status from, and what the
          prebuilt drawer reads before deciding whether to render its locked
          view. A runtime can serve threads perfectly while every drawer in the
          app shows an upgrade panel. Neither is required for chat: with no key
          the runtime falls back to SSE with an in-memory runner and all 27
          agents keep working.
        </p>
        <div className="mt-4">
          <SourceCode file="frontend/src/components/providers.tsx" />
        </div>
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
            things the docs never define. Four routes in this harness are Broken
            because of it, and two more run only through a repo-authored bridge
            that stands in for it.
          </p>
        </Callout>
        <div className="mt-4">
          <SourceCode file="backend/src/agents/doc_reference/claude_agent_sdk_adapter.py" />
        </div>
      </Panel> */}
    </>
  );
}
