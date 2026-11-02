"use client";

import { CopilotChat, useConfigureSuggestions } from "@copilotkit/react-core/v2";
import { standardUI } from "@copilotkit/react-core/v2/generative-ui";
import { useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

import { ComponentsProvider } from "../../_components/provider";
import { theme } from "../theme";

const AGENT_ID = "gen-ui-theming";

/**
 * Three switches, one per thing the page claims:
 *
 *   - Provider theme — `generativeUI.theme` sets the `--a2ui-*` variables on
 *     every surface root. Amber accent, 10px radius when on.
 *   - Dark class — a `.dark` ancestor turns on the theme's `dark` block. The
 *     page puts it on `<html>`; here it goes on a wrapper so the rest of the
 *     harness is unaffected.
 *   - CSS override — the page's `.a2ui-surface { --a2ui-color-accent }` rule,
 *     in violet. With the provider theme also on, the page says the theme
 *     wins, so violet should only show with the theme switched off.
 *
 * Render something with a button or a chart, then flip the switches.
 */
export default function Page() {
  const [useTheme, setUseTheme] = useState(true);
  const [dark, setDark] = useState(false);
  const [cssOverride, setCssOverride] = useState(false);

  return (
    <DemoFrame parentPath="/generative-ui/components/theming" subtitle={`agent: ${AGENT_ID}`}>
      <ComponentsProvider generativeUI={{ ui: standardUI, ...(useTheme ? { theme } : {}) }}>
        <style>{`.theming-css-override .a2ui-surface { --a2ui-color-accent: #7c3aed; }`}</style>
        <div className="flex h-full flex-col">
          <div className="flex shrink-0 flex-wrap gap-4 border-b border-slate-200 px-4 py-2 text-xs dark:border-slate-800">
            <Toggle label="Provider theme" on={useTheme} set={setUseTheme} />
            <Toggle label=".dark ancestor" on={dark} set={setDark} />
            <Toggle label="CSS override (.a2ui-surface)" on={cssOverride} set={setCssOverride} />
          </div>
          <div
            className={`min-h-0 flex-1 ${dark ? "dark bg-slate-950 text-slate-100" : ""} ${
              cssOverride ? "theming-css-override" : ""
            }`}
          >
            <Chat />
          </div>
        </div>
      </ComponentsProvider>
    </DemoFrame>
  );
}

function Toggle({ label, on, set }: { label: string; on: boolean; set: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-1.5">
      <input type="checkbox" checked={on} onChange={(e) => set(e.target.checked)} />
      {label}
    </label>
  );
}

function Chat() {
  useConfigureSuggestions({
    suggestions: [
      { title: "Buttons + card", message: "Show a Card with a title, a sentence, and two Buttons: Accept and Decline." },
      { title: "Chart", message: "Show a bar chart of six made-up monthly values." },
      { title: "Form", message: "Show a form with a TextField, a Slider and a CheckBox." },
    ],
    available: "always",
  });

  return <CopilotChat agentId={AGENT_ID} className="h-full" />;
}
