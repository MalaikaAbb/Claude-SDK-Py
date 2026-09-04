import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { CodeBlock, Callout, Panel, TryIt } from "@/components/ui";

const ZERO_CONFIG = `// The zero-config entry point, also published on the page.
// Called with no arguments, it installs CopilotKit's built-in
// DefaultToolCallRenderer as the "*" wildcard — a tidy status card
// per tool call with no UI of your own.
//
// Without any wildcard, tool calls are invisible: the user only sees
// the assistant's final text summary.
useDefaultRenderTool();`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/tool-rendering" />

      <Callout tone="warn" title="Works through a repo-authored bridge, not doc code">
        <p className="leading-relaxed">
          <code>useRenderTool</code> registers a <em>renderer</em>, not a tool —
          it waits for a tool call named <code>get_weather</code> to come back
          from the agent. <code>get_weather</code> is a <strong>backend</strong>{" "}
          tool, and no page in the framework shows how to register a backend
          tool against <code>ClaudeAgentAdapter</code>. This repo closes that
          gap itself: <code>backend/src/agents/weather_mcp_server.py</code>{" "}
          wraps the published schema and handler in an in-process MCP server
          (<code>tool()</code> + <code>create_sdk_mcp_server()</code>) and the
          registry passes it to the adapter via <code>mcp_servers</code> /{" "}
          <code>allowed_tools</code>. That bridge is this repo&apos;s, so the
          route is marked partial. See README §9.1.
        </p>
      </Callout>

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          One renderer per tool name, plus a wildcard for everything else. Each
          renderer receives the tool&apos;s parsed arguments, a live{" "}
          <code>status</code>, and — once the agent returns — the{" "}
          <code>result</code>, so it can draw a loading state from the arguments
          alone and fill in the data when it lands.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["What's the weather in San Francisco?"]}
            expect="A WeatherCard appears in the chat, first in its loading state from the parsed location, then filled with 68°, 55% humidity, 10 wind and Sunny once the result lands, followed by a one-sentence summary."
            fail="A prose-only answer with no card means the bridge is not reaching Claude — check the backend log for the weather MCP server, or that the tool name arrived without its mcp__weather__ prefix."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/generative-ui/tool-rendering/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The backend half, as published — and the bridge that carries it"
        description="The doc's schema and handler, verbatim, followed by the repo-authored MCP server that puts them in front of Claude."
      >
        <SourceCodeGroup
          files={[
            { file: "backend/src/agents/doc_reference/tool_rendering.py" },
            { file: "backend/src/agents/weather_mcp_server.py" },
          ]}
        />
        <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The schema&apos;s own comment says it is &quot;passed via the{" "}
          <code>tools</code> parameter on{" "}
          <code>client.messages.create(...)</code> /{" "}
          <code>.stream(...)</code>&quot; — the raw Anthropic Messages API,
          which is a different backend from the{" "}
          <code>ClaudeAgentAdapter</code> the Quickstart builds. That loop is
          never published in full, so the bridge above is the repo&apos;s own:
          the SDK&apos;s <code>tool()</code> accepts the JSON schema as-is and
          the adapter merges the server with its <code>ag_ui</code> one. See{" "}
          <Link
            href="/quickstart"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Quickstart
          </Link>{" "}
          for the bridge that would join the two, and the six helpers it is
          missing.
        </p>
      </Panel>

      <Panel
        title="Zero-config rendering"
        description="Published on the page and not used by the demo, which registers its own catch-all instead."
      >
        <CodeBlock code={ZERO_CONFIG} language="tsx" />
      </Panel>

      <Panel
        title="The two renderer components"
        description="Both are called by the page and published by neither. Written here from their call signatures."
      >
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/generative-ui/tool-rendering/weather-card.tsx" },
            { file: "frontend/src/app/generative-ui/tool-rendering/catchall-renderer.tsx" },
          ]}
        />
      </Panel>

      <Panel title="Doc-vs-implementation notes">
        <ul className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            The page names four tools —{" "}
            <code>get_weather</code>, <code>search_flights</code>,{" "}
            <code>get_stock_price</code>, <code>roll_dice</code> — and publishes
            a backend definition for one. It imports{" "}
            <code>FlightListCard</code>, <code>StockCard</code>,{" "}
            <code>D20Card</code> and a <code>Flight</code> type, none of which
            appear anywhere. This route implements the two renderers whose
            components could be reconstructed and drops the rest rather than
            inventing four cards for tools that cannot fire.
          </li>
          <li>
            Its two long snippets are the same file cut at different points —
            the second is the first plus the <code>search_flights</code>{" "}
            renderer. Read as separate examples they look duplicated; they are
            one file shown twice.
          </li>
          <li>
            <code>parseJsonResult</code> is imported from{" "}
            <code>../_shared/parse-json-result</code> and never published. It is
            written inline in the demo here — a <code>JSON.parse</code> with a
            try/catch, which is all its call sites need.
          </li>
          <li>
            Worth keeping in view:{" "}
            <Link
              href="/generative-ui/tool-based"
              className="text-[var(--accent)] underline underline-offset-4"
            >
              Components as Tools
            </Link>{" "}
            does work, because there the component <em>is</em> the tool and it
            is registered from the browser. The difference between the two
            routes is entirely which side owns the tool.
          </li>
        </ul>
      </Panel>
    </>
  );
}
