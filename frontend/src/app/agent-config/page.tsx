import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { CodeBlock, Callout, Panel, TryIt } from "@/components/ui";

const WHITELIST = `# ag_ui_claude_sdk/config.py — every forwarded_props key the adapter accepts.
# tone, expertise and responseLength are in none of these groups, so the
# adapter drops all three with a warning before the agent ever sees them.
ALLOWED_FORWARDED_PROPS = {
    # Session control
    "resume", "fork_session", "resume_session_at",
    # Model control
    "model", "fallback_model", "temperature", "max_tokens",
    "max_thinking_tokens", "max_turns", "max_budget_usd",
    # Output control
    "output_format", "include_partial_messages",
    # Optional features
    "enable_file_checkpointing", "strict_mcp_config", "betas",
}`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/agent-config" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Settings that are a channel rather than content. Tone, expertise
          level, response shape — things the user tunes occasionally in a
          settings panel, which the agent should read on every turn but never
          write to. The UI owns a typed object; the agent rebuilds its system
          prompt from it each turn.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The page&apos;s own dividing line is a good one: if the value is
          something the agent should write back to — notes, a document, a plan —
          you want{" "}
          <Link
            href="/shared-state"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            shared state
          </Link>{" "}
          instead.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Explain what a database index is.",
              "Switch to casual + beginner + detailed, then ask the same thing again.",
            ]}
            expect="Two visibly different answers to one question — the first clipped and neutral, the second longer, warmer, and assuming less."
            fail="Identical answers, meaning the config never reached the prompt."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/agent-config/demo-chat/page.tsx" />
      </Panel>

      <Panel title="Why this route is Partial">
        <Callout tone="warn" title="The page's two halves do not connect">
          <p className="leading-relaxed">
            There is no missing tool bridge here. The frontend and backend
            snippets simply use different channels.
          </p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 leading-relaxed">
            <li>
              The frontend half publishes{" "}
              <code>useAgentContext(&#123; description, value &#125;)</code>,
              which travels as <code>input_data.context</code>.
            </li>
            <li>
              The backend half is{" "}
              <code>read_properties(forwarded_props)</code>, which reads a
              different field the frontend never writes.
            </li>
            <li>
              And even if the frontend used <code>properties</code> on the
              provider, the adapter filters <code>forwarded_props</code> through
              a fixed whitelist. All three config keys are outside it.
            </li>
          </ul>
          <p className="mt-2 leading-relaxed">
            So the published backend cannot work either way. What makes this
            route function is the frontend half alone: the adapter folds{" "}
            <code>input_data.context</code> into the system prompt itself, the
            same mechanism behind{" "}
            <Link
              href="/shared-state/agent-readonly"
              className="text-[var(--accent)] underline underline-offset-4"
            >
              Agent Read-Only Context
            </Link>
            . The agent behind this route is the Quickstart&apos;s, unmodified.
          </p>
        </Callout>
        <div className="mt-4">
          <CodeBlock code={WHITELIST} language="python" filename="ag_ui_claude_sdk/config.py" />
        </div>
      </Panel>

      <Panel
        title="The backend half, as published"
        description="read_properties and build_system_prompt, neither reachable on this integration."
      >
        <SourceCode file="backend/src/agents/doc_reference/agent_config.py" />
      </Panel>

      <Panel title="Doc-vs-implementation notes">
        <ul className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            The page carries a third block, labelled{" "}
            <code>backend/agent.py — agent reads config and rebuilds the system
            prompt</code>, which is LangGraph code:{" "}
            <code>RunnableConfig</code>, <code>my_agent_node</code>,{" "}
            <code>state.get(&quot;copilotkit&quot;, &#123;&#125;)</code>. It has
            no bearing on a Claude Agent SDK backend.
          </li>
          <li>
            <code>read_properties</code>&apos;s docstring explains that it
            accepts a nested{" "}
            <code>config.configurable.properties</code> shape &quot;the
            LangGraph convention the shared runtime route adopts&quot;. There is
            no such route in this integration.
          </li>
          <li>
            The controls that drive <code>ConfigContextRelay</code> are not
            published. They are written here from the three axes and the allowed
            values, which the backend snippet does list.
          </li>
          <li>
            <code>build_system_prompt</code> is genuinely useful and worth
            lifting if you wire this yourself — it is a clean mapping from three
            enums to three prompt clauses.
          </li>
        </ul>
      </Panel>
    </>
  );
}
