import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/frontend-tools" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A tool whose handler executes in the user&apos;s browser. Because it
          runs there, it closes over component state and reaches browser APIs,
          the DOM, and any library the page already loads — which is how an
          agent &quot;reaches into&quot; an app rather than only talking about
          it. The return value goes back as the tool result, so the model can
          reason about whether it worked.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Make the background a warm sunset gradient.",
              "Now make it dark and moody.",
            ]}
            expect="The page background transitions, the printed CSS value updates to match, and the agent confirms in a sentence."
            fail="The agent describes a gradient instead of applying one — it answered in prose rather than calling the tool."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/frontend-tools/demo-chat/page.tsx" />
      </Panel>

      <Panel title="Why no backend change is needed">
        <Callout tone="success">
          <p className="leading-relaxed">
            The page&apos;s backend half is{" "}
            <code>_build_frontend_tools</code>, and it introduces itself with
            &quot;Runs that carry frontend tools use the direct Messages API
            path rather than the Claude Agent SDK.&quot; That is true of the
            reference implementation and not of this one.
          </p>
          <p className="mt-2 leading-relaxed">
            <code>ClaudeAgentAdapter.build_options</code> reads{" "}
            <code>input_data.tools</code>, converts each definition with{" "}
            <code>convert_agui_tool_to_claude_sdk</code>, assembles a{" "}
            <code>create_sdk_mcp_server(&quot;ag_ui&quot;, …)</code> server and
            auto-grants <code>mcp__ag_ui__change_background</code> in{" "}
            <code>allowed_tools</code>. The agent here is the Quickstart&apos;s,
            with <code>&quot;tools&quot;: []</code> — the tool arrives from the
            browser on every run and the adapter does the rest.
          </p>
          <p className="mt-2 leading-relaxed">
            Set <code>LOG_LEVEL=DEBUG</code> in <code>backend/.env</code> to
            watch it happen: the adapter logs &quot;Building dynamic MCP server
            with N frontend tools&quot; on each run.
          </p>
        </Callout>
        <div className="mt-4">
          <SourceCode file="backend/src/agents/doc_reference/frontend_tools.py" />
        </div>
      </Panel>

      <Panel title="Notes">
        <ul className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            The page&apos;s snippet imports <code>Background</code> and{" "}
            <code>DEFAULT_BACKGROUND</code> from a <code>./background</code>{" "}
            module it never publishes, and{" "}
            <code>useFrontendToolsSuggestions</code> from a{" "}
            <code>./suggestions</code> it never publishes either. The gradient
            constant is inlined here; the wrapper component is replaced by the{" "}
            <code>style</code> attribute it evidently was.
          </li>
          <li>
            The same primitive is behind{" "}
            <Link
              href="/generative-ui/tool-based"
              className="text-[var(--accent)] underline underline-offset-4"
            >
              Components as Tools
            </Link>{" "}
            and{" "}
            <Link
              href="/human-in-the-loop"
              className="text-[var(--accent)] underline underline-offset-4"
            >
              Human in the Loop
            </Link>
            . All three work on this integration for the same reason.
          </li>
        </ul>
      </Panel>
    </>
  );
}
