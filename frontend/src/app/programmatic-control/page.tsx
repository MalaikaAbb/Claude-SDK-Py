import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { CodeBlock, Callout, Panel, TryIt } from "@/components/ui";

const MISSING = `<!-- snippet skipped: region 'headless-promise-primitives'
     missing in claude-sdk-python::interrupt-headless -->`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/programmatic-control" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Driving a run from code rather than a composer — a button, a form, a
          cron job, a keyboard shortcut. Three primitives cover every trigger:
        </p>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            <code>agent.addMessage(...)</code> appends to the conversation
            without running anything.
          </li>
          <li>
            <code>copilotkit.runAgent(&#123; agent &#125;)</code> is the same
            entry point <code>&lt;CopilotChat /&gt;</code> calls internally —
            it orchestrates frontend tools, follow-up runs and the subscriber
            lifecycle. Prefer it over the lower-level{" "}
            <code>agent.runAgent(options)</code>, which does none of that.
          </li>
          <li>
            <code>agent.subscribe(subscriber)</code> returns{" "}
            <code>&#123; unsubscribe &#125;</code> and takes every AG-UI
            lifecycle callback.
          </li>
        </ul>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Click 'Ask for a fact'.",
              "Click 'Ask for something long', then Stop mid-stream.",
            ]}
            expect="The reply pane fills with no chat component on the page, and the right column logs onRunStartedEvent then onRunFinalized. Stop cuts the run short and still finalizes."
            fail="Buttons do nothing and the log stays empty — the run never left the browser."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/programmatic-control/demo-chat/page.tsx" />
      </Panel>

      {/* <Panel title="Why this route is Partial, not Working">
        <Callout tone="warn" title="The page's second half is a build placeholder">
          <p className="leading-relaxed">
            This framework&apos;s interrupt pattern is promise-based, so the
            page selects its &quot;Resolving a frontend tool call from a
            button&quot; branch. Where the snippet should be, the published
            markdown contains this:
          </p>
          <div className="mt-3">
            <CodeBlock code={MISSING} language="text" />
          </div>
          <p className="mt-3 leading-relaxed">
            The surrounding prose describes what it would show — a{" "}
            <code>useFrontendTool</code> whose handler stages its{" "}
            <code>resolve</code> callback in React state so a button grid
            outside the chat can settle the Promise — and then refers to
            &quot;the resulting <code>&#123; pending, resolveActive &#125;</code>{" "}
            pair&quot; that nothing on the page produces. This route implements
            the three primitives it does publish and leaves that section alone.
          </p>
        </Callout>
      </Panel>

      <Panel title="Doc-vs-implementation notes">
        <ul className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            The page&apos;s long &quot;Resolving a LangGraph interrupt from a
            button&quot; block is published in full and is LangGraph-only —{" "}
            <code>on_interrupt</code> custom events and{" "}
            <code>forwardedProps.command.resume</code>. It is gated behind a
            flag this framework does not have, and the runtime has no{" "}
            <code>interrupt()</code> primitive to raise the event. Not
            implemented here for that reason. For pause-and-ask on this
            framework, use{" "}
            <Link
              href="/human-in-the-loop"
              className="text-[var(--accent)] underline underline-offset-4"
            >
              Human in the Loop
            </Link>{" "}
            — which the page itself recommends in its third branch.
          </li>
          <li>
            The <code>headless-complete</code> block references{" "}
            <code>useAttachmentsConfig</code>, <code>useAutoScroll</code>,{" "}
            <code>buildContent</code>, <code>createMessageId</code> and an{" "}
            <code>agentId</code> binding, none of which are published. Its{" "}
            <code>handleReset</code> also calls <code>agent.abortRun()</code>,
            a fourth primitive the page&apos;s own list of three omits.
          </li>
          <li>
            The page notes a <code>connectAgent</code> effect &quot;at the
            top&quot; that opens the backend session on mount so the first{" "}
            <code>runAgent</code> does not race the handshake. That effect is
            not in any published block, so this route does not have it — if the
            very first click ever misses, that is the reason.
          </li>
        </ul>
      </Panel> */}
    </>
  );
}
