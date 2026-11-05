"use client";

import { CopilotChat, useAgentContext, useConfigureSuggestions } from "@copilotkit/react-core/v2";
import {
  useGenerativeUIFunction,
  useGenerativeUIState,
} from "@copilotkit/react-core/v2/generative-ui";
import { useCallback, useMemo, useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

import { ComponentsProvider } from "../../_components/provider";
import { PRODUCTS } from "../../_components/products";
import { shopUI, type Cart } from "../catalog";

const AGENT_ID = "gen-ui-state-actions";

/**
 * A real cart lives in React state on the left. The page's two hooks connect
 * it to whatever the agent renders:
 *
 *   - `useGenerativeUIState` publishes the cart, so every `ProductCard`'s
 *     `inCart` prop is computed by its `bind` selector — not by the agent.
 *   - `useGenerativeUIFunction` implements `addToCart`, so the card's
 *     `onAddToCart` event changes the real cart.
 *
 * `track` and `reload` get handlers too, so a call to either shows up in the
 * log. `PlanButton.onChoose` matches no function, so it goes to the agent as
 * a user message instead.
 */
export default function Page() {
  const cart = useCart();

  return (
    <DemoFrame parentPath="/generative-ui/components/state-and-actions" subtitle={`agent: ${AGENT_ID}`}>
      <ComponentsProvider generativeUI={{ ui: shopUI }}>
        <CartState cart={cart} />
        <CartActions cart={cart} />
        <div className="grid h-full grid-cols-1 lg:grid-cols-[320px_1fr]">
          <CartPanel cart={cart} />
          <Chat />
        </div>
      </ComponentsProvider>
    </DemoFrame>
  );
}

// NOT DOC CODE. The page calls `cart.items` and `cart.addItem` on a `Cart`
// it never defines; this is the smallest store that satisfies both.
function useCart() {
  const [items, setItems] = useState<Cart["items"]>([]);
  const [log, setLog] = useState<string[]>([]);
  const record = useCallback((line: string) => setLog((prev) => [line, ...prev].slice(0, 8)), []);
  const addItem = useCallback((productId: string, quantity: number) => {
    setItems((prev) => {
      const hit = prev.find((i) => i.productId === productId);
      return hit
        ? prev.map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i))
        : [...prev, { productId, quantity }];
    });
  }, []);
  const clear = useCallback(() => setItems([]), []);
  return useMemo(() => ({ items, addItem, clear, log, record }), [items, addItem, clear, log, record]);
}
type CartStore = ReturnType<typeof useCart>;

// As published.
function CartState({ cart }: { cart: CartStore }) {
  useGenerativeUIState(shopUI, "cart", { items: cart.items });
  return null;
}

// As published, plus handlers for the two permission-example functions.
function CartActions({ cart }: { cart: CartStore }) {
  useGenerativeUIFunction(shopUI, "addToCart", ({ productId, quantity }) => {
    cart.addItem(productId, quantity);
    cart.record(`addToCart(${productId}, ${quantity})`);
    return { added: productId };
  });
  useGenerativeUIFunction(shopUI, "track", ({ event }) => {
    cart.record(`track(${event})`);
  });
  useGenerativeUIFunction(shopUI, "reload", () => {
    cart.record("reload()");
  });
  return null;
}

function CartPanel({ cart }: { cart: CartStore }) {
  const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
  return (
    <aside className="min-h-0 space-y-5 overflow-y-auto border-r border-slate-200 p-4 text-sm dark:border-slate-800">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cart (app state)</h2>
          <button type="button" onClick={cart.clear} className="text-xs text-slate-500 underline">
            clear
          </button>
        </div>
        {cart.items.length === 0 ? (
          <p className="mt-2 text-xs text-slate-400">Empty.</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {cart.items.map((i) => (
              <li key={i.productId} className="flex justify-between">
                <span>{byId[i.productId]?.name ?? i.productId}</span>
                <span className="text-slate-500">× {i.quantity}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {PRODUCTS.slice(0, 3).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => cart.addItem(p.id, 1)}
              className="rounded border border-slate-300 px-2 py-0.5 text-xs dark:border-slate-700"
            >
              + {p.name}
            </button>
          ))}
        </div>
        <p className="mt-1 text-[11px] text-slate-400">
          Adding here should update <code>inCart</code> on any rendered card.
        </p>
      </div>
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Function calls</h2>
        {cart.log.length === 0 ? (
          <p className="mt-2 text-xs text-slate-400">None yet.</p>
        ) : (
          <ul className="mt-2 space-y-1 font-mono text-[11px]">
            {cart.log.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

function Chat() {
  // NOT DOC CODE — see `_components/products.ts`.
  useAgentContext({
    description: "The products in the shop. Use their ids as ProductCard productId.",
    value: PRODUCTS,
  });

  useConfigureSuggestions({
    suggestions: [
      { title: "Cards + bind", message: "Show ProductCards for the lamp, the chair and the mug." },
      { title: "Plan event", message: "Show three PlanButtons: starter, team, enterprise." },
      { title: "Writable", message: "Show a CheckoutForm so I can enter my email." },
      {
        title: "@call calc",
        message:
          "Build a seat calculator: a slider for seats (1-50) bound to /seats and a Text showing the monthly price as seats x $29 using calc.",
      },
    ],
    available: "always",
  });

  return <CopilotChat agentId={AGENT_ID} className="h-full min-h-0" />;
}
