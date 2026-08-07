import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/custom-look-and-feel/reasoning-messages" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Reasoning is a message type, not a renderer you plumb in. When{" "}
          <code>REASONING_MESSAGE_*</code> events arrive, the chat renders the
          built-in <code>CopilotChatReasoningMessage</code> card by itself —
          &quot;Thinking…&quot; while the model works, collapsing to
          &quot;Thought for X seconds&quot; when it finishes. This demo keeps
          that card and replaces two of its sub-slots,{" "}
          <code>header</code> and <code>contentView</code>.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "A train leaves at 2:15pm going 60mph. Another leaves the same station at 3:00pm going 75mph. When does the second catch the first?",
            ]}
            expect="A 🧠 header with a Hide/Show toggle appears above the answer, its body in grey monospace with a blinking ▊ while it streams. The emoji flips to 💡 once thinking ends."
            fail="No reasoning card at all — the model answered without emitting a thinking block. Ask something that needs working out, or raise max_thinking_tokens in the registry."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/custom-look-and-feel/reasoning-messages/demo-chat/page.tsx" />
      </Panel>

      <Panel title="Where the reasoning comes from">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          This is the one route whose backend deviates from the docs in a way
          that matters, and it deviates by doing less. The page publishes a
          300-line <code>reasoning_agent.py</code> that bypasses{" "}
          <code>ClaudeAgentAdapter</code> entirely: it opens its own{" "}
          <code>anthropic.AsyncAnthropic</code> client, streams with{" "}
          <code>thinking=&#123;&quot;type&quot;: &quot;enabled&quot;&#125;</code>,
          and hand-maps <code>thinking_delta</code> blocks onto AG-UI reasoning
          events — plus a second, dormant state machine that parses{" "}
          <code>&lt;reasoning&gt;</code> tags out of the text stream as a
          fallback.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          None of that is needed. The adapter already emits{" "}
          <code>ReasoningStartEvent</code>,{" "}
          <code>ReasoningMessageStartEvent</code>,{" "}
          <code>ReasoningMessageContentEvent</code> and{" "}
          <code>ReasoningMessageEndEvent</code> from Claude&apos;s thinking
          blocks. All this route adds to the Quickstart&apos;s options dict is a{" "}
          <code>max_thinking_tokens</code> budget — without one, Claude emits no
          thinking blocks and there is nothing to render.
        </p>
        <div className="mt-4">
          <SourceCodeGroup
            files={[
              { file: "backend/src/agents/chat_agents.py", region: "build-adapter" },
            ]}
          />
        </div>
      </Panel>

      <Panel title="Doc-vs-implementation notes">
        <Callout tone="warn" title="An import that does not resolve">
          <p className="leading-relaxed">
            The published <code>reasoning_agent.py</code> imports{" "}
            <code>normalize_claude_model</code> from{" "}
            <code>agents.claude_agent_sdk_adapter</code>. That module is named
            on the Quickstart, but its contents are never published — the same
            missing module the Sub-Agents page imports from. The doc&apos;s
            reasoning agent could not run as printed.
          </p>
        </Callout>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            The page&apos;s two <code>page.tsx</code> blocks call{" "}
            <code>useReasoningDefaultSuggestions()</code> and{" "}
            <code>useReasoningCustomSuggestions()</code>, neither of which is
            published. Both are <code>useConfigureSuggestions</code> calls; this
            route makes that direct.
          </li>
          <li>
            The final snippet, <em>Render-Prop Children</em>, wraps{" "}
            <code>CopilotChatReasoningMessage</code> and destructures{" "}
            <code>&#123; header, toggle &#125;</code> from its children
            render-prop. It is a third override style, distinct from the
            sub-slot object used here and the whole-component swap on the
            Generative UI · Reasoning route.
          </li>
        </ul>
      </Panel>
    </>
  );
}
