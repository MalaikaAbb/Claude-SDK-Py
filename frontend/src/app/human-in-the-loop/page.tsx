import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/human-in-the-loop" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The agent pausing mid-run to ask the user something, then resuming
          with the answer folded into its context.{" "}
          <code>useHumanInTheLoop</code> registers a client-side tool whose
          handler is a Promise: the LLM calls it, CopilotKit routes the call
          through your <code>render</code> function, and the run stays suspended
          until <code>respond</code> is called.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Please book an intro call with the sales team to discuss pricing.",
              "Schedule a 1:1 with Alice next week to review Q2 goals.",
            ]}
            expect="A four-slot picker appears inline in the chat and the run visibly pauses. Picking a slot swaps the card for a confirmation and the agent's next message references the time you chose."
            fail="The agent invents a time without asking, or the picker appears and choosing a slot does nothing — the latter means respond never fired."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/human-in-the-loop/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The picker"
        description="Imported by the page for its TimeSlot type and its five props, and published nowhere. Written here from those."
      >
        <SourceCode file="frontend/src/app/human-in-the-loop/time-picker-card.tsx" />
      </Panel>

      <Panel title="Doc-vs-implementation notes">
        <Callout tone="warn" title="`render: ({ args, status, respond }: any)`">
          <p className="leading-relaxed">
            The published snippet annotates its render callback{" "}
            <code>any</code>, which hides a real rough edge:{" "}
            <code>useHumanInTheLoop</code> does not infer its argument type from{" "}
            <code>parameters</code> the way <code>useRenderTool</code> does. Left
            alone it falls back to <code>Record&lt;string, unknown&gt;</code> and{" "}
            <code>args.topic</code> is <code>unknown</code>, unusable in JSX.
            This route supplies the generic explicitly —{" "}
            <code>useHumanInTheLoop&lt;&#123; topic: string; attendee: string &#125;&gt;</code>{" "}
            — which types the callback properly instead of silencing it.
          </p>
        </Callout>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            Both of the page&apos;s long snippets are the same file cut at
            different points — the second is the top half of the first. The slot
            builders are published; the component they feed is not.
          </li>
          <li>
            The page&apos;s comparison table and its whole &quot;Pattern 2&quot;
            section are about <code>useInterrupt</code>, which needs a
            server-side <code>langgraph.interrupt()</code> call. There is no
            LangGraph here, so that pattern does not apply — the page says as
            much in its own table, then links to a{" "}
            <code>/claude-sdk-python/human-in-the-loop/useInterrupt</code> deep
            dive anyway.
          </li>
          <li>
            It also links to a <code>/human-in-the-loop/headless</code> guide
            for driving resolution from custom UI. The Programmatic Control page
            covers the same ground for this framework, and reports its own
            snippet as missing.
          </li>
        </ul>
      </Panel>

      <Panel title="Why it works here">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <code>book_call</code> is a frontend tool, so it travels in{" "}
          <code>input_data.tools</code> and the adapter builds it into its{" "}
          <code>ag_ui</code> MCP server automatically. The agent behind this
          route is the Quickstart&apos;s with{" "}
          <code>&quot;tools&quot;: []</code>; no backend code is involved in the
          pause at all.
        </p>
      </Panel>
    </>
  );
}
