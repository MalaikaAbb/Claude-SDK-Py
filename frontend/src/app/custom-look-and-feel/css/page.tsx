import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/custom-look-and-feel/css" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Re-skinning without touching a component. Three levels, all live on
          the demo: the v2 shadcn design tokens on{" "}
          <code>[data-copilotkit]</code>, the <code>.copilotKit*</code> class
          hooks for anything the tokens do not reach, and the{" "}
          <code>labels</code> / <code>icons</code> props for copy and glyphs.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Hello — what should I ask you?"]}
            expect="Cream paper background, a monospace user message on a cream card with an ember left border and a → prefix, and the header reading 'My Copilot'."
            fail="Default CopilotKit styling, which means theme.css did not load or the scope class is missing from the wrapper."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/custom-look-and-feel/css/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The stylesheet"
        description="The doc's own CSS, with its two global blocks scoped so the theme cannot leak across routes."
      >
        <SourceCode file="frontend/src/app/custom-look-and-feel/css/theme.css" />
      </Panel>

      <Panel title="Doc-vs-implementation notes">
        <Callout tone="warn" title="A v1 import in a v2 page">
          <p className="leading-relaxed">
            The page&apos;s inline-style example imports{" "}
            <code>CopilotKitCSSProperties</code> from{" "}
            <code>@copilotkit/react-ui</code> and sets{" "}
            <code>--copilot-kit-primary-color</code>. Both are v1: this
            integration installs <code>@copilotkit/react-core</code> only, and
            the v2 token is <code>--primary</code>. That snippet is the one
            block on the page this route does not implement, because it cannot
            compile here.
          </p>
        </Callout>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            The snippet labelled <code>page.tsx</code> is a single line —{" "}
            <code>import &quot;./theme.css&quot;</code> — so the page never
            shows the component the theme applies to. This route supplies a
            minimal one.
          </li>
          <li>
            The Halcyon palette is published as a block of custom properties
            that no published rule consumes. The user-message rules use{" "}
            <code>--halcyon-mono</code>, <code>--halcyon-ember</code> and two
            others; the remaining fourteen are declared and unused. This route
            adds one rule so the paper background is at least visible.
          </li>
          <li>
            Two font blocks set <code>font-family: &quot;Arial,
            sans-serif&quot;</code> — a single quoted string, not a font stack,
            so a browser looks for one family literally named{" "}
            <em>Arial, sans-serif</em> and finds none. This route uses the
            page&apos;s own <code>--halcyon-sans</code> for those two selectors
            instead.
          </li>
        </ul>
      </Panel>

      <Panel title="The agent">
        <SourceCodeGroup
          files={[{ file: "backend/src/agents/registry.py", region: "registry" }]}
          note="Nothing on this route is backend-specific — chat-customization-css is the Quickstart adapter under another name."
        />
      </Panel>
    </>
  );
}
