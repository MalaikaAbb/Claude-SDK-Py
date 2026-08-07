import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/shared-state/agent-readonly" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A one-way UI → agent channel. Where{" "}
          <Link
            href="/shared-state"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            shared state
          </Link>{" "}
          is a workspace both sides edit, <code>useAgentContext</code> publishes
          values that are pure inputs: the agent sees them on every turn and has
          no setter and no tool to write them back. Props for the agent, in the
          page&apos;s phrase. Entries refresh when the value changes and
          unregister on unmount.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "What's my name and what timezone am I in?",
              "Change the name on the left, then ask again.",
              "Summarise my recent activity and suggest what to do next.",
            ]}
            expect="The agent answers from the current values without being told them. Editing a field and re-asking gets the new value — the entry refreshed."
            fail="The agent says it does not know who you are, which means the context entries are not reaching the prompt."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/shared-state/agent-readonly/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The controls"
        description="Imported by the page from a ./demo-layout it never publishes. Written here from the two seeds it uses and the three context descriptions."
      >
        <SourceCode file="frontend/src/app/shared-state/agent-readonly/demo-layout.tsx" />
      </Panel>

      <Panel title="The backend half">
        <Callout tone="success">
          <p className="leading-relaxed">
            No backend code is needed here, and the page&apos;s snippet shows
            exactly why. It is a loop that walks{" "}
            <code>input_data.context</code>, formats each entry as{" "}
            <code>&#123;description&#125;: &#123;value&#125;</code>, and appends
            the block to the system prompt.{" "}
            <code>build_state_context_addendum</code> in{" "}
            <code>ag_ui_claude_sdk/utils.py</code> already does that — same
            walk, under a <em>## Context from the application</em> heading. The
            agent behind this route is the Quickstart&apos;s, unmodified.
          </p>
        </Callout>
        <div className="mt-4">
          <SourceCode file="backend/src/agents/doc_reference/agent_readonly.py" />
        </div>
      </Panel>

      <Panel title="Notes">
        <ul className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            The published <code>agent.py</code> block is a fragment lifted out
            of a larger run function — it opens mid-body at{" "}
            <code>context_entries = ...</code> and rebinds a{" "}
            <code>system</code> variable defined somewhere above it. The
            enclosing function is not published.
          </li>
          <li>
            The page attributes context injection to a{" "}
            <code>CopilotKitMiddleware</code> that &quot;threads the entries
            into the model&apos;s message history on every turn&quot;. No such
            class exists in this integration, and the entries go into the{" "}
            <em>system prompt</em>, not the message history.
          </li>
          <li>
            The <code>description</code> really does matter — it is the only
            label the model gets. Treat it like a parameter docstring, which is
            the page&apos;s advice and is correct.
          </li>
        </ul>
      </Panel>

      <Panel title="The agent">
        <SourceCodeGroup
          files={[{ file: "backend/src/agents/chat_agents.py", region: "build-adapter" }]}
        />
      </Panel>
    </>
  );
}
