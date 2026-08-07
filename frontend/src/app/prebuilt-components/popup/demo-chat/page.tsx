"use client";

import { CopilotPopup, useConfigureSuggestions } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

const AGENT_ID = "prebuilt-popup";

/**
 * The doc's `prebuilt-popup` demo, with its `labels` override intact — that
 * placeholder string is the visible proof the prop landed.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/prebuilt-components/popup" subtitle={`agent: ${AGENT_ID}`}>
      <Layout />
    </DemoFrame>
  );
}

function Layout() {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "Popup vs sidebar",
        message: "Why would I pick a popup over a sidebar?",
      },
    ],
    available: "always",
  });

  return (
    <div className="h-full overflow-hidden">
      <MainContent />
      <CopilotPopup
        agentId={AGENT_ID}
        defaultOpen={true}
        labels={{
          chatInputPlaceholder: "Ask the popup anything...",
        }}
      />
    </div>
  );
}

function MainContent() {
  return (
    <main className="h-full overflow-y-auto p-10">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        Your page
      </h1>
      <p className="mt-3 max-w-prose text-sm text-slate-600 dark:text-slate-400">
        The popup floats over this content instead of sitting beside it. Close
        it and the layout is untouched — nothing here ever moved.
      </p>
    </main>
  );
}
