import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/components/surfaces" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          By default the agent&apos;s UI lands in the chat. A{" "}
          <code>GenerativeUISurface</code> is a named slot anywhere else on the
          page: the agent is told which ones are on screen and what each is for,
          and can render into, update, or delete them. A surface can narrow the
          catalog to an allowlist and show a fallback until the agent fills it.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Show the three cheapest products in the featured row.",
              "Fill in the 'You might also like' rows for every product on the page.",
              "Show me the featured products again.",
            ]}
            expect="The dashed fallback row under Featured is replaced by a ProductGrid of real cards with images and prices; recommendation rows fill under each selected product without repeating that product; asking for the featured products again deletes the surface and the dashed fallback comes back."
            fail="The grid appears in the chat instead of the Featured row — the agent did not see or did not use the target. A product listed in its own recommendations row breaks the description's rule. Entries in the errorBoundary log name the surface and the reason an operation was rejected."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/generative-ui/components/surfaces/demo-chat/page.tsx" />
      </Panel>

      <Panel title="The featured surface" description="The page's app/page.tsx, plus the ProductRow fallback it uses and never defines.">
        <SourceCode file="frontend/src/app/generative-ui/components/surfaces/featured-products.tsx" />
      </Panel>

      <Panel title="Notes">
        <ul className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            <code>shopUI</code> is the Catalogs page&apos;s catalog, imported
            from that route rather than copied, since the page imports it from{" "}
            <code>./catalog</code>.
          </li>
          <li>
            The catalog tells the agent to copy values &quot;from a product of
            a tool result&quot;. No tool or data is published, so the demo
            hands the agent a product list through <code>useAgentContext</code>{" "}
            — marked <code>NOT DOC CODE</code>.
          </li>
          <li>
            The <code>errorBoundary</code> config is the page&apos;s; its{" "}
            <code>onError</code> also writes to the on-page log so failures are
            visible without the console.
          </li>
        </ul>
      </Panel>
    </>
  );
}
