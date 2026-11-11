import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel } from "@/components/ui";

const DOC = "frontend/src/app/generative-ui/a2ui/_doc";

/**
 * The A2UI overview page. It introduces the two approaches and the two ways to
 * switch A2UI on, which this repo already exercises on the Dynamic Schema and
 * Fixed Schema routes. Layout ported from the aws-strands-py harness (the
 * page is the same there); the snippets are this page's, kept byte-for-byte in
 * `_doc/` and type-checked.
 */
export default function Page() {
  const link = "text-[var(--accent)] underline underline-offset-4";
  return (
    <>
      <RouteHeader path="/generative-ui/a2ui" />

      <Panel title="What the page covers">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A2UI surfaces are built from three operations:{" "}
          <code>createSurface</code>, then <code>updateComponents</code> (the
          tree), then <code>updateDataModel</code> (the data, bound through
          JSON Pointer paths). There are two approaches:{" "}
          <Link href="/generative-ui/a2ui/dynamic-schema" className={link}>
            Dynamic Schema
          </Link>{" "}
          (a secondary LLM designs the tree and data) and{" "}
          <Link href="/generative-ui/a2ui/fixed-schema" className={link}>
            Fixed Schema
          </Link>{" "}
          (a pre-authored tree, with the agent streaming data only). A2UI is
          switched on either by a catalog on the provider or on the runtime,
          and the basic catalog can be recolored with CSS variables.
        </p>
      </Panel>

      <Panel
        title="Setup 1: a catalog on the provider (recommended)"
        description="Enables A2UI and injects generate_a2ui. Exercised by /generative-ui/a2ui/dynamic-schema."
      >
        <SourceCodeGroup
          files={[
            { file: `${DOC}/provider-catalog.tsx` },
            { file: "frontend/src/app/generative-ui/a2ui/dynamic-schema/demo-chat/page.tsx" },
          ]}
          note="Top: the page's snippet (myCatalog and children are undefined on the page, suppressed). Bottom: this repo's working form of it."
        />
      </Panel>

      <Panel
        title="Setup 2: enable on the runtime"
        description="The page's no-catalog path turns on injectA2UITool: true. This repo's main runtime uses an a2ui block with injectA2UITool: false, scoped to the Fixed Schema agent."
      >
        <SourceCode file={`${DOC}/runtime-no-catalog.ts`} />
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          See <code>frontend/src/app/api/copilotkit/[[...slug]]/route.ts</code>{" "}
          (<code>a2ui = &#123; injectA2UITool: false, agents: [...] &#125;</code>).
          No route here runs the exact no-catalog, auto-inject combination the
          page shows. <code>myAgent</code> is undefined on the page, and the
          page builds it with no Claude adapter.
        </p>
      </Panel>

      <Callout tone="info" title="The helper snippet uses the CopilotKit Python SDK">
        <p>
          The page lists the operations through{" "}
          <code>from copilotkit import a2ui</code>. This backend does not
          install the <code>copilotkit</code> Python package (the Quickstart&apos;s
          install line does not include it). The Fixed Schema route&apos;s{" "}
          <code>display_flight</code> returns the <code>a2ui_operations</code>{" "}
          envelope as a plain dict instead. The snippet is kept verbatim at{" "}
          <code>backend/src/agents/doc_reference/a2ui_helpers.py</code>, not
          imported.
        </p>
        <div className="mt-3">
          <SourceCode file="backend/src/agents/doc_reference/a2ui_helpers.py" />
        </div>
      </Callout>

      <Panel
        title="Colors and dark mode"
        description="CSS variables on .a2ui-surface; shown, not applied in this repo."
      >
        <SourceCode file={`${DOC}/surface-colors.css`} />
      </Panel>
    </>
  );
}
