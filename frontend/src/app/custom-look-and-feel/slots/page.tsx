import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { CodeBlock, Callout, Panel, TryIt } from "@/components/ui";

const LEVELS = `// 1 — a Tailwind class string, merged with the default component's classes
<CopilotChat messageView="bg-gray-50 dark:bg-gray-900 p-4" input="border-2 border-blue-400 rounded-xl" />

// 2 — a props object, spread onto the default component
<CopilotChat messageView={{ className: "my-custom-messages", "data-testid": "message-view" }} input={{ autoFocus: true }} />

// 3 — your own component, receiving the same props the default would
<CopilotChat messageView={CustomMessageView} />

// …and drill down as far as you like; slots are recursive
<CopilotChat messageView={{ assistantMessage: { copyButton: ({ onClick }) => <button onClick={onClick}>Copy</button> } }} />`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/custom-look-and-feel/slots" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Every chat component is assembled from named sub-components, and each
          one is a prop. Pass a string to add classes, an object to override
          props, or a component to replace it outright — and nest objects to
          reach sub-components at any depth. The demo takes the third route on
          three slots at once: <code>welcomeScreen</code>,{" "}
          <code>messageView.assistantMessage</code>, and{" "}
          <code>input.disclaimer</code>.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Say hello."]}
            expect="A gradient welcome card with the composer directly beneath it; after the first message, every assistant reply sits in a tinted card tagged 'slot', and the composer's disclaimer is the indigo override."
            fail="Default chrome on any of the three means that slot prop did not take. A gradient card with no composer under it means the welcomeScreen override dropped its input prop — see the note below."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/custom-look-and-feel/slots/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The three override components"
        description="The page declares these three names and never writes their bodies. Kept minimal — enough to be visibly in effect, and no more."
      >
        <SourceCode file="frontend/src/app/custom-look-and-feel/slots/slot-overrides.tsx" />
      </Panel>

      <Panel
        title="The other two levels"
        description="Published on the page and not exercised by the demo, since a component swap is the loudest of the three."
      >
        <CodeBlock code={LEVELS} language="tsx" />
      </Panel>

      <Panel title="Doc-vs-implementation notes">
        <Callout tone="warn" title="welcomeScreen is the empty state, not decoration">
          <p className="leading-relaxed">
            The slot receives <code>input</code> and{" "}
            <code>suggestionView</code> as ready-made elements and is
            responsible for placing them. CopilotKit&apos;s default renders the
            welcome message, then the input, then the suggestions — so a
            replacement that ignores those props deletes the composer, and the
            chat looks broken until the first message exists to switch the view
            over.
          </p>
          <p className="mt-2 leading-relaxed">
            The page&apos;s teaching extract declares{" "}
            <code>CustomWelcomeScreen: ComponentType</code> — a component taking
            no props at all — which is precisely the shape that loses the input.
            Its prose calls the slot &quot;the empty-state view shown before the
            first message is sent&quot; without mentioning that the composer
            lives inside it. The version here takes the props and renders both.
          </p>
        </Callout>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            The other two overrides do not have this hazard, for different
            reasons. <code>assistantMessage</code> wraps{" "}
            <code>CopilotChatAssistantMessage</code> and spreads its props
            through, so nothing is lost; <code>input.disclaimer</code> is leaf
            text with no children to forward. Only container slots are
            load-bearing.
          </li>
          <li>
            All three of the page&apos;s slot snippets are the{" "}
            <em>same file</em> truncated at three different points — the
            &quot;assistant message slot&quot; block is the welcome-screen block
            plus four lines, and the disclaimer block is that plus four more.
            Read as three separate examples they look redundant; they are one
            example shown three times.
          </li>
          <li>
            That file opens with{" "}
            <code>declare const CustomWelcomeScreen: ComponentType</code> and
            two siblings, so the components being demonstrated are explicitly
            absent from the docs. This route writes them.
          </li>
          <li>
            The page also carries a full <code>agent.py</code> block described
            as a &quot;sales assistant with weather, HITL, and generative
            UI&quot;. Nothing on a slots page needs a backend, and that file is
            not published anywhere in a runnable form — see the Quickstart route
            for what is missing from it.
          </li>
        </ul>
      </Panel>

      <Panel title="The agent">
        <SourceCodeGroup
          files={[{ file: "backend/src/agents/chat_agents.py", region: "build-adapter" }]}
          note="chat-slots is the Quickstart adapter under another name — slots are entirely a frontend concern."
        />
      </Panel>
    </>
  );
}
