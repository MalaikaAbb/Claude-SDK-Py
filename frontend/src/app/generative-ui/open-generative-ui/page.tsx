import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

const DIR = "frontend/src/app/generative-ui/open-generative-ui";

/** Layout ported from the google-adk harness's route for the same page. */
export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/open-generative-ui" />

      <Callout tone="warn" title="Broken as published: no agent">
        <p className="leading-relaxed">
          The Code tab&apos;s two agent modules define only a{" "}
          <code>SYSTEM_PROMPT_HINT</code> each and say the agent itself is a
          shared <code>src/agents/agent.py</code> that no page prints. Nothing
          is put in its place: the modules sit unwired in{" "}
          <code>backend/src/agents/doc_reference/</code>, no{" "}
          <code>open-gen-ui</code> agents are mounted, and runs on this route
          fail. The runtime config, snippets and sandbox functions are the
          page&apos;s.
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
        <div className="mt-4">
          <TryIt
            prompts={[
              "build me a simple greeting card",
              "(advanced) Build a calculator whose = button calls evaluateExpression on the host",
              "(advanced) Build a button that sends 'hello from the sandbox' with notifyHost",
            ]}
            expect="As a report: an agent error in the chat (404 from the Python server; no open-gen-ui agent is mounted). As the page intends: an iframe preview that builds up while it streams."
            fail="A rendered iframe would mean something mounted an agent, which this route deliberately does not."
          />
        </div>
      </Panel>

      <Panel title="The two demos">
        <SourceCodeGroup
          files={[
            { file: `${DIR}/open-gen-ui.tsx` },
            { file: `${DIR}/open-gen-ui-advanced.tsx` },
            { file: `${DIR}/sandbox-functions.ts` },
          ]}
          note="The minimal and advanced snippets as published (changes listed in each file's header), and the Code tab's sandbox functions verbatim."
        />
      </Panel>

      <Panel title="The runtime">
        <SourceCode file="frontend/src/app/api/copilotkit-ogui/[[...slug]]/route.ts" />
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

      <Callout tone="warn" title="Gaps and harness changes">
        <ul className="space-y-1.5">
          <li>
            · No agent is published, only two prompt hints. Nothing is
            mounted in its place.
          </li>
          <li>
            · <code>Chat</code> is rendered by both snippets and defined by
            neither; <code>chat.tsx</code> is a plain <code>CopilotChat</code>{" "}
            stand-in.
          </li>
          <li>
            · <code>VISUALIZATION_DESIGN_SKILL</code> (minimal) and{" "}
            <code>./suggestions</code> (advanced) are unpublished; the line and
            the import are commented out, so the default design skill applies
            and no suggestion chips show.
          </li>
          <li>
            · The Code tab&apos;s runtime uses the unpublished{" "}
            <code>createClaudeHttpAgent</code> and{" "}
            <code>internalRuntimeErrorResponse</code>, and a single-route
            fixed path that hits README §9.19 with a relative{" "}
            <code>runtimeUrl</code>. It sits at <code>[[...slug]]</code> with{" "}
            this repo&apos;s usual <code>HttpAgent</code> wiring, one path per
            agent id.
          </li>
        </ul>
      </Callout>
    </>
  );
}
