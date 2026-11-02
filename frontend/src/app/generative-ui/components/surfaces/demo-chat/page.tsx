"use client";

import { CopilotChat, useAgentContext, useConfigureSuggestions } from "@copilotkit/react-core/v2";
import { GenerativeUISurface } from "@copilotkit/react-core/v2/generative-ui";
import { useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

import { ComponentsProvider } from "../../_components/provider";
import { PRODUCTS } from "../../_components/products";
import { shopUI } from "../../catalogs/catalog";
import { FeaturedProducts } from "../featured-products";

const AGENT_ID = "gen-ui-surfaces";

/**
 * Surfaces outside the chat. The left column is a shop page with three kinds
 * of target, each straight from the page:
 *
 *   - `featured` — scoped to two components, with a static fallback row.
 *   - `recommendations-<id>` — one per product, keyed, each with its own
 *     description; the agent sees every one that is on screen.
 *   - `sidebar-notes` — no catalog, no allowlist, `autoScroll={false}`.
 *
 * The provider carries the page's `errorBoundary`; its `onError` also feeds
 * the on-page log so a rejected or crashing component is visible without
 * opening the console.
 */
export default function Page() {
  const [errors, setErrors] = useState<string[]>([]);

  return (
    <DemoFrame parentPath="/generative-ui/components/surfaces" subtitle={`agent: ${AGENT_ID}`}>
      <ComponentsProvider
        generativeUI={{
          ui: shopUI,
          errorBoundary: {
            onError: (info) => {
              console.warn(info.kind, info.surfaceId, info.error.message);
              setErrors((prev) => [
                `${info.kind} · ${info.surfaceId ?? "?"} · ${info.error.message}`,
                ...prev,
              ].slice(0, 5));
            },
            fallback: ({ retry }) => <button onClick={retry}>Try again</button>,
          },
        }}
      >
        <style>{`[data-generative-ui-surface] { scroll-margin-top: 6rem; }`}</style>
        <div className="grid h-full grid-cols-1 lg:grid-cols-[1fr_420px]">
          <ShopPage errors={errors} />
          <Chat />
        </div>
      </ComponentsProvider>
    </DemoFrame>
  );
}

function ShopPage({ errors }: { errors: string[] }) {
  const [selected, setSelected] = useState(PRODUCTS.slice(0, 2));

  return (
    <div className="min-h-0 space-y-6 overflow-y-auto p-5">
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Featured · surface <code>featured</code>
        </h2>
        <FeaturedProducts products={PRODUCTS} />
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Product pages · one <code>recommendations-*</code> surface each
        </h2>
        <div className="mb-3 flex flex-wrap gap-2 text-xs">
          {PRODUCTS.map((p) => {
            const on = selected.some((s) => s.id === p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() =>
                  setSelected((prev) => (on ? prev.filter((s) => s.id !== p.id) : [...prev, p]))
                }
                className={`rounded-full border px-2.5 py-1 ${
                  on ? "border-[var(--accent)] text-[var(--accent)]" : "border-slate-300 text-slate-500 dark:border-slate-700"
                }`}
              >
                {p.name}
              </button>
            );
          })}
        </div>
        <div className="space-y-4">
          {selected.map((product) => (
            <div key={product.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <p className="text-sm font-medium">{product.name}</p>
              <p className="mb-2 text-xs text-slate-500">You might also like</p>
              <GenerativeUISurface
                key={product.id}
                id={`recommendations-${product.id}`}
                description={`The "You might also like" row under ${product.name}. Show related products here. Never include ${product.name} itself.`}
              />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Notes · surface <code>sidebar-notes</code>, autoScroll off
        </h2>
        <GenerativeUISurface id="sidebar-notes" autoScroll={false} />
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          errorBoundary.onError
        </h2>
        {errors.length === 0 ? (
          <p className="text-xs text-slate-400">No errors reported.</p>
        ) : (
          <ul className="space-y-1 font-mono text-[11px] text-rose-600">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
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
      { title: "Fill featured", message: "Show the three cheapest products in the featured row." },
      { title: "Recommendations", message: "Fill in the 'You might also like' rows for every product on the page." },
      { title: "Notes", message: "Put a short checklist for furnishing a home office in the notes surface." },
      { title: "Reset featured", message: "Show me the featured products again." },
    ],
    available: "always",
  });

  return (
    <div className="min-h-0 border-l border-slate-200 dark:border-slate-800">
      <CopilotChat agentId={AGENT_ID} className="h-full" />
    </div>
  );
}
