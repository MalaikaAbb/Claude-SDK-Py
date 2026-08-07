import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/prebuilt-components/chat" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <code>&lt;CopilotChat&gt;</code> is the root primitive;{" "}
          <code>&lt;CopilotSidebar&gt;</code> and{" "}
          <code>&lt;CopilotPopup&gt;</code> are wrappers over it. Given a height
          it fills the container, which is what makes it the right choice for a
          dedicated chat pane or route.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Write a short sonnet about AI.", "What can you help me with?"]}
            expect="Two suggestion pills before the first message; after it, a streamed markdown reply filling the pane."
            fail="No suggestions, or a chat that collapses to zero height — the latter means the container has no height to fill."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/prebuilt-components/chat/demo-chat/page.tsx" />
      </Panel>

      <Panel title="Note on the doc's snippet">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The page ships two versions of the same component. The first imports{" "}
          <code>useAgenticChatSuggestions</code> from a local{" "}
          <code>./suggestions</code> module it never publishes; the second calls{" "}
          <code>useConfigureSuggestions</code> directly with the same payload.
          The second is the real export, so it is what runs here.
        </p>
      </Panel>
    </>
  );
}
