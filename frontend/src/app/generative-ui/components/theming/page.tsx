import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/components/theming" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Every generated surface is styled through <code>--a2ui-*</code> CSS
          variables. Set them on the provider with <code>theme</code> (typed,
          with a nested <code>dark</code> block), or in CSS on{" "}
          <code>.a2ui-surface</code>. Dark mode follows a <code>.dark</code>{" "}
          class on an ancestor. When both set the same variable, the provider
          value wins.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Show a Card with a title, a sentence, and two Buttons: Accept and Decline."]}
            expect="With 'Provider theme' on, the buttons are amber with 10px corners. Turn on '.dark ancestor' and the card's panel goes dark slate. Turn on 'CSS override' with the theme still on — buttons stay amber. Turn the theme off and they go violet."
            fail="Buttons stay default with the theme on: the theme is not reaching the surface root. Violet while the theme is on: CSS is beating the theme, the opposite of the page's rule."
          />
        </div>
      </Panel>

      <Panel title="The theme" description="The page's provider and dark-mode snippets merged into one value.">
        <SourceCode file="frontend/src/app/generative-ui/components/theming/theme.ts" />
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/generative-ui/components/theming/demo-chat/page.tsx" />
      </Panel>

      <Panel title="Notes">
        <ul className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            The page toggles <code>dark</code> on <code>&lt;html&gt;</code>{" "}
            from a <code>prefers-color-scheme</code> script. Doing that here
            would flip the whole harness, so the class goes on a wrapper — the
            page says any ancestor works.
          </li>
          <li>
            <code>mapStyle</code> is not set: <code>Map</code> needs{" "}
            <code>maplibre-gl</code>, which is not installed.
          </li>
          <li>
            The page lists the variable groups but not every name. Only the
            names it does show are used.
          </li>
        </ul>
      </Panel>
    </>
  );
}
