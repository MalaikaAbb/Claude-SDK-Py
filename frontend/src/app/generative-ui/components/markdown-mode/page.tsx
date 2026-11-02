import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/components/markdown-mode" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          With <code>transport: &quot;markdown&quot;</code> there is no tool.
          The agent writes A2UI operations as JSON lines inside an{" "}
          <code>a2ui</code> code fence in its normal reply, and the client
          parses them out of the streaming text and renders a live surface in
          place. A fence opened as <code>a2ui target=&lt;id&gt;</code> renders
          into that page surface instead of the message.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Give me a plan estimator I can play with: a seats slider from 1 to 50 and the monthly price.",
              "Put a short to-do list in the featured panel on the side.",
            ]}
            expect="Text, then a Card with a working Slider and a price line appearing in the middle of the reply, then more text — no visible JSON. The second prompt fills the 'featured' panel on the right instead of the chat."
            fail="The JSON lines show up as a raw code block: the client is not parsing a2ui fences. No fence at all and a prose answer: the fence guideline never reached the agent as context."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/generative-ui/components/markdown-mode/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="Build-your-own-prompt backend"
        description="The page's only Python. Kept as unwired reference — the module docstring explains why it cannot run on ClaudeAgentAdapter."
      >
        <SourceCode file="backend/src/agents/doc_reference/markdown_mode.py" />
      </Panel>

      <Panel title="Notes">
        <ul className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            Only the default <code>sendContext</code> (on) is wired. The{" "}
            <code>sendContext: false</code> path relies on the backend reading
            the catalog from <code>forwarded_props</code>, and the adapter
            drops keys outside its whitelist before the run.
          </li>
          <li>
            The page also covers the v1 <code>@copilotkit/react-ui</code>{" "}
            chats. This repo is v2-only, so that compatibility note is not
            implemented.
          </li>
          <li>
            The page&apos;s limits apply: a fence must start at the beginning
            of a line, and a <code>surfaceId</code> is never reused, even after
            it is deleted.
          </li>
        </ul>
      </Panel>
    </>
  );
}
