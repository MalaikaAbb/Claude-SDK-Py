import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/json-render" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Bring-your-own rendering with no tool call at all. The agent&apos;s
          whole reply is a JSON spec, <code>{"{ root, elements }"}</code>, and
          the chat&apos;s assistant-message slot is swapped for a renderer that
          parses it and hands it to <code>@json-render/react</code>. Only the
          three component types in the catalog are allowed; anything that does
          not parse falls back to a normal message bubble.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Compare{" "}
          <Link href="/generative-ui/hashbrown" className="text-[var(--accent)] underline underline-offset-4">
            Hashbrown
          </Link>
          , which solves the same dashboard with a streaming parser.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Show me the sales dashboard with metrics and a revenue chart",
              "Break down revenue by category as a pie chart",
            ]}
            expect="While the reply streams you see an ordinary bubble (or nothing). Once the JSON closes, it is replaced by a MetricCard with a bar chart under it, or a donut chart with a legend. No JSON text stays visible."
            fail="Raw JSON left in the chat: the reply did not parse, usually prose or an unknown component type around it. A blank area where the chart should be: a prop shape the chart cannot draw, since parseSpec does not validate props."
          />
        </div>
      </Panel>

      <Panel title="The chat" description="As printed on the page.">
        <SourceCode file="frontend/src/app/generative-ui/json-render/chat.tsx" />
      </Panel>

      <Panel title="The renderer" description="As printed on the page.">
        <SourceCode file="frontend/src/app/generative-ui/json-render/json-render-renderer.tsx" />
      </Panel>

      <Panel title="Catalog and registry" description="As printed on the page.">
        <SourceCode file="frontend/src/app/generative-ui/json-render/catalog.ts" />
        <div className="mt-4">
          <SourceCode file="frontend/src/app/generative-ui/json-render/registry.tsx" />
        </div>
      </Panel>

      <Panel title="The agent" description="The page does not print it; this is the showcase source its Code tab loads, verbatim.">
        <SourceCode file="backend/src/agents/byoc_json_render_agent.py" />
      </Panel>

      <Panel title="Notes">
        <ul className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            The page prints 4 of the demo&apos;s 13 files. The other nine
            (<code>page.tsx</code>, <code>suggestions.ts</code>,{" "}
            <code>types.ts</code>, <code>metric-card.tsx</code>, the charts,
            the agent) come unchanged from{" "}
            <code>showcase/integrations/claude-sdk-python</code> in the
            CopilotKit repo, which is what the page&apos;s Code tab shows. The
            four printed files match that source exactly.
          </li>
          <li>
            Versions as the page says: <code>@json-render/*</code>{" "}
            <code>0.18.0</code>, with Zod 4 through the <code>zod4</code> alias
            because the rest of this app is on Zod 3.
          </li>
          <li>
            The components style themselves with the showcase&apos;s theme
            variables (<code>--card</code>, <code>--border</code>,{" "}
            <code>--foreground</code>, …). No page publishes that theme and this
            app does not define them, so cards render with default colours.
          </li>
          <li>
            The showcase&apos;s <code>charts/pie-chart.tsx</code> fails this
            repo&apos;s lint (<code>react-hooks/immutability</code>, a running
            total mutated inside <code>.map</code>). Left as published.
          </li>
          <li>
            Its runtime route is the page&apos;s <code>runtimeUrl</code>,{" "}
            <code>/api/copilotkit-declarative-json-render</code>, with one
            agent and no generative-UI options. The agent is plain text, so
            nothing else is needed.
          </li>
        </ul>
      </Panel>
    </>
  );
}
