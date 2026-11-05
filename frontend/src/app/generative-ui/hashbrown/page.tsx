import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/hashbrown" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The same dashboard idea as{" "}
          <Link href="/generative-ui/json-render" className="text-[var(--accent)] underline underline-offset-4">
            JSON Render
          </Link>
          , but streamed. The agent writes one JSON object with a{" "}
          <code>ui</code> array, and Hashbrown&apos;s parser renders each
          entry as soon as it is complete, so the dashboard builds up while
          the reply is still arriving. Components come from a UI kit built
          once and shared through context.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Show me a Q4 sales dashboard. Include a total-revenue metric card, a pie chart of revenue by segment, and a bar chart of monthly revenue.",
              "Show me monthly operating expenses for the last six months as a bar chart with one bar per month.",
            ]}
            expect="Pieces appear one by one while the reply streams: a heading, a metric card, then the charts. JSON text never shows."
            fail="Nothing renders until the end, which means the parser is not getting partial content. An empty message means the reply was not valid against the kit's schema, for example code fences or prose around the JSON, or chart data sent as an array instead of a string."
          />
        </div>
      </Panel>

      <Panel title="The demo" description="The page's page.tsx inside this repo's frame.">
        <SourceCode file="frontend/src/app/generative-ui/hashbrown/demo-chat/page.tsx" />
      </Panel>

      <Panel title="The chat" description="As printed on the page.">
        <SourceCode file="frontend/src/app/generative-ui/hashbrown/chat.tsx" />
      </Panel>

      <Panel title="The renderer and UI kit" description="As printed on the page.">
        <SourceCode file="frontend/src/app/generative-ui/hashbrown/hashbrown-renderer.tsx" />
      </Panel>

      <Panel title="The agent" description="The page does not print it; this is the showcase source its Code tab loads, verbatim.">
        <SourceCode file="backend/src/agents/byoc_hashbrown_agent.py" />
      </Panel>

      <Panel title="Notes">
        <ul className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            The page prints 3 of the demo&apos;s 11 files. The rest
            (<code>suggestions.ts</code>, <code>types.ts</code>,{" "}
            <code>metric-card.tsx</code>, the charts, the agent) come unchanged
            from the showcase source its Code tab loads. The three printed
            files match it exactly.
          </li>
          <li>
            Versions pinned as the page says: <code>@hashbrownai/core</code>{" "}
            and <code>@hashbrownai/react</code> at <code>0.5.0-beta.4</code>,
            a pre-release.
          </li>
          <li>
            The kit&apos;s <code>examples</code> use Hashbrown&apos;s{" "}
            <code>&lt;ui&gt;</code> tag syntax, but the parser expects the JSON
            envelope. The agent&apos;s docstring explains it: the tag syntax is
            for when Hashbrown drives the model itself, and here Claude does.
          </li>
          <li>
            The <code>dealCard</code> component has no example prompt among
            the suggestions; ask for a list of deals to exercise it.
          </li>
          <li>
            Same as JSON Render: the components use the showcase&apos;s theme
            variables, which this app does not define, and{" "}
            <code>charts/pie-chart.tsx</code> fails this repo&apos;s lint as
            published.
          </li>
        </ul>
      </Panel>
    </>
  );
}
