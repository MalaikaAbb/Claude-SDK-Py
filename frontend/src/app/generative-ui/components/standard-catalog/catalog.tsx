import { z } from "zod";
import {
  createGenerativeUI,
  standardUI,
  type GenerativeUIComponentProps,
} from "@copilotkit/react-core/v2/generative-ui";

/**
 * The page's three snippets — extend, omit, override — folded into one
 * catalog. Each part is as published; they are combined only so a single
 * provider can exercise all three at once.
 */

// "Override a component" — as published.
function MyCard({ children }: GenerativeUIComponentProps<typeof standardUI, "Card">) {
  return <div className="rounded-2xl border p-6 shadow-sm">{children}</div>;
}

// NOT DOC CODE. "Add your own components" registers `ProductCard` with a
// `productSchema` and defines neither.
const productSchema = z.object({ name: z.string(), price: z.number() });

function ProductCard({ name, price }: z.infer<typeof productSchema>) {
  return (
    <article className="rounded-md border border-dashed border-amber-500 px-3 py-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">ProductCard (app)</p>
      <p className="font-medium">{name}</p>
      <p className="text-sm">${price}</p>
    </article>
  );
}

export const appUI = createGenerativeUI({
  id: "acme/app@1",
  // "Remove components" — as published.
  extends: [standardUI.omit(["Map", "Video", "HtmlView"])],
  overrides: { Card: { component: MyCard } },
  components: {
    ProductCard: { component: ProductCard, props: productSchema },
  },
});
