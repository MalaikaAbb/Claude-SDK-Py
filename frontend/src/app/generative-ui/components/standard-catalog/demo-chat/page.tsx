"use client";

import { CopilotChat, useConfigureSuggestions } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import { ComponentsProvider } from "../../_components/provider";
import { appUI } from "../catalog";

const AGENT_ID = "gen-ui-standard-catalog";

/**
 * The standard catalog, customised three ways. Each suggestion tests one:
 *
 *   - extend   — `ProductCard` is an app component next to the 66 built-ins.
 *   - override — every `Card` the agent draws is `MyCard` (rounded-2xl).
 *   - omit     — `Map` is gone, so a map request must fall back to
 *                something else rather than render a map.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/generative-ui/components/standard-catalog" subtitle={`agent: ${AGENT_ID}`}>
      <ComponentsProvider generativeUI={{ ui: appUI }}>
        <Chat />
      </ComponentsProvider>
    </DemoFrame>
  );
}

function Chat() {
  useConfigureSuggestions({
    suggestions: [
      { title: "Tabs", message: "Show three tabs — Overview, Pricing, FAQ — each with a sentence of text." },
      { title: "Chart", message: "Show a line chart of daily active users for a week, made-up numbers." },
      { title: "Card (override)", message: "Put a short welcome message inside a Card." },
      { title: "ProductCard (extend)", message: "Show a ProductCard for a $49 'Canvas Tote'." },
      { title: "Map (omitted)", message: "Show me a map of Paris." },
      { title: "Form", message: "Build a sign-up form with a name, an email, a plan select and a submit button." },
    ],
    available: "always",
  });

  return <CopilotChat agentId={AGENT_ID} className="h-full" />;
}
