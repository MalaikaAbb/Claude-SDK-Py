"use client";

import { CopilotChat, useComponent, useConfigureSuggestions } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import { BarChart, barChartPropsSchema } from "../bar-chart";

const AGENT_ID = "gen-ui-tool-based";

/**
 * `useComponent` registers a React component as a tool.
 *
 * There is no handler and no backend definition — that is the whole point of
 * this variant. The runtime exposes `render_bar_chart` as a frontend tool,
 * ClaudeAgentAdapter forwards it to Claude on every run, and when Claude calls
 * it CopilotKit paints the component with the arguments as props.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/generative-ui/tool-based" subtitle={`agent: ${AGENT_ID}`}>
      <Chat />
    </DemoFrame>
  );
}

function Chat() {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "Chart some revenue",
        message:
          "Chart quarterly revenue for last year: Q1 120, Q2 145, Q3 138, Q4 190.",
      },
      {
        title: "Invent a dataset",
        message: "Make up monthly signups for a startup's first six months and chart them.",
      },
    ],
    available: "always",
  });

  useComponent({
    name: "render_bar_chart",
    description: "Display a bar chart with labeled numeric values.",
    parameters: barChartPropsSchema,
    render: BarChart,
  });

  return <CopilotChat agentId={AGENT_ID} className="h-full" />;
}
