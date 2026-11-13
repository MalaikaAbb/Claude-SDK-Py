import { useState } from "react";
import { z } from "zod";
import {
  createGenerativeUI,
  type GenerativeUIComponentProps,
} from "@copilotkit/react-core/v2/generative-ui";

/**
 * The page publishes `shopUI` twice — once with `state` + `bind`, once with
 * `functions` + `events` — plus `writable` and the function-permission and
 * agent-event fragments. They are merged here into one catalog, every key as
 * published, so the demo can show them working together.
 */

// State — as published.
const cartSchema = z.object({
  items: z.array(z.object({ productId: z.string(), quantity: z.number() })),
});

export type Cart = z.infer<typeof cartSchema>;

// The page's ProductCard (events version), plus the `inCart` prop its state
// version binds — rendered so the binding is visible.
function ProductCard({ productId, name, inCart, onAddToCart }: GenerativeUIComponentProps<typeof shopUI, "ProductCard">) {
  const [error, setError] = useState<string>();
  return (
    <article className="rounded-md border border-slate-300 p-3 dark:border-slate-700">
      <h4 className="font-medium">{name}</h4>
      <p className="text-xs text-slate-500">in cart: {inCart}</p>
      <button
        className="mt-2 rounded bg-[var(--accent)] px-2.5 py-1 text-xs text-white"
        onClick={async () => {
          const result = await onAddToCart?.({ productId });
          if (result) setError(result.ok ? undefined : result.error.message);
        }}
      >
        Add to cart
      </button>
      {error ? <p role="alert">{error}</p> : null}
    </article>
  );
}

// NOT DOC CODE. "Events sent to the agent" gives `onChoose` and no component.
function PlanButton({ plan, onChoose }: GenerativeUIComponentProps<typeof shopUI, "PlanButton">) {
  return (
    <button
      className="rounded border border-[var(--accent)] px-3 py-1.5 text-sm text-[var(--accent)]"
      onClick={() => onChoose?.({ plan })}
    >
      Choose {plan}
    </button>
  );
}

// Writable props — as published.
function CheckoutForm({ email, setEmail }: GenerativeUIComponentProps<typeof shopUI, "CheckoutForm">) {
  return <input value={email ?? ""} onChange={(event) => setEmail(event.target.value)} />;
}

export const shopUI = createGenerativeUI({
  id: "acme/shop@1",
  state: { cart: cartSchema },
  functions: {
    // Function permissions — as published. `addToCart` keeps the first
    // snippet's description and default quantity.
    addToCart: {
      description: "Add a product to the cart",
      parameters: z.object({ productId: z.string(), quantity: z.number().default(1) }),
      allowedCallers: "rendererOrAgent",
      returnType: "object",
    },
    track: { parameters: z.object({ event: z.string() }), returnType: "void" },
    reload: { parameters: z.object({}), allowedCallers: "agentOnly" },
  },
  components: {
    ProductCard: {
      component: ProductCard,
      props: z.object({ productId: z.string(), name: z.string(), inCart: z.number() }),
      bind: {
        inCart: (state, { productId }) =>
          state.cart.items.find((item) => item.productId === productId)?.quantity ?? 0,
      },
      events: { onAddToCart: {} },
    },
    PlanButton: {
      component: PlanButton,
      description: "A button that lets the user pick a plan.",
      props: z.object({ plan: z.string() }),
      // Events sent to the agent — as published. No `choose` function exists,
      // so this one is forwarded to the agent as a user message.
      events: {
        onChoose: {
          description: "The user picked a plan",
          parameters: z.object({ plan: z.string() }),
        },
      },
    },
    CheckoutForm: {
      component: CheckoutForm,
      description: "An email field for checkout.",
      props: z.object({ email: z.string().optional() }),
      writable: ["email"],
    },
  },
});
