import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/prebuilt-components/sidebar" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The docked variant. It renders as a sibling of your main content
          rather than a child, so opening and closing it does not reflow the
          page, and the launcher stays reachable while the user keeps their
          place.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Summarise what this page is for.", "Close yourself."]}
            expect="The sidebar starts open (defaultOpen). Toggling it slides the panel without moving the content underneath."
            fail="Content jumps when the panel opens, or the panel covers the page like a popup."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/prebuilt-components/sidebar/demo-chat/page.tsx" />
      </Panel>

      <Panel title="Note on the doc's snippet">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The page&apos;s snippet includes <code>&lt;MainContent /&gt;</code>{" "}
          and <code>&lt;Suggestions /&gt;</code> as siblings and defines
          neither. <code>MainContent</code> is stand-in page content, so this
          route supplies its own minimal version; <code>Suggestions</code> is
          the same <code>useConfigureSuggestions</code> call the CopilotChat
          page publishes in full.
        </p>
      </Panel>
    </>
  );
}
