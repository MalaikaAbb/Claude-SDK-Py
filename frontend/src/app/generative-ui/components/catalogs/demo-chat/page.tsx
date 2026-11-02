"use client";

import { CopilotChat, useAgentContext, useConfigureSuggestions } from "@copilotkit/react-core/v2";
import { useMemo, useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

import { ComponentsProvider } from "../../_components/provider";
import { PRODUCTS } from "../../_components/products";
import { appUI, exportedCatalog } from "../app-catalog";

const AGENT_ID = "gen-ui-catalogs";

/**
 * A custom catalog on the provider: `generativeUI={{ ui: appUI }}`, where
 * `appUI` extends the standard catalog with the page's `shopUI` and the
 * snippets around it. The right-hand panel is `exportA2UICatalog(appUI)` —
 * the same JSON an A2UI tool would be handed.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/generative-ui/components/catalogs" subtitle={`agent: ${AGENT_ID}`}>
      <ComponentsProvider generativeUI={{ ui: appUI }}>
        <div className="grid h-full grid-cols-1 lg:grid-cols-[1fr_380px]">
          <Chat />
          <ExportPanel />
        </div>
      </ComponentsProvider>
    </DemoFrame>
  );
}

function Chat() {
  // NOT DOC CODE — see `_components/products.ts`.
  useAgentContext({
    description: "The products in the shop. Copy values from here into ProductCard.",
    value: PRODUCTS,
  });

  useConfigureSuggestions({
    suggestions: [
      { title: "Product grid", message: "Show me the three cheapest products in a product grid." },
      { title: "Hero + cart", message: "Show a Hero titled 'Welcome back' and a cart summary for 2 items totalling $113." },
      { title: "Panel", message: "Put the lamp and the mug inside a Panel titled 'Desk setup'." },
    ],
    available: "always",
  });

  return <CopilotChat agentId={AGENT_ID} className="h-full min-h-0" />;
}

function ExportPanel() {
  const [open, setOpen] = useState(true);
  const json = useMemo(() => {
    try {
      return JSON.stringify(exportedCatalog(), null, 2);
    } catch (error) {
      return `exportA2UICatalog threw:\n${String(error)}`;
    }
  }, []);

  return (
    <aside className="hidden min-h-0 flex-col border-l border-slate-200 lg:flex dark:border-slate-800">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="shrink-0 border-b border-slate-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800"
      >
        exportA2UICatalog(appUI) {open ? "▾" : "▸"}
      </button>
      {open && (
        <pre className="min-h-0 flex-1 overflow-auto p-3 text-[11px] leading-snug text-slate-700 dark:text-slate-300">
          {json}
        </pre>
      )}
    </aside>
  );
}
