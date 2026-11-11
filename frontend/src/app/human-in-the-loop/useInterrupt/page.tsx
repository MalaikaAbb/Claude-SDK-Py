import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const DIR = "frontend/src/app/human-in-the-loop/useInterrupt";

// The page's multi-interrupt fragment, verbatim. Not mounted: it is a bare
// hook call with no component around it, and only one useInterrupt can own
// the page.
const MULTI = `useInterrupt({
  render: ({ interrupts, resolve, cancel }) => (
    <ul>
      {interrupts.map((i) => (
        <li key={i.id}>
          {i.message}
          <button onClick={() => resolve({ ok: true }, i.id)}>Approve</button>
          <button onClick={() => cancel(i.id)}>Cancel</button>
        </li>
      ))}
    </ul>
  ),
});`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/human-in-the-loop/useInterrupt" />

      <Callout tone="warn" title="Broken as published: the frontend half is missing">
        <p className="leading-relaxed">
          For this framework the page swaps <code>useInterrupt</code> for a{" "}
          <code>useFrontendTool</code> called <code>schedule_meeting</code>{" "}
          whose handler holds a Promise open until the user picks a slot. That
          code is where the page&apos;s frontend snippet should be, and the
          rendered page shows nothing there (its source region is missing). The
          backend prompt it prints tells Claude to call{" "}
          <code>schedule_meeting</code>; with no such tool registered, the
          model cannot pause. The tool is not written in here.
        </p>
      </Callout>

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A pause the agent cannot skip: the run stops, a React component takes
          the user&apos;s answer, and the run resumes with it. The page then
          documents the generic <code>useInterrupt</code> contract: the AG-UI
          standard flow (<code>RUN_FINISHED</code> with an interrupt outcome),
          the legacy <code>on_interrupt</code> event, multi-interrupt
          handling, and <code>responseSchema</code>.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Book a call with the sales team to discuss pricing."]}
            expect="As a report: no picker. Claude has no schedule_meeting tool, so it answers in text (it may say it cannot book, or ask for a time itself). The Approve/Cancel card never appears, because this adapter emits no interrupts."
            fail="A time picker appearing would mean something registered schedule_meeting, which this route deliberately does not."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCodeGroup
          files={[
            { file: `${DIR}/demo-chat/page.tsx` },
            { file: `${DIR}/approval-interrupt.tsx` },
          ]}
          note="The chat and the page's Approve / Cancel example, verbatim apart from imports."
        />
      </Panel>

      <Panel title="The agent">
        <SourceCode file="backend/src/agents/prompts.py" region="interrupt-prompt" />
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          The page&apos;s <code>interrupt_agent.py</code> prompt, verbatim, on
          the Quickstart <code>ClaudeAgentAdapter</code> as{" "}
          <code>gen-ui-interrupt</code>. No tools.
        </p>
      </Panel>

      <Panel title="Published but not run" description="Multi-interrupt handling, a bare hook call.">
        <CodeBlock code={MULTI} filename="Multi-interrupt behavior" language="tsx" />
      </Panel>

      <Panel title="Doc-vs-implementation notes">
        <ul className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            The adapter can emit a real AG-UI interrupt, but only for tools
            passed as <code>defer_tools</code>, and the page never mentions
            that option. The <code>ApprovalInterrupt</code> example therefore
            has nothing to react to here.
          </li>
          <li>
            Its <code>resolve(&#123; approved: true &#125;)</code> payload is
            the generic shape. The Claude adapter resumes a deferred tool on{" "}
            <code>&#123; behavior: &quot;allow&quot; | &quot;deny&quot; &#125;</code>{" "}
            (see AGENTS.md), so the example would not resume it as written
            either.
          </li>
          <li>
            The page&apos;s &quot;When should I use this?&quot; and Going
            further sections link to <code>../human-in-the-loop</code> and{" "}
            <code>./headless</code>; both are routes in this repo.
          </li>
        </ul>
      </Panel>
    </>
  );
}
