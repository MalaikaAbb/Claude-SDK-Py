"use client";

import {
  CopilotKit,
  CopilotChat,
  CopilotChatConfigurationProvider,
  CopilotThreadsDrawer,
  useCopilotChatConfiguration,
} from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";
import { nestedInspectorSetting } from "@/lib/inspector";
import { useAutoThreadName } from "@/lib/use-auto-thread-name";

// Shared by all three Rich Threads routes. `useThreads` scopes its list by
// agentId, so a per-route id would give this page its own disjoint list.
/**
 * Wrapped in its own provider pointed at `/api/copilotkit-threads`.
 *
 * The app-wide provider talks to `/api/copilotkit`, which registers 25 agents
 * and runs in SSE mode. Intelligence must sit on a runtime advertising as few
 * agents as possible, because the client opens a realtime thread channel per
 * advertised agent — see the threads endpoint for the full story.
 */
const AGENT_ID = "threads";

/**
 * The doc's whole integration: a drawer and a chat inside one shared
 * `CopilotChatConfigurationProvider`.
 *
 * The shared configuration is the point. It holds the active thread, so
 * selecting a row connects the chat to that thread and replays its history, and
 * the "New Conversation" row resets the chat to a fresh welcome screen — with
 * no `threadId` state, no selection handler, and no props passed between the
 * two components.
 *
 * `CopilotKitProvider` is not repeated here; the app already mounts one at the
 * root. The doc nests them because its sample is a whole page. The licence is
 * set on the runtime, which is where the page now says it belongs too.
 *
 * One departure, presentational only. The doc's wrapper is
 * `<div style={{ display: "flex", height: "100dvh" }}>` with the two components
 * as bare children. In a flex row `CopilotChat` has no flex basis of its own,
 * so it collapses to min-content — the chat renders one word per line beside a
 * full-width drawer. `flex: 1` plus `minWidth: 0` gives it the remaining space;
 * `minWidth` matters because a flex item's default `min-width: auto` refuses to
 * shrink below its content and would push the layout wider than the viewport.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/prebuilt-components/copilot-threads-drawer"
      subtitle={`agent: ${AGENT_ID} · CopilotThreadsDrawer + CopilotChat`}
    >
      <CopilotKit
        runtimeUrl="/api/copilotkit-threads"
        agent={AGENT_ID}
        enableInspector={nestedInspectorSetting}
      >
        <CopilotChatConfigurationProvider agentId={AGENT_ID}>
          {/* Repo-authored: the runtime's own naming cannot work through
              ClaudeAgentAdapter, so the title comes from the first user message.
              See lib/use-auto-thread-name.ts and README §9.15. */}
          <AutoThreadName />
          <div style={{ display: "flex", height: "100%" }}>
            <CopilotThreadsDrawer />
            {/* The page's "Add your own New conversation button" layout: a
                header holding the button above the chat. `minWidth: 0` is
                this repo's (see the note above). */}
            <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
              <header>
                <NewConversationButton />
              </header>
              <CopilotChat />
            </main>
          </div>
        </CopilotChatConfigurationProvider>
      </CopilotKit>
    </DemoFrame>
  );
}

// From the page's "Add your own New conversation button" section, verbatim.
function NewConversationButton() {
  const configuration = useCopilotChatConfiguration();

  return (
    <button
      type="button"
      onClick={() => configuration?.startNewThread()}
    >
      New conversation
    </button>
  );
}

function AutoThreadName() {
  useAutoThreadName(AGENT_ID);
  return null;
}
