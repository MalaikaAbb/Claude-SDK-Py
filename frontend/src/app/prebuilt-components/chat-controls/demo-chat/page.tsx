"use client";

import {
  CopilotChatConfigurationProvider,
  CopilotPopup,
  CopilotSidebar,
  useCopilotChatConfiguration,
} from "@copilotkit/react-core/v2";
import { useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

const AGENT_ID = "chat-controls";

type FeedbackEntry = { id: string; value: "up" | "down"; at: string };

/**
 * The page's two controls on one surface.
 *
 * The doc's `OpenChatButton` reads `useCopilotChatConfiguration()` and returns
 * null when there is no `setModalOpen`, describing that as the case where no
 * provider in the tree "owns modal state" — and then never says how to arrange
 * one. Followed literally the button never renders, because:
 *
 *   * `<CopilotSidebar>` does own modal state, but privately. It builds its
 *     `CopilotChatConfigurationProvider` *inside* itself (twice, in fact —
 *     `CopilotChat` and `CopilotSidebarView` each make one), so the context
 *     exists only below the sidebar. A button placed next to the sidebar is
 *     outside it.
 *   * `<CopilotKitProvider>` does not create one at all. (The v1 `<CopilotKit>`
 *     wrapper does, via `CopilotKitInternal` — which is probably why the doc's
 *     snippet looks like it should just work.)
 *
 * So the provider has to be hoisted above both, which is what this component
 * does. The sync is two-way and the library handles it: a nested provider with
 * an explicit `isModalDefaultOpen` mirrors its parent's `isModalOpen` down on
 * change, and its `setModalOpen` pushes back up. The sidebar always passes one,
 * so the outer button and the sidebar's own toggle stay in agreement.
 *
 * The doc's feedback handlers call a global `analytics.track(...)` that no page
 * defines. They write to the visible log below instead, so the callback firing
 * is observable without the console.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/prebuilt-components/chat-controls"
      subtitle={`agent: ${AGENT_ID}`}
    >
      <Demo />
    </DemoFrame>
  );
}

function Demo() {
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
   

  const record = (value: "up" | "down") => (message: { id: string }) => {
    setFeedback((prev) => [
      { id: message.id, value, at: new Date().toLocaleTimeString() },
      ...prev,
    ]);
  };

  return (
    <CopilotChatConfigurationProvider
      agentId={AGENT_ID}
      // Matches the sidebar's `defaultOpen` below, so both start in the same
      // state rather than disagreeing until the first toggle.
      isModalDefaultOpen
    >
      <div className="h-full overflow-hidden">
        <main className="h-full space-y-6 overflow-y-auto p-10">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Open, close, and feedback
            </h1>
            <p className="mt-2 max-w-prose text-sm text-slate-600 dark:text-slate-400">
              The buttons below drive the sidebar from outside it. Send a
              message, then thumb the reply — every rating lands in the log.
              <br/>
              <b>RATINGS/FEEDBACK CONFIGURATION IS IN SIDEBAR</b>
            </p>
          </div>

          <ChatControls />

          <section className="max-w-md rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Feedback log
            </h2>
            {feedback.length === 0 ? (
              <p className="mt-2 text-sm italic text-slate-500">
                Nothing rated yet.
              </p>
            ) : (
              <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                {feedback.map((f, i) => (
                  <li key={`${f.id}-${i}`} className="font-mono text-xs">
                    {f.at} · {f.value === "up" ? "👍" : "👎"} · {f.id}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>

        <CopilotSidebar
          position="left"
          agentId={AGENT_ID}
          defaultOpen
          messageView={{
            assistantMessage: {
              onThumbsUp: record("up"),
              onThumbsDown: record("down"),
            },
          }}
        />
      </div>
    </CopilotChatConfigurationProvider>
  );
}

function ChatControls() {
  const config = useCopilotChatConfiguration();
  const [chatOpen, setChatOpen] = useState(false);
  // The doc's guard, kept verbatim. Note what it does NOT mean: the prebuilt
  // Popup and Sidebar create modal state below themselves, not around
  // themselves, so this returns null for any button that is their sibling. An
  // ancestor `CopilotChatConfigurationProvider` is what makes it pass — see the
  // component comment above.
  if (!config?.setModalOpen) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {/* <button
        onClick={() => config.setModalOpen(true)}
        className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white"
      >
        Ask the assistant
      </button> */}
      
      <button
        onClick={() => config.setModalOpen(!config.isModalOpen)}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
      >
        {config.isModalOpen ? "Close Sidebar" : "Open Sidebar"}
      </button>
      <nav>
        <button onClick={() => setChatOpen(!chatOpen)}
          className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white"
          >
            Ask the assistant (Popup)
          </button>
      </nav>

      <CopilotPopup
          agentId={AGENT_ID}
          defaultOpen
          open={chatOpen} 
          onOpenChange={setChatOpen} 
        />
    </div>
  );
}
