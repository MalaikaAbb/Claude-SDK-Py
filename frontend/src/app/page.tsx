import Link from "next/link";

import { Callout, KeyValue, Panel } from "@/components/ui";
import { ALL_ROUTES, DOCS_ROOT, DOC_SYNC_DATE } from "@/lib/nav-config";

const COUNT = (status: string) =>
  ALL_ROUTES.filter((r) => r.status === status).length;

export default function Page() {
  return (
    <>
      <header className="border-b border-slate-200 pb-5 dark:border-slate-800">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          CopilotKit + Claude Agent SDK (Python)
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
          A test harness for the Claude Agent SDK integration. Every doc page
          under{" "}
          <a
            href={DOCS_ROOT}
            target="_blank"
            rel="noreferrer"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            docs.copilotkit.ai/claude-sdk-python
          </a>{" "}
          that this repo tracks is a route here, and each route runs the thing
          its page teaches rather than describing it — or reports, precisely,
          why it cannot.
        </p>
      </header>

      <Panel title="What this is">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Twenty-six doc pages, twenty-five agents, one Python process. Each
          route pairs a live surface with the repo code behind it and a link to
          the page it is testing, so the two can be diffed on the spot.
        </p>
        <div className="mt-4">
          <KeyValue
            rows={[
              [
                "Docs tracked",
                <a
                  key="d"
                  href={DOCS_ROOT}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--accent)] underline underline-offset-4"
                >
                  {DOCS_ROOT}
                </a>,
              ],
              ["Last synced", DOC_SYNC_DATE],
              ["Backend", "Python · FastAPI · ClaudeAgentAdapter (ag-ui-claude-sdk)"],
              [
                "Route status",
                `${COUNT("working")} working · ${COUNT("partial")} partial · ${COUNT("broken")} broken · ${COUNT("reference")} reference`,
              ],
            ]}
          />
        </div>
      </Panel>

      <Panel title="How a message travels">
        <ol className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <li>
            <strong>1.</strong> A chat component posts to{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-slate-800">
              /api/copilotkit
            </code>{" "}
            in this Next app.
          </li>
          <li>
            <strong>2.</strong> The Copilot Runtime resolves the agent id and
            forwards the run over AG-UI to{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-slate-800">
              localhost:8000/&#123;agent_id&#125;
            </code>
            .
          </li>
          <li>
            <strong>3.</strong> The FastAPI server hands the run input to that
            agent&apos;s <code>ClaudeAgentAdapter</code>, which drives the Claude
            Agent SDK — spawning its CLI subprocess and calling Anthropic.
          </li>
          <li>
            <strong>4.</strong> AG-UI events stream back as SSE. Browser-executed
            tools run here, and their results go back so the run can continue.
          </li>
        </ol>
      </Panel>

      <Panel title="Where the docs run out">
        <Callout tone="warn" title="Five routes are Broken, for one shared reason">
          <p className="leading-relaxed">
            The Quickstart&apos;s <code>main.py</code> is the only complete
            backend the framework publishes, and it builds a{" "}
            <code>ClaudeAgentAdapter</code> with <code>&quot;tools&quot;: []</code>.
            Five doc pages then publish a <em>backend</em> tool — an Anthropic
            schema plus a Python handler — and no page shows how to register one
            against that adapter.
          </p>
          <p className="mt-2 leading-relaxed">
            The Quickstart&apos;s{" "}
            <code>run_with_claude_agent_sdk</code> bridge looks like the missing
            link, but it opens by calling six helpers it never defines
            (<code>_build_sdk_tools</code>, <code>_set_state</code>,{" "}
            <code>_normalize_claude_agent_sdk_model</code>,{" "}
            <code>_with_initial_state</code>, and two constants). This repo
            ships that code as published rather than inventing the missing half;
            you can read all of it under{" "}
            <code>backend/src/agents/doc_reference/</code>, and each affected
            route explains its own case.
          </p>
        </Callout>
        <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Worth knowing before you read those pages: <code>ClaudeAgentAdapter</code>{" "}
          already does more than the docs credit it with. It builds its own MCP
          server from <em>frontend</em> tools on every run, ships an{" "}
          <code>ag_ui_update_state</code> tool whenever the run carries state,
          folds AG-UI context into the system prompt, and emits{" "}
          <code>REASONING_MESSAGE_*</code> from Claude&apos;s thinking blocks.
          That is why the other twenty-one routes work without any of the
          hand-rolled Messages API code those pages show.
        </p>
      </Panel>

      <Panel title="Start here">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Sidebar dot colours mirror status: green working, amber partial, red
          broken, grey reference. The{" "}
          <Link
            href="/status"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            status overview
          </Link>{" "}
          lists every route in one table, and{" "}
          <Link
            href="/quickstart"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Quickstart
          </Link>{" "}
          is the shortest path to confirming the two processes are talking.
        </p>
      </Panel>
    </>
  );
}
