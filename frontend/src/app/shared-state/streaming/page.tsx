import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/shared-state/streaming" />

      <Callout tone="warn" title="Two things are missing, not one">
        <ul className="mt-1 list-disc space-y-1 pl-5 leading-relaxed">
          <li>
            <code>write_document</code> is a <strong>backend</strong> tool, and
            no page shows how to register one against{" "}
            <code>ClaudeAgentAdapter</code>.
          </li>
          <li>
            Even given the tool, <code>stream_document_state</code> takes an{" "}
            <code>anthropic_stream</code> and walks raw{" "}
            <code>content_block_delta</code> events off it. The adapter consumes
            the Anthropic stream internally and never exposes one, so there is
            nothing to pass in.
          </li>
        </ul>
      </Callout>

      <Panel title="What it would demonstrate">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Agent state normally only updates <em>between</em> backend
          checkpoints, so a long tool call lands as one burst at the end. State
          streaming forwards one tool argument into one state key{" "}
          <em>while the argument is still being generated</em>, so a subscribed
          UI re-renders every token. Middleware-backed frameworks express this
          as a declarative mapping; a direct SDK adapter does it by parsing
          partial tool arguments in its own streaming loop, which is what the
          published snippet does.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Write a short essay about why small teams ship faster."]}
            expect="Currently: the canvas stays empty with a LIVE badge, then the whole document appears at once when the turn ends. The subscription works; the streaming does not."
            fail="Nothing in the canvas at all after the turn — that would mean the agent never wrote state, not just that it wrote it late."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/shared-state/streaming/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The canvas"
        description="Neither page publishes a component — they publish the subscription and describe what it drives. This is that, minimally."
      >
        <SourceCode file="frontend/src/app/shared-state/streaming/document-canvas.tsx" />
      </Panel>

      <Panel
        title="The backend half, as published"
        description="Correct code for a backend this integration does not have."
      >
        <SourceCode file="backend/src/agents/doc_reference/state_streaming.py" />
      </Panel>

      <Panel title="What runs instead">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The agent is the Quickstart&apos;s adapter with a prompt telling it to
          write through <code>ag_ui_update_state</code> — the tool the adapter
          ships automatically whenever the run carries state. That gets the
          document into <code>agent.state.document</code> and the canvas renders
          it, which is enough to prove the subscription half. It is not what
          either page is about, so the route stays Broken rather than Partial:
          the whole subject is the token-by-token fill, and one write at the end
          of a turn is the thing state streaming exists to replace.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <Link
            href="/generative-ui/state-rendering"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            State Rendering
          </Link>{" "}
          is the same agent and the same gap, framed as a generative-UI concern
          rather than a shared-state one.
        </p>
      </Panel>
    </>
  );
}
