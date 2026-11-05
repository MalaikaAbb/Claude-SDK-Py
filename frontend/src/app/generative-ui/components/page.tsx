import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

const SUB_PAGES = [
  ["/generative-ui/components/surfaces", "Surfaces", "named places on the page the agent can render into"],
  ["/generative-ui/components/catalogs", "Catalogs", "your own components, typed with a schema"],
  ["/generative-ui/components/standard-catalog", "Standard catalog", "extending, trimming and overriding the 69 built-ins"],
  ["/generative-ui/components/state-and-actions", "State and actions", "app state, renderer functions, events, writable props"],
  ["/generative-ui/components/theming", "Theming", "the --a2ui-* variables and dark mode"],
  ["/generative-ui/components/transports", "Transports", "tool vs markdown, and scoping by agent"],
  ["/generative-ui/components/markdown-mode", "Markdown mode", "UI written as a2ui fences inside the reply"],
] as const;

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/components" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The newest generative-UI layer, marked Experimental on the doc and
          built on A2UI 1.0. One provider prop — a catalog of components —
          lets the agent answer with interactive UI instead of text. Unlike{" "}
          <Link
            href="/generative-ui/tool-based"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Components as Tools
          </Link>
          , there is no tool per component: the runtime hands the agent a single{" "}
          <code>render_ui</code> tool and the catalog, and the agent composes
          a tree out of it.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Compare the Starter, Team, and Enterprise plans in a table"]}
            expect="A real table (rows and columns, not markdown pipes) renders inside the chat, built from the standard catalog's Table components, with a short line of text around it."
            fail="A markdown table or a bulleted list — the agent never called render_ui. A red one-line error in the message means an operation was rejected by the runtime's validation."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/generative-ui/components/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The runtime"
        description="The page's runtime route, pointed at this repo's Python agents instead of the page's TanStack/OpenAI sample agent."
      >
        <SourceCode file="frontend/src/app/api/copilotkit-components/[[...slug]]/route.ts" />
      </Panel>

      <Panel
        title="The agent"
        description="The page's own system prompt. The catalog and the render_ui tool arrive per run; nothing component-specific lives in the backend."
      >
        <SourceCode file="backend/src/agents/prompts.py" region="components-prompt" />
      </Panel>

      <Panel title="Sub-pages">
        <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
          {SUB_PAGES.map(([href, title, blurb]) => (
            <li key={href}>
              <Link href={href} className="font-medium text-[var(--accent)] underline underline-offset-4">
                {title}
              </Link>{" "}
              — {blurb}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Notes">
        <ul className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            The page&apos;s backend is a framework-neutral TypeScript sample — a{" "}
            <code>BuiltInAgent</code> over <code>@tanstack/ai</code> and{" "}
            <code>openaiText(&quot;gpt-5.5&quot;)</code>. Nothing on it is
            specific to the Claude Agent SDK. This repo keeps the runtime half
            and swaps the agent for <code>ClaudeAgentAdapter</code> over AG-UI,
            the same way every other route here does.
          </li>
          <li>
            The page says the backend must hand the model both the run&apos;s{" "}
            <code>tools</code> (which carry <code>render_ui</code>) and its{" "}
            <code>systemPrompts</code>. The adapter forwards browser-supplied
            tools and context on its own, so that requirement is met without
            any backend code — whether <code>render_ui</code> arriving that way
            behaves like a real frontend tool is exactly what this route tests.
          </li>
          <li>
            Inspector: open it and pick <em>Generative UI</em> for the Catalog,
            Surfaces and Prompt tabs the page describes.
          </li>
        </ul>
        <div className="mt-4">
          <Callout tone="warn" title="Experimental">
            The doc labels this whole section Experimental and pins it to A2UI
            1.0 at spec revision <code>cbaa5ee</code>. Expect the API to move.
          </Callout>
        </div>
      </Panel>
    </>
  );
}
