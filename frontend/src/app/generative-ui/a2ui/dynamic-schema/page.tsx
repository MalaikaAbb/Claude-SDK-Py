import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/a2ui/dynamic-schema" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Bring your own catalog and let a secondary LLM design the surface per
          request. You declare component names, Zod prop schemas and — crucially
          — <em>descriptions</em>; the runtime serialises that vocabulary into
          the agent&apos;s context so the model knows what it may emit, and the
          A2UI middleware renders cards progressively as data streams in.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          This is the A2UI variant that works here, and the reason is the same
          one that makes Components as Tools work: passing a catalog on the
          provider auto-injects <code>generate_a2ui</code> as a{" "}
          <strong>frontend</strong> tool, which{" "}
          <code>ClaudeAgentAdapter</code> forwards on its own. No backend tool
          is needed, so the missing bridge never comes up.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Build me a dashboard for a fictional SaaS: MRR, churn, active seats, and a bar chart of signups by month.",
              "Show me sales by region as a pie chart with a short summary.",
            ]}
            expect="A progress indicator while the schema generates, then cards appearing one at a time — Card, Metric, DataTable, PieChart or BarChart, chosen by the model from the catalog."
            fail="A markdown table instead of components, or a raw JSON blob in the chat — the latter means the middleware did not detect the operations."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/generative-ui/a2ui/dynamic-schema/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The three-file catalog"
        description="definitions declares the vocabulary, renderers implement it, catalog merges the two with CopilotKit's built-in primitives."
      >
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/generative-ui/a2ui/dynamic-schema/a2ui/definitions.ts" },
            { file: "frontend/src/app/generative-ui/a2ui/dynamic-schema/a2ui/renderers.tsx" },
            { file: "frontend/src/app/generative-ui/a2ui/dynamic-schema/a2ui/catalog.ts" },
          ]}
        />
      </Panel>

      <Panel title="The runtime">
        <SourceCode file="frontend/src/app/api/copilotkit-declarative-gen-ui/[[...slug]]/route.ts" />
      </Panel>

      <Panel title="Doc-vs-implementation notes">
        <Callout tone="warn" title="renderers.tsx has no import block">
          <p className="leading-relaxed">
            The published <code>renderers.tsx</code> opens at{" "}
            <code>export const myRenderers: CatalogRenderers&lt;MyDefinitions&gt; = &#123;</code>{" "}
            and imports nothing. It goes on to use <code>Card</code>,{" "}
            <code>CardHeader</code>, <code>CardTitle</code>,{" "}
            <code>CardDescription</code>, <code>CardContent</code>,{" "}
            <code>Badge</code>, <code>Button</code>, <code>DonutChart</code>,{" "}
            <code>AnimatedBar</code>, <code>useSeenIndices</code>,{" "}
            <code>CHART_COLORS</code>, <code>CHART_TOOLTIP_STYLE</code>, eight
            Recharts exports, and the <code>CatalogRenderers</code> and{" "}
            <code>MyDefinitions</code> types. None is declared.
          </p>
          <p className="mt-2 leading-relaxed">
            The fixed-schema page has the same defect. Everything CopilotKit
            actually exports —{" "}
            <code>createCatalog</code>, <code>CatalogDefinitions</code>,{" "}
            <code>CatalogRenderers</code> — is imported here from{" "}
            <code>@copilotkit/a2ui-renderer</code>; the design-system pieces are
            rebuilt in{" "}
            <code>_components/primitives.tsx</code>, which is flagged in its own
            header as self-defined.
          </p>
        </Callout>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            The page&apos;s &quot;How it works&quot; steps say the tool call
            &quot;streams through LangGraph as <code>TOOL_CALL_ARGS</code>{" "}
            events&quot;. There is no LangGraph here; the events are the same,
            the framework named is not this one.
          </li>
          <li>
            Its opt-out section publishes a backend snippet that imports{" "}
            <code>get_a2ui_tools</code> from <code>ag_ui_langgraph</code> and{" "}
            <code>ChatOpenAI</code> from <code>langchain_openai</code>. Neither
            is installable in a Claude Agent SDK backend. The default
            auto-inject path is the one this route takes, and it needs no
            backend code at all.
          </li>
        </ul>
      </Panel>

      <Panel title="Self-defined components">
        <SourceCode file="frontend/src/app/generative-ui/a2ui/_components/primitives.tsx" />
      </Panel>
    </>
  );
}
