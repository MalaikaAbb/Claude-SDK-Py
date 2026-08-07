import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/multi-agent/subagents" />

      <Callout tone="warn" title="The supervisor has nothing to call">
        <p className="leading-relaxed">
          The three delegation tools are <strong>backend</strong> tools, so they
          hit the same wall as{" "}
          <Link
            href="/generative-ui/tool-rendering"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Tool Call Rendering
          </Link>
          . And there is a second gap specific to this page: the run loop that
          would dispatch a delegation, record it into the{" "}
          <code>delegations</code> state slot and hand the result back as a{" "}
          <code>tool_result</code> — the page calls it the
          &quot;subagents-delegation-flow region&quot; and refers to it three
          times — is never published. Even given a tool bridge, the piece that
          makes the log grow is missing.
        </p>
      </Callout>

      <Panel title="What it would demonstrate">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The canonical multi-agent shape: a supervisor exposes each specialist
          as a tool, decides what to delegate, and reads the results back on its
          next step. Structurally it is just tool-calling, except every
          &quot;tool&quot; is a full agent with its own prompt and model. The
          example is Research → Write → Critique, with a delegation log that
          grows in real time so a long run is not an opaque spinner.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Write a short brief on why remote teams struggle with onboarding.",
            ]}
            expect="Currently: the supervisor describes the research → write → critique plan and produces the brief itself. The three indicator chips stay dim and the log stays empty."
            fail="Populated delegation entries would mean the tool bridge and the delegation flow both landed upstream — raise this route to Working."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/multi-agent/subagents/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The delegation log"
        description="Published in full and reproduced, plus the SUB_AGENT_STYLE map and two types it uses that the page never declares."
      >
        <SourceCode file="frontend/src/app/multi-agent/subagents/delegation-log.tsx" />
      </Panel>

      <Panel
        title="The backend half, as published"
        description="Prompts, tool schemas and the sub-agent invoker — everything except the loop that would run them."
      >
        <SourceCode file="backend/src/agents/doc_reference/subagents.py" />
      </Panel>

      <Panel title="What runs instead">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The supervisor prompt is the page&apos;s, verbatim, on a plain
          Quickstart adapter. That is deliberate: the prompt names three tools
          that do not exist, and watching the model reach for them and find
          nothing is the clearest demonstration of the gap. The three sub-agent
          prompts and <code>_invoke_sub_agent</code> are reproduced above but
          never imported.
        </p>
        <div className="mt-4">
          <SourceCodeGroup files={[{ file: "backend/src/agents/prompts.py" }]} />
        </div>
      </Panel>

      <Panel title="Doc-vs-implementation notes">
        <ul className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            The page publishes <code>_delegation_tool_schema</code> and{" "}
            <code>SUPERVISOR_TOOLS</code> three separate times, in three
            different sections, byte-identical each time.
          </li>
          <li>
            <code>_invoke_sub_agent</code> imports{" "}
            <code>normalize_claude_model</code> from{" "}
            <code>agents.claude_agent_sdk_adapter</code> — the same unpublished
            module the Reasoning Messages page imports from. That import alone
            makes the published file unrunnable.
          </li>
          <li>
            The log component uses a <code>SUB_AGENT_STYLE</code> lookup for
            every entry&apos;s emoji, label and colour, and a{" "}
            <code>SubAgentName</code> type for its keys. Neither is declared
            anywhere on the page; both are written out in the file above.
          </li>
          <li>
            The page notes that each sub-agent is an isolated call with no
            shared memory, which is why the delegation tool&apos;s{" "}
            <code>task</code> argument is documented as needing prior facts
            passed verbatim. That constraint is real and worth keeping if you
            build this pattern yourself.
          </li>
        </ul>
      </Panel>
    </>
  );
}
