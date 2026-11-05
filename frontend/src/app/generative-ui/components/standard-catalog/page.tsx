import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/components/standard-catalog" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <code>standardUI</code> ships 69 ready-made components — layout,
          text, inputs, tables, charts, media, overlays. You can use it as is,
          add your own components next to it, drop ones you do not want with{" "}
          <code>.omit()</code>, or swap a built-in&apos;s look with{" "}
          <code>overrides</code> while the agent keeps using the same name.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Put a short welcome message inside a Card.",
              "Show a ProductCard for a $49 'Canvas Tote'.",
              "Show me a map of Paris.",
              "Show three tabs — Overview, Pricing, FAQ — each with a sentence of text.",
            ]}
            expect="The Card renders with large rounded corners and padding (the override, not the default); the ProductCard has an amber dashed border labelled 'ProductCard (app)'; a map request produces something other than a map (a list, text, or a link) because Map is omitted; tabs switch when clicked."
            fail="A default-styled Card means the override did not apply. A real map, or an operation rejected for an unknown 'Map' component, tells you whether omit removed it from the prompt or only from rendering."
          />
        </div>
      </Panel>

      <Panel title="The catalog" description="Extend, omit and override from the page, combined into one catalog.">
        <SourceCode file="frontend/src/app/generative-ui/components/standard-catalog/catalog.tsx" />
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/generative-ui/components/standard-catalog/demo-chat/page.tsx" />
      </Panel>

      <Panel title="Notes">
        <ul className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            <code>ProductCard</code> and <code>productSchema</code> are named
            by the page and not defined. Both are supplied and marked.
          </li>
          <li>
            <code>Map</code> needs <code>maplibre-gl</code>, which is not
            installed here; it is omitted in this catalog anyway, per the
            page&apos;s own example. <code>Chart</code> uses the bundled
            recharts.
          </li>
          <li>
            The per-component reference pages linked from the doc were not
            implemented one by one — the demo exercises them through the agent.
          </li>
        </ul>
      </Panel>
    </>
  );
}
