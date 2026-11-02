import { z } from "zod";
import {
  createGenerativeUI,
  exportA2UICatalog,
  standardUI,
  type GenerativeUIComponentProps,
} from "@copilotkit/react-core/v2/generative-ui";

import { shopUI } from "./catalog";

/**
 * The page's three follow-on snippets — combining catalogs, positional
 * order, and the A2UI export — assembled into one catalog the demo runs on.
 */

// NOT DOC CODE. The "Combine catalogs" snippet extends `[standardUI, cartUI]`
// and registers a `Hero`, and defines neither. Both are written here,
// minimally, so the snippet runs. `shopUI` is added to `extends` so the
// page's own catalog is reachable from the same provider.
function CartSummary({ count, total }: GenerativeUIComponentProps<typeof cartUI, "CartSummary">) {
  return (
    <div className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">
      {count} item{count === 1 ? "" : "s"} · ${total}
    </div>
  );
}

const cartUI = createGenerativeUI({
  id: "acme/cart@1",
  components: {
    CartSummary: {
      component: CartSummary,
      description: "A one-line cart summary: item count and total price.",
      props: z.object({ count: z.number(), total: z.number() }),
    },
  },
});

function Hero({ title }: { title: string }) {
  return <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>;
}

// NOT DOC CODE. "Positional order" names a `Panel` it never defines.
function Panel({ title, color, children }: GenerativeUIComponentProps<typeof panelUI, "Panel">) {
  return (
    <section
      className="rounded-lg border p-3"
      style={{ borderColor: color ?? "var(--a2ui-color-border-default, #cbd5e1)" }}
    >
      <h4 className="mb-2 font-medium">{title}</h4>
      {children}
    </section>
  );
}

// Positional order — as published.
const panelUI = createGenerativeUI({
  id: "acme/panel@1",
  components: {
    Panel: {
      component: Panel,
      props: z.object({ title: z.string(), color: z.string().optional() }),
      slots: { children: "multiple" },
      parameterOrder: ["title", "children"],
    },
  },
});

// Combine catalogs — as published, plus `shopUI` and `panelUI`.
export const appUI = createGenerativeUI({
  id: "acme/app@1",
  extends: [standardUI, cartUI, shopUI, panelUI],
  components: { Hero: { component: Hero, props: z.object({ title: z.string() }) } },
});

// Export for A2UI tools — the page writes it to disk with `fs`; the demo
// shows it on screen instead, since this module runs in the browser.
export function exportedCatalog() {
  return exportA2UICatalog(appUI, { title: "Acme app" });
}
