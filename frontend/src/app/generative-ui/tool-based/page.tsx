import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/tool-based" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The simplest generative UI: register a component with{" "}
          <code>useComponent</code> and it becomes a tool. No handler, no
          server-side execution, no user interaction — the agent decides when to
          show it, fills in the data, and CopilotKit paints it. Zod validates
          the model&apos;s arguments before they reach your props.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Contrast with{" "}
          <Link
            href="/generative-ui/tool-rendering"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Tool Call Rendering
          </Link>
          , which wraps a real backend tool in custom UI. Here the component{" "}
          <em>is</em> the tool — which is exactly why this route works on this
          integration and that one does not.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Chart quarterly revenue for last year: Q1 120, Q2 145, Q3 138, Q4 190.",
              "Make up monthly signups for a startup's first six months and chart them.",
            ]}
            expect="A bar chart renders inline in the chat with the four quarters plotted, followed by a short sentence from Claude."
            fail="A markdown table or a description of a chart instead of the chart — the model answered in prose rather than calling the tool."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/generative-ui/tool-based/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The component"
        description="Ordinary React. It reads its props and imports nothing from CopilotKit — which is the page's point about this pattern."
      >
        <SourceCode file="frontend/src/app/generative-ui/tool-based/bar-chart.tsx" />
      </Panel>

      <Panel title="Notes">
        <ul className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            The page publishes the four-line <code>useComponent</code> call and
            nothing else on the frontend. <code>BarChart</code> and{" "}
            <code>barChartPropsSchema</code> are named by that call and never
            defined; both are written here, minimally, from the page&apos;s
            description of them.
          </li>
          <li>
            The page&apos;s advice on naming holds and is worth repeating:{" "}
            <code>name</code> is what the model sees, so a verb like{" "}
            <code>render_bar_chart</code> gets picked far more reliably than a
            noun.
          </li>
        </ul>
      </Panel>
    </>
  );
}
