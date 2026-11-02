"use client";

import { CopilotChat, useConfigureSuggestions } from "@copilotkit/react-core/v2";
import { GenerativeUISurface, standardUI } from "@copilotkit/react-core/v2/generative-ui";

import { DemoFrame } from "@/components/demo-frame";

import { ComponentsProvider } from "../../_components/provider";

const AGENT_ID = "gen-ui-markdown";

/**
 * The page's provider, as published: `transport: "markdown"`. No tool is
 * involved — the fence guideline and the catalog go to the agent as context,
 * the agent writes ```a2ui fences in its reply, and the client parses them
 * out of the streamed text.
 *
 * The `featured` surface on the right is what a fence opened as
 * ```a2ui target=featured lands in, rather than in the chat.
 *
 * `sendContext` is left at its default (on). The page's `sendContext: false`
 * variant needs a backend that writes its own prompt from forwarded props,
 * which `ClaudeAgentAdapter` cannot do — see
 * `backend/src/agents/doc_reference/markdown_mode.py`.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/generative-ui/components/markdown-mode" subtitle={`agent: ${AGENT_ID}`}>
      <ComponentsProvider generativeUI={{ ui: standardUI, transport: "markdown" }}>
        <div className="grid h-full grid-cols-1 lg:grid-cols-[1fr_360px]">
          <Chat />
          <aside className="hidden min-h-0 overflow-y-auto border-l border-slate-200 p-4 lg:block dark:border-slate-800">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Surface <code>featured</code>
            </h2>
            <GenerativeUISurface
              id="featured"
              description="A panel beside the chat. Pin a fence here with target=featured when the user asks for something on the side."
              fallback={<p className="text-xs text-slate-400">Empty until a fence targets it.</p>}
            />
          </aside>
        </div>
      </ComponentsProvider>
    </DemoFrame>
  );
}

function Chat() {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "Plan estimator",
        message: "Give me a plan estimator I can play with: a seats slider from 1 to 50 and the monthly price.",
      },
      { title: "Compare plans", message: "Compare the Starter, Team, and Enterprise plans in a table" },
      { title: "Pin to side", message: "Put a short to-do list in the featured panel on the side." },
    ],
    available: "always",
  });

  return <CopilotChat agentId={AGENT_ID} className="h-full min-h-0" />;
}
