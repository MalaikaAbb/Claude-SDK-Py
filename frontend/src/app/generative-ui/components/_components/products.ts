/**
 * NOT DOC CODE. The shop pages render products the agent is told to "copy
 * every value from a product of a tool result", but no page publishes the
 * tool or the data. This list is what the demos publish to the agent with
 * `useAgentContext` instead, so there is something real to copy.
 */
export type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
};

export const PRODUCTS: Product[] = [
  { id: "p-lamp", name: "Arc Desk Lamp", price: 89, imageUrl: "https://picsum.photos/seed/lamp/240/160" },
  { id: "p-chair", name: "Oak Lounge Chair", price: 349, imageUrl: "https://picsum.photos/seed/chair/240/160" },
  { id: "p-mug", name: "Stoneware Mug", price: 24, imageUrl: "https://picsum.photos/seed/mug/240/160" },
  { id: "p-rug", name: "Wool Runner Rug", price: 159, imageUrl: "https://picsum.photos/seed/rug/240/160" },
  { id: "p-clock", name: "Brass Wall Clock", price: 72, imageUrl: "https://picsum.photos/seed/clock/240/160" },
  { id: "p-vase", name: "Glass Bud Vase", price: 18, imageUrl: "https://picsum.photos/seed/vase/240/160" },
];
