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

      <Callout tone="warn" title="This route does not work, and the reason is upstream">
        <p className="leading-relaxed">
          Everything on the frontend is wired and correct. The problem is that{" "}
          <code>useRenderTool</code> registers a <em>renderer</em>, not a tool —
          it waits for a tool call named <code>get_weather</code> to come back
          from the agent. On this integration one never will.{" "}
          <code>get_weather</code> is a <strong>backend</strong> tool, and no
          page in the framework shows how to register a backend tool against{" "}
          <code>ClaudeAgentAdapter</code>. Ask for weather and Claude answers in
          prose; no card is drawn.
        </p>
      </Callout>

      <Panel title="What it would demonstrate">
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
            expect="Currently: a prose reply that opens by saying it has no weather tool to call. That is this route passing — it is reporting the gap, not hiding it."
            fail="A WeatherCard would mean the backend tool bridge landed upstream and this route's status should be raised to Working."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/generative-ui/tool-rendering/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The backend half, as published"
        description="A schema and a handler, with nothing to carry either to the model."
      >
        <SourceCode file="backend/src/agents/doc_reference/tool_rendering.py" />
        <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The schema&apos;s own comment says it is &quot;passed via the{" "}
          <code>tools</code> parameter on{" "}
          <code>client.messages.create(...)</code> /{" "}
          <code>.stream(...)</code>&quot; — the raw Anthropic Messages API,
          which is a different backend from the{" "}
          <code>ClaudeAgentAdapter</code> the Quickstart builds. That loop is
          never published in full, so there is no second server to drop this
          into either. See{" "}
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
