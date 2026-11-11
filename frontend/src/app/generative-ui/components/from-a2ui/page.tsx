import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, CodeBlock, Panel } from "@/components/ui";

const BASE = "frontend/src/app/generative-ui/components/from-a2ui";

// The page's before/after snippets that this route does not run, verbatim.
const BEFORE_PROVIDER = `<CopilotKit runtimeUrl="/api/copilotkit" a2ui={{ catalog: myCatalog }}>`;
const AFTER_PROVIDER = `<CopilotKitProvider runtimeUrl="/api/copilotkit" generativeUI={{ ui: appUI }}>`;
const RUNTIME_BEFORE = `const runtime = new CopilotRuntime({
  agents,
  a2ui: { injectA2UITool: false, agents: ["shop"] },
});`;
const RUNTIME_AFTER = `// Nothing: a run that carries a catalog gets the render_ui tool and the guide.
// To force or limit it: generativeUI: true, or generativeUI: { agents: ["shop"] }.
const runtime = new CopilotRuntime({ agents });`;
const CATALOG_BEFORE = `import { createCatalog, DynamicStringSchema } from "@copilotkit/a2ui-renderer";

const definitions = {
  Airport: {
    props: z.object({ code: DynamicStringSchema, city: DynamicStringSchema }),
  },
  Arrow: { props: z.object({}) },
};
const renderers = { Airport, Arrow };
export const myCatalog = createCatalog(definitions, renderers, {
  catalogId: "acme/flights",
  includeBasicCatalog: true,
});`;

/** Layout ported from the aws-strands-py harness's route for the same page. */
export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/components/from-a2ui" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The move from the <code>a2ui</code> renderer (A2UI v0.9) to
          components and surfaces (A2UI 1.0). The provider takes a{" "}
          <code>ui</code> instead of a <code>catalog</code>, the runtime loses
          its A2UI option, and each component becomes a single entry with a
          description and plain prop types, because the engine resolves
          bindings before the component renders. The demo runs the page&apos;s
          &ldquo;After&rdquo; catalog is kept verbatim and type-checked; nothing
          runs it, because the page publishes no agent.
        </p>
      </Panel>

      <Panel title="The After catalog, as published (type-checked, not mounted)">
        <SourceCode file={`${BASE}/app-ui.ts`} />
      </Panel>

      <Panel
        title="Borrowed components"
        description="Airport and Arrow are registered by the page's catalog and never defined. Taken from the aws-strands-py harness."
      >
        <SourceCode file={`${BASE}/flight-components.tsx`} />
      </Panel>

      <Panel
        title="Published but not run"
        description="The before/after pairs. The Before side is what the A2UI Dynamic and Fixed Schema routes still run."
      >
        <div className="space-y-4">
          <CodeBlock code={BEFORE_PROVIDER} filename="Before" language="tsx" />
          <CodeBlock code={AFTER_PROVIDER} filename="After" language="tsx" />
          <CodeBlock code={RUNTIME_BEFORE} filename="Runtime, before" language="ts" />
          <CodeBlock code={RUNTIME_AFTER} filename="Runtime, after" language="ts" />
          <CodeBlock code={CATALOG_BEFORE} filename="Convert a custom catalog — Before" language="ts" />
        </div>
      </Panel>

      <Callout tone="warn" title="Gaps and harness choices">
        <ul className="space-y-1.5">
          <li>
            · The After catalog uses <code>z</code>, <code>Airport</code> and{" "}
            <code>Arrow</code> without imports or definitions. The import is
            added and the two components are borrowed from aws-strands-py.
          </li>
          <li>
            · The page publishes no agent or backend, and none was added, so
            this route is reference-only: the After catalog is type-checked
            but not mounted on any chat.
          </li>
          <li>
            · This repo&apos;s Fixed Schema route returns v0.9{" "}
            <code>a2ui_operations</code> from <code>display_flight</code>. The
            page says the 1.0 engine rejects v0.9 shapes, so that tool cannot
            move to this engine as published.
          </li>
          <li>· Angular tabs are not implemented (React harness).</li>
        </ul>
      </Callout>
    </>
  );
}
