import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/prebuilt-components/chat-controls" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Two unrelated controls the page groups together.{" "}
          <code>useCopilotChatConfiguration</code> reads the modal state a
          prebuilt wrapper owns, so your own buttons can open and close the
          chat. Separately, <code>messageView.assistantMessage.onThumbsUp</code>{" "}
          and <code>onThumbsDown</code> turn the built-in feedback controls into
          callbacks you can forward to analytics.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Say something I can rate."]}
            expect="The two buttons above the chat toggle it, and their label tracks isModalOpen. Thumbing a reply appends a line to the feedback log on the page."
            fail="Buttons render but do nothing — that means no provider in the tree owns modal state, and config.setModalOpen is undefined."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/prebuilt-components/chat-controls/demo-chat/page.tsx" />
      </Panel>

      <Panel title="Doc-vs-implementation notes">
        <Callout tone="warn" title="Followed literally, the buttons never render">
          <p className="leading-relaxed">
            The page&apos;s <code>OpenChatButton</code> bails when there is no{" "}
            <code>setModalOpen</code>, explaining that one exists when a
            provider in the tree owns modal state and that{" "}
            &quot;the prebuilt CopilotPopup / CopilotSidebar create it for
            you&quot;. They do — but <em>below</em> themselves, not around
            themselves. <code>CopilotSidebar</code> builds its{" "}
            <code>CopilotChatConfigurationProvider</code> internally (twice:{" "}
            <code>CopilotChat</code> and <code>CopilotSidebarView</code> each
            make one), so the context reaches only the sidebar&apos;s own
            subtree. A button placed next to the sidebar — which is where the
            page&apos;s own framing puts it, driving the chat &quot;from your
            own UI&quot; — is outside that subtree and renders nothing.
          </p>
          <p className="mt-2 leading-relaxed">
            <code>CopilotKitProvider</code> does not supply one either. The v1{" "}
            <code>&lt;CopilotKit&gt;</code> wrapper does, which is likely why
            the snippet reads as though it should work unaided.
          </p>
          <p className="mt-2 leading-relaxed">
            The fix is to hoist a{" "}
            <code>CopilotChatConfigurationProvider</code> above both, as the
            demo does. The two-way sync is already handled: a nested provider
            with an explicit <code>isModalDefaultOpen</code> mirrors its
            parent&apos;s <code>isModalOpen</code> downward on change, and its{" "}
            <code>setModalOpen</code> pushes back up — so the outer button and
            the sidebar&apos;s own toggle stay in agreement.
          </p>
        </Callout>
        <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The feedback snippet calls a global <code>analytics.track(...)</code>{" "}
          that no page defines. This route replaces those two calls with writes
          to a visible log, so the callback firing is something you can see
          rather than something you have to open the console for. The hook usage
          and the guard on <code>config?.setModalOpen</code> are the doc&apos;s,
          unchanged.
        </p>
      </Panel>
    </>
  );
}
