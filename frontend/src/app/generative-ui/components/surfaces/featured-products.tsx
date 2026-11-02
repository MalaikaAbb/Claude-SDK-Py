"use client";

import { GenerativeUISurface } from "@copilotkit/react-core/v2/generative-ui";

import type { Product } from "../_components/products";
import { shopUI } from "../catalogs/catalog";

// The page's `app/page.tsx`, as published. `Product` and `ProductRow` are
// used there and never defined — both are supplied below.

export function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <GenerativeUISurface
      id="featured"
      ui={shopUI}
      description="The Featured Products row of the home page. When the customer asks to see products here, show them as a ProductGrid with one ProductCard for each product. When they ask for the featured products again, delete this surface."
      components={["ProductGrid", "ProductCard"]}
      fallback={<ProductRow products={products} />}
    />
  );
}

// NOT DOC CODE. The static row the surface shows until the agent renders into
// it, and again after the agent deletes the surface.
function ProductRow({ products }: { products: Product[] }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {products.map((p) => (
        <div
          key={p.id}
          className="w-36 shrink-0 rounded-md border border-dashed border-slate-300 p-2 text-xs dark:border-slate-700"
        >
          <p className="font-medium">{p.name}</p>
          <p className="text-slate-500">${p.price}</p>
        </div>
      ))}
    </div>
  );
}
