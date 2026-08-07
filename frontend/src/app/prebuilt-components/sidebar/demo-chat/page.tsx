"use client";

import {
  CopilotSidebar,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

const AGENT_ID = "prebuilt-sidebar";

/**
 * The doc's `prebuilt-sidebar` demo.
 *
 * Its snippet is `<MainContent />`, `<CopilotSidebar agentId defaultOpen />`
 * and `<Suggestions />` side by side inside the provider, with the first and
 * third left undefined. `MainContent` is just page content, so this route
 * writes a minimal one; `Suggestions` is the `useConfigureSuggestions` call the
 * CopilotChat page publishes.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/prebuilt-components/sidebar" subtitle={`agent: ${AGENT_ID}`}>
      <Layout />
    </DemoFrame>
  );
}

function Layout() {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "What is this panel?",
        message: "What is the difference between a sidebar and a popup chat?",
      },
    ],
    available: "always",
  });

  return (
    <div className="h-full overflow-hidden">
      <MainContent />
      <CopilotSidebar agentId={AGENT_ID} defaultOpen={true} />
    </div>
  );
}

function MainContent() {
  return (
    <main className="h-full overflow-y-auto p-10">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        Your app shell
      </h1>
      <p className="mt-3 max-w-prose text-sm text-slate-600 dark:text-slate-400">
        This column is the page. The sidebar docks beside it rather than over
        it, so toggling the panel never moves this text.
      </p>
    </main>
  );
}
