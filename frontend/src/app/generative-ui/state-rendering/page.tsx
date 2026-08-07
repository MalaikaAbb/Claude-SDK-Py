import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/state-rendering" />

      <Callout tone="warn" title="Same cell, same gap as State Streaming">
        <p className="leading-relaxed">
          This page and{" "}
          <Link
            href="/shared-state/streaming"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            State Streaming
          </Link>{" "}
          embed the same demo (<code>shared-state-streaming</code>), publish the
          same <code>useAgent</code> subscription, and carry the same
          backend snippet. Only the framing differs — generative UI here, shared
          state there — so both routes exist and share one agent.
        </p>
        <p className="mt-2 leading-relaxed">
          The blockers are the same two: <code>write_document</code> is a
          backend tool with no registration path, and{" "}
          <code>stream_document_state</code> needs a raw Anthropic stream the
          adapter never exposes. The full write-up is on the State Streaming
          route.
        </p>
      </Callout>

      <Panel title="What it would demonstrate">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          UI that reflects agent state in real time, outside the chat: progress
          counters, drafts that fill in as the agent works, dashboards, any
          structured output that does not belong in a message bubble. The
          frontend contract is small — <code>useAgent</code> with{" "}
          <code>OnStateChanged</code> gives you a reactive{" "}
          <code>agent.state</code>, and <code>OnRunStatusChanged</code> gives
          you the LIVE indicator.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Draft a one-paragraph product brief for a habit tracker."]}
            expect="Currently: an empty canvas with a LIVE badge during the turn, then the whole brief at once. The state channel works; the incremental fill does not."
            fail="An empty canvas after the turn finishes — that would mean the state write never happened at all."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/generative-ui/state-rendering/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The backend half, as published"
        description="Identical to the block on the State Streaming page."
      >
        <SourceCode file="backend/src/agents/doc_reference/state_streaming.py" />
      </Panel>
    </>
  );
}
