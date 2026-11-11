// Verbatim from https://docs.copilotkit.ai/claude-sdk-python/webmcp, with a
// ts-expect-error directive on the undefined searchOrders call.
import { CopilotKitCore } from "@copilotkit/core";
import { z } from "zod";

export const copilotkit = new CopilotKitCore({
  tools: [
    {
      name: "searchOrders",
      description: "Search the signed-in user's orders by status",
      parameters: z.object({
        status: z.enum(["open", "shipped", "delivered"]),
      }),
      handler: async ({ status }) => {
        // @ts-expect-error verbatim doc code: `searchOrders` is never defined on the page (TS2304); it throws a ReferenceError when the tool is called
        const orders = await searchOrders(status);
        return JSON.stringify(orders);
      },
      webmcp: {
        annotations: {
          readOnlyHint: true,
        },
      },
    },
  ],
});
