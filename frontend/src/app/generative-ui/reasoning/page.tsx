import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/reasoning" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The <code>messageView.reasoningMessage</code> slot handed a whole
          component instead of a sub-slot object. The component receives the{" "}
          <code>ReasoningMessage</code>, the full <code>messages</code> list and{" "}
          <code>isRunning</code> — enough to work out both whether this block is
          still streaming and whether it is the trailing message.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Compare with{" "}
          <Link
            href="/custom-look-and-feel/reasoning-messages"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Reasoning Messages
          </Link>
          , which keeps CopilotKit&apos;s card and replaces two of its parts.
          Here nothing of the default survives: no chevron, no collapse, no
          &quot;Thought for X seconds&quot;.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Three boxes are labelled apples, oranges, and mixed. Every label is wrong. How many fruit must you draw to fix all three?",
            ]}
            expect="An amber-bordered banner tagged REASONING, reading 'Thinking…' while the chain streams and 'Agent reasoning' once it lands. It stays expanded."
            fail="The default grey card, meaning the slot prop did not take — or no card at all, meaning the model emitted no thinking block."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/generative-ui/reasoning/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The slot component"
        description="Published in full on the page — one of the few components in this integration that is. Copied verbatim."
      >
        <SourceCode file="frontend/src/app/generative-ui/reasoning/reasoning-block.tsx" />
      </Panel>

      <Panel title="Notes">
        <ul className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            The page&apos;s <code>page.tsx</code> calls{" "}
            <code>useReasoningCustomSuggestions()</code>, which it never
            publishes, and imports <code>ReasoningBlock</code> and{" "}
            <code>CopilotChatReasoningMessage</code> without an import block.
            Both imports are written out here.
          </li>
          <li>
            Reasoning depends on the model emitting thinking blocks, so this
            agent — like <code>reasoning-default</code> — carries a{" "}
            <code>max_thinking_tokens</code> budget in the registry. That is the
            only backend difference between the two reasoning routes and every
            other agent in this repo.
          </li>
        </ul>
      </Panel>
    </>
  );
}
