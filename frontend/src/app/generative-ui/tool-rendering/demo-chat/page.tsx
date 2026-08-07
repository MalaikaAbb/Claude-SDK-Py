"use client";

import {
  CopilotChat,
  useConfigureSuggestions,
  useDefaultRenderTool,
  useRenderTool,
} from "@copilotkit/react-core/v2";
import { z } from "zod";

import { DemoFrame } from "@/components/demo-frame";

import {
  CustomCatchallRenderer,
  type CatchallToolStatus,
} from "../catchall-renderer";
import { WeatherCard } from "../weather-card";

const AGENT_ID = "tool-rendering";

interface WeatherResult {
  city?: string;
  temperature?: number;
  humidity?: number;
  wind_speed?: number;
  conditions?: string;
}

/** The page's helper for tool results that arrive as a JSON string. */
function parseJsonResult<T>(result: unknown): Partial<T> {
  if (!result) return {};
  if (typeof result === "object") return result as Partial<T>;
  if (typeof result !== "string") return {};
  try {
    return JSON.parse(result) as Partial<T>;
  } catch {
    return {};
  }
}

/**
 * The renderers are live; nothing calls them.
 *
 * `useRenderTool` and `useDefaultRenderTool` register *renderers* — they do not
 * register tools. They wait for a tool call named `get_weather` to arrive from
 * the agent, and on this integration one never will: `get_weather` is a backend
 * tool, and the docs publish no way to register a backend tool against
 * ClaudeAgentAdapter. See the notes page.
 *
 * Everything below is the doc's, minus the two renderers whose backends the
 * page never defines at all (`get_stock_price`, `roll_dice`) and the
 * `search_flights` renderer, whose card the page also never publishes.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/generative-ui/tool-rendering" subtitle={`agent: ${AGENT_ID}`}>
      <Chat />
    </DemoFrame>
  );
}

function Chat() {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "Ask for weather",
        message: "What's the weather in San Francisco?",
      },
    ],
    available: "always",
  });

  // Per-tool renderer #1: get_weather → branded WeatherCard.
  useRenderTool(
    {
      name: "get_weather",
      parameters: z.object({
        location: z.string(),
      }),
      render: ({ parameters, result, status }) => {
        const loading = status !== "complete";
        const parsed = parseJsonResult<WeatherResult>(result);
        return (
          <WeatherCard
            loading={loading}
            location={parameters?.location ?? parsed.city ?? ""}
            temperature={parsed.temperature}
            humidity={parsed.humidity}
            windSpeed={parsed.wind_speed}
            conditions={parsed.conditions}
          />
        );
      },
    },
    [],
  );

  // Wildcard catch-all for anything that doesn't match a per-tool
  // renderer above.
  useDefaultRenderTool(
    {
      render: ({ name, parameters, status, result }) => (
        <CustomCatchallRenderer
          name={name}
          parameters={parameters}
          status={status as CatchallToolStatus}
          result={result}
        />
      ),
    },
    [],
  );

  return <CopilotChat agentId={AGENT_ID} className="h-full" />;
}
