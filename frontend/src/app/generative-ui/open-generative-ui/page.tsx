import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, Panel } from "@/components/ui";

const DIR = "frontend/src/app/generative-ui/open-generative-ui";

// The page's two frontend snippets as printed (both are fragments, so they
// are shown as text, not compiled).
const MINIMAL = "  // Minimal Open Generative UI frontend: the built-in activity renderer is\n  // registered by CopilotKitProvider, so a plain <CopilotChat /> is enough \u2014\n  // no custom tool renderers, no activity-renderer registration.\n  // We DO pass `openGenerativeUI.designSkill` to swap in visualisation-tuned\n  // guidance in place of the default shadcn design skill.\n  return (\n    <CopilotKit\n      runtimeUrl=\"/api/copilotkit-ogui\"\n      agent=\"open-gen-ui\"\n      openGenerativeUI={{ designSkill: VISUALIZATION_DESIGN_SKILL }}\n    >\n      <div className=\"flex justify-center items-center h-screen w-full\">\n        <div className=\"h-full w-full max-w-4xl flex flex-col p-3\">\n          <Chat />\n        </div>\n      </div>\n    </CopilotKit>\n  );\n";
const ADVANCED = "import React from \"react\";\nimport {\n  CopilotKit,\n  CopilotChat,\n  useConfigureSuggestions,\n} from \"@copilotkit/react-core/v2\";\nimport { openGenUiSandboxFunctions } from \"./sandbox-functions\";\nimport { openGenUiSuggestions } from \"./suggestions\";\n\nexport default function OpenGenUiAdvancedDemo() {\n  return (\n    // Pass the sandbox-function array on the `openGenerativeUI` provider prop.\n    // The built-in `OpenGenerativeUIActivityRenderer` wires these as callable\n    // remotes inside the agent-authored iframe.\n    <CopilotKit\n      runtimeUrl=\"/api/copilotkit-ogui\"\n      agent=\"open-gen-ui-advanced\"\n      openGenerativeUI={{ sandboxFunctions: openGenUiSandboxFunctions }}\n    >\n      <div className=\"flex justify-center items-center h-screen w-full\">\n        <div className=\"h-full w-full max-w-4xl\">\n          <Chat />\n        </div>\n      </div>\n    </CopilotKit>\n";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/open-generative-ui" />

      <Callout tone="warn" title="Broken as published: reference only">
        <p className="leading-relaxed">
          Nothing on this route runs. The Code tab&apos;s two agent modules
          define only a <code>SYSTEM_PROMPT_HINT</code> each; the agent they
          describe (&ldquo;the shared Claude backend in{" "}
          <code>src/agents/agent.py</code>&rdquo;) is never published. The
          runtime imports unpublished helpers, and the frontend snippets are
          fragments that render an undefined <code>Chat</code>. Everything is
          kept as published and nothing is written in its place.
        </p>
      </Callout>

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          One runtime flag, <code>openGenerativeUI.agents</code>, lets an
          agent build HTML, CSS and JS through a{" "}
          <code>generateSandboxedUi</code> tool call. The runtime middleware
          turns that call into activity events, and the provider&apos;s
          built-in renderer draws the result in a sandboxed iframe while it
          streams. The <em>advanced</em> mode also registers two host functions
          the generated page can call back into.
        </p>
      </Panel>

      <Panel title="The frontend snippets, as printed">
        <div className="space-y-4">
          <CodeBlock code={MINIMAL} filename="src/app/demos/open-gen-ui/page.tsx (fragment)" language="tsx" />
          <CodeBlock code={ADVANCED} filename="src/app/demos/open-gen-ui-advanced/page.tsx (fragment)" language="tsx" />
        </div>
      </Panel>

      <Panel title="The Code tab's runtime and sandbox functions — verbatim, not mounted">
        <SourceCodeGroup
          files={[{ file: `${DIR}/_doc/route.ts` }, { file: `${DIR}/_doc/sandbox-functions.ts` }]}
          note="Type-checked only. The unpublished createClaudeHttpAgent and internalRuntimeErrorResponse imports carry @ts-expect-error."
        />
      </Panel>

      <Panel title="The agents, as published">
        <SourceCodeGroup
          files={[
            { file: "backend/src/agents/doc_reference/open_gen_ui_agent.py" },
            { file: "backend/src/agents/doc_reference/open_gen_ui_advanced_agent.py" },
          ]}
          note="Prompt hints only, verbatim and unwired."
        />
      </Panel>

      <Callout tone="warn" title="What the page leaves out">
        <ul className="space-y-1.5">
          <li>· The agent: only two prompt hints are published.</li>
          <li>
            · <code>Chat</code> (both snippets), <code>VISUALIZATION_DESIGN_SKILL</code>{" "}
            (minimal) and <code>./suggestions</code> (advanced) are used but never
            published; the Code tab&apos;s demo page files are not served either.
          </li>
          <li>
            · The runtime&apos;s <code>@/app/api/_shared/claude-http-agent</code>{" "}
            and <code>@/app/api/_shared/route-error</code> are never published.
          </li>
        </ul>
      </Callout>
    </>
  );
}
