import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { CodeBlock, Callout, Panel, TryIt } from "@/components/ui";

const RUNTIME = `// The runtime half the page prescribes. A catalog auto-injects the
// A2UI tool by default, so injection is turned off here: in this pattern
// the agent owns display_flight and would otherwise have two ways to
// draw one card. Both halves are wired in this repo — see
// frontend/src/app/api/copilotkit/route.ts.
const runtime = new CopilotRuntime({
  agents: { "a2ui-fixed-schema": agent },
  a2ui: { injectA2UITool: false, agents: ["a2ui-fixed-schema"] },
});`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/a2ui/fixed-schema" />

      <Callout tone="warn" title="Works, but three pieces are repo-supplied rather than doc code">
        <ul className="mt-1 list-disc space-y-1 pl-5 leading-relaxed">
          <li>
            <code>display_flight</code> is a <strong>backend</strong> tool with
            no published registration path. This repo bridges it in{" "}
            <code>backend/src/agents/flights_mcp_server.py</code>: the
            published tool wrapped by <code>tool()</code> +{" "}
            <code>create_sdk_mcp_server()</code>, passed to the adapter via{" "}
            <code>mcp_servers</code> / <code>allowed_tools</code>. See README
            §9.1.
          </li>
          <li>
            <code>flight_schema.json</code> is loaded by the published code and
            never published, nor is <code>booked_schema.json</code>. The copies
            in <code>doc_reference/a2ui_schemas/</code> come from the Google
            ADK harness and match the tree this page diagrams.
          </li>
          <li>
            <code>SURFACE_ID</code> and <code>CATALOG_ID</code> are used by{" "}
            <code>_display_flight_operations</code> and defined on neither side
            of the page. <code>CATALOG_ID</code> is taken from the page&apos;s
            own <code>catalog.ts</code>; <code>SURFACE_ID</code> has no
            published value, so <code>&quot;flight-fixed-schema&quot;</code> is
            this repo&apos;s. Both are marked <code>NOT DOC CODE</code> in the
            file.
          </li>
        </ul>
      </Callout>

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The opposite trade to dynamic schemas: design the component tree once,
          up front, and let the tool supply only the data. Nothing is generated
          at runtime, so the surface appears the instant the tool returns — no
          secondary LLM call, no schema drift, deterministic UI.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The tree is compositional rather than one monolithic{" "}
          <code>FlightCard</code>: <code>Card &gt; Column &gt; [Title, Row(Airport
          → Arrow → Airport), Row(AirlineBadge · PriceTag), Button]</code>.
          Components without data bindings carry their value inline; bound ones
          reference fields by JSON Pointer, and the binder resolves those paths
          before the React renderer runs.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Find me a flight from SFO to JFK."]}
            expect="A flight card mounts in the chat: Flight Details, SFO → JFK, an airline badge and a price, plus a Book flight button, followed by a one-sentence reply."
            fail="A prose-only reply with no card. Check the backend log for the flights MCP server; if the tool fired but nothing drew, compare CATALOG_ID in catalog.ts with the createSurface operation."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/generative-ui/a2ui/fixed-schema/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The five-component catalog"
        description="Title, Airport, Arrow, AirlineBadge, PriceTag — plus Card and Button overrides — merged with CopilotKit's basic catalog. Published in full and reproduced as such."
      >
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/generative-ui/a2ui/fixed-schema/a2ui/definitions.ts" },
            { file: "frontend/src/app/generative-ui/a2ui/fixed-schema/a2ui/renderers.tsx" },
            { file: "frontend/src/app/generative-ui/a2ui/fixed-schema/a2ui/catalog.ts" },
          ]}
        />
      </Panel>

      <Panel
        title="The backend half, as published — and the bridge that carries it"
        description="The doc's module with its three repo-supplied values marked, the schema it loads, and the repo-authored MCP server that puts display_flight in front of Claude."
      >
        <SourceCodeGroup
          files={[
            { file: "backend/src/agents/doc_reference/a2ui_fixed.py" },
            { file: "backend/src/agents/doc_reference/a2ui_schemas/flight_schema.json" },
            { file: "backend/src/agents/flights_mcp_server.py" },
          ]}
        />
      </Panel>

      <Panel title="Registering the runtime">
        <CodeBlock code={RUNTIME} language="ts" />
      </Panel>

      <Panel title="Doc-vs-implementation notes">
        <Callout tone="warn" title="renderers.tsx has no import block">
          <p className="leading-relaxed">
            The published <code>renderers.tsx</code> starts at{" "}
            <code>export const renderers: CatalogRenderers&lt;Definitions&gt; = &#123;</code>{" "}
            with nothing above it, then uses <code>Card</code>,{" "}
            <code>Badge</code>, <code>Separator</code>, <code>UIButton</code>,
            the <code>s()</code> string helper, and the{" "}
            <code>CatalogRenderers</code> and <code>Definitions</code> types —
            none of them imported or defined. The{" "}
            <Link
              href="/generative-ui/a2ui/dynamic-schema"
              className="text-[var(--accent)] underline underline-offset-4"
            >
              dynamic-schema
            </Link>{" "}
            page has the same defect, at greater length.
          </p>
          <p className="mt-2 leading-relaxed">
            Here <code>CatalogRenderers</code> comes from{" "}
            <code>@copilotkit/a2ui-renderer</code>, <code>Definitions</code>{" "}
            from the sibling <code>definitions.ts</code>, <code>s()</code> is
            written inline where the page uses it, and the four UI primitives
            are rebuilt in{" "}
            <code>_components/primitives.tsx</code> — flagged in its own header
            as self-defined, since they are the one thing on these routes that
            is not the docs&apos;.
          </p>
        </Callout>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            The page shows its Python three times, under{" "}
            <code>schema-loading</code>, <code>schema-inline</code> and{" "}
            <code>llm-driven</code> branches — and the block is byte-identical
            in all three, including under <em>&quot;Define the schema
            inline&quot;</em>, where it is a <code>json.load</code> from a file.
            Which branch applies to this framework is not stated; the code shown
            is the schema-loading one.
          </li>
          <li>
            The Book button is inert by the page&apos;s own admission:{" "}
            <code>a2ui.render</code> in the Python SDK does not yet accept{" "}
            <code>action_handlers</code>. The renderer keeps the button for
            visual fidelity and does nothing on click, which is what the
            published renderer does too. <code>booked_schema.json</code> is
            shipped alongside the flight schema for completeness and is never
            loaded.
          </li>
          <li>
            The page&apos;s closing pointer for the full action-handler pattern
            links to <code>/integrations/langgraph/…</code> — a different
            integration&apos;s doc tree.
          </li>
        </ul>
      </Panel>
    </>
  );
}
