import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/prebuilt-components/popup" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The overlay variant: a floating launcher in the corner that opens the
          chat on top of the page. Same slots and labels as{" "}
          <code>&lt;CopilotChat&gt;</code>, plus <code>header</code> and{" "}
          <code>toggleButton</code>. The <code>labels</code> prop is exercised
          here so the override is visible in the composer placeholder.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Ask the popup anything...", "Why would I pick a popup over a sidebar?"]}
            expect="The composer placeholder reads 'Ask the popup anything...' — that string comes from labels, not the default. The panel floats above the content and does not reflow it."
            fail="The default placeholder text, which means labels was not applied."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/prebuilt-components/popup/demo-chat/page.tsx" />
      </Panel>

      <Panel title="Note on the doc's snippet">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          As on the Sidebar page, the snippet includes an undefined{" "}
          <code>&lt;MainContent /&gt;</code> and{" "}
          <code>&lt;Suggestions /&gt;</code>. Both are supplied minimally here.
          Everything on the <code>&lt;CopilotPopup&gt;</code> element itself is
          the doc&apos;s, unchanged.
        </p>
      </Panel>
    </>
  );
}
