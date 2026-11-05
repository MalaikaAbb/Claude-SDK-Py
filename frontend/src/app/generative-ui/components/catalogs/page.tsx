import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/components/catalogs" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A catalog is the set of components the agent may compose. You build
          one with <code>createGenerativeUI</code>: each entry is an ordinary
          React component, a schema for its props, and optional slots for
          children. Catalogs can extend each other, and{" "}
          <code>exportA2UICatalog</code> turns one into plain A2UI JSON for
          other tools.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Show me the three cheapest products in a product grid.",
              "Show a Hero titled 'Welcome back' and a cart summary for 2 items totalling $113.",
              "Put the lamp and the mug inside a Panel titled 'Desk setup'.",
            ]}
            expect="Your own components render — a two-column ProductGrid of ProductCards with image, name and $price; a large Hero heading; a one-line CartSummary; a bordered Panel holding cards. The right-hand panel shows the exported catalog JSON listing these components alongside the standard ones."
            fail="Standard-catalog Cards instead of ProductCards means the custom components were not offered. If the export panel shows 'exportA2UICatalog threw', the catalog itself is invalid."
          />
        </div>
      </Panel>

      <Panel title="The catalog" description="The page's app/catalog.tsx, unchanged.">
        <SourceCode file="frontend/src/app/generative-ui/components/catalogs/catalog.tsx" />
      </Panel>

      <Panel
        title="Combine, order, export"
        description="The page's follow-on snippets in one file. cartUI, Hero and Panel are named by the page and never defined; they are supplied and marked."
      >
        <SourceCode file="frontend/src/app/generative-ui/components/catalogs/app-catalog.tsx" />
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/generative-ui/components/catalogs/demo-chat/page.tsx" />
      </Panel>

      <Panel title="Notes">
        <ul className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            The published catalog type-checks as written against 1.83.0,
            including the self-referential{" "}
            <code>GenerativeUIComponentProps&lt;typeof shopUI, …&gt;</code>{" "}
            inside <code>shopUI</code>&apos;s own components.
          </li>
          <li>
            The page writes the export to disk with <code>fs</code>. That only
            works in a script; the demo renders the same JSON in the browser.
          </li>
          <li>
            Only the zod schema tab is implemented. The Valibot tab needs{" "}
            <code>valibot</code> and <code>@valibot/to-json-schema</code>, which
            this repo does not install.
          </li>
        </ul>
      </Panel>
    </>
  );
}
