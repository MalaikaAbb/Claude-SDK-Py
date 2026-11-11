import Link from "next/link";

import {
  IntelligenceNotice,
  SharedThreadStoreNotice,
} from "@/components/intelligence-notice";
import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { CodeBlock, Panel, TryIt } from "@/components/ui";

// Four of the page's newer snippets, verbatim, shown as text only. The first
// renders `YourMainContent`, which the page never defines.
const SIDEBAR_HOST = `import {
  CopilotKitProvider,
  CopilotChatConfigurationProvider,
  CopilotSidebar,
  CopilotThreadsDrawer,
} from "@copilotkit/react-core/v2";
import "@copilotkit/react-core/v2/styles.css";

export default function Page() {
  return (
    <CopilotKitProvider runtimeUrl="/api/copilotkit">
      <CopilotChatConfigurationProvider>
        <div style={{ display: "flex", height: "100dvh" }}>
          <CopilotThreadsDrawer />
          <main style={{ flex: 1 }}>
            <YourMainContent />
            <CopilotSidebar defaultOpen={true} />
          </main>
        </div>
      </CopilotChatConfigurationProvider>
    </CopilotKitProvider>
  );
}`;

const CONTROLLED_CHAT = `function ControlledChat() {
  const [threadId, setThreadId] = useState(() => crypto.randomUUID());
  const startNew = () => setThreadId(crypto.randomUUID());

  return (
    <CopilotChatConfigurationProvider threadId={threadId}>
      <CopilotThreadsDrawer
        onThreadSelect={(id) => setThreadId(id)}
        onNewThread={startNew}
      />
      <button type="button" onClick={startNew}>
        New conversation
      </button>
      <CopilotChat />
    </CopilotChatConfigurationProvider>
  );
}`;

const HIDE_BUILTIN_NEW = `copilotkit-threads-drawer::part(new-thread-button),
copilotkit-threads-drawer::part(launcher-new-thread) {
  display: none;
}`;

const AGENT_PROP = `<CopilotThreadsDrawer agentId="research_agent" />`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/prebuilt-components/copilot-threads-drawer" />

      <IntelligenceNotice />

      <SharedThreadStoreNotice />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A conversation switcher with no active-thread state of your own. The
          drawer and the chat sit inside one shared{" "}
          <code>CopilotChatConfigurationProvider</code>, and that provider holds
          the active thread — so selecting a row connects the chat to that
          thread and replays its history, and the &quot;New Conversation&quot;
          row resets the chat to a fresh welcome screen. No{" "}
          <code>threadId</code> state, no selection handler, no props passed
          between the two components.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Under the hood it wraps a self-contained web component rendered in a
          shadow root, which is why it themes itself correctly without config
          and why customisation goes through slots, <code>renderRow</code>, CSS
          parts and <code>--cpk-drawer-*</code> tokens rather than className.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Send a message, then press New Conversation and send another.",
              "Click back to the first row.",
              "Press the header's New conversation button.",
            ]}
            expect="Two rows in the drawer, auto-named after the first message. Clicking a row replays that conversation into the chat. The header button clears the chat to the welcome screen and no row stays selected."
            fail="A locked 'Threads are a CopilotKit Intelligence feature' panel means no valid licence token. An empty list with a working chat means the API key is missing — see the notice above."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/prebuilt-components/copilot-threads-drawer/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The page's other layouts"
        description="Newer sections of the page, verbatim, kept as text. The demo runs only the own-button layout."
      >
        <ul className="mb-4 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            <strong>Sidebar host.</strong> Renders <code>YourMainContent</code>,
            which the page never defines, so it is not mounted here.
          </li>
          <li>
            <strong>Controlled thread id.</strong> The variant for apps that
            own <code>threadId</code>; this demo leaves the id to the shared
            configuration, so the two cannot share one mount.
          </li>
          <li>
            <strong>Hiding the built-in New Conversation controls</strong> via
            CSS parts, and <strong>pointing the drawer at another agent</strong>{" "}
            with its <code>agentId</code> prop. This demo keeps both built-in
            controls and passes <code>agentId</code> on the configuration
            provider, which the page lists as the second place it looks.
          </li>
        </ul>
        <div className="space-y-4">
          <CodeBlock code={SIDEBAR_HOST} language="tsx" />
          <CodeBlock code={CONTROLLED_CHAT} language="tsx" />
          <CodeBlock code={HIDE_BUILTIN_NEW} language="css" />
          <CodeBlock code={AGENT_PROP} language="tsx" />
        </div>
      </Panel>

      <Panel
        title="The runtime half"
        description="Threads are server-side, so the drawer is only as real as the runtime behind it."
      >
        <SourceCode file="frontend/src/app/api/copilotkit/[[...slug]]/route.ts" />
      </Panel>

      <Panel title="Doc-vs-implementation notes">
        <ul className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            The doc&apos;s sample nests a <code>CopilotKitProvider</code>{" "}
            because it is a whole page. This app already mounts one at the
            root. The page no longer passes <code>publicLicenseKey</code> on the
            provider; its new &quot;Intelligence access&quot; section puts the
            credential on the runtime, which is where this repo already had it.
          </li>
          <li>
            The demo adds the page&apos;s own <code>NewConversationButton</code>{" "}
            in a header above the chat, verbatim. It calls{" "}
            <code>startNewThread()</code> on the shared configuration, the same
            function the drawer&apos;s own row calls.
          </li>
          <li>
            One presentational change. The doc wraps both components in{" "}
            <code>display: flex</code> with the chat as a bare child; in a flex
            row <code>CopilotChat</code> has no basis of its own and collapses to
            min-content, rendering one word per line beside a full-width drawer.
            The demo adds <code>flex: 1</code> and <code>minWidth: 0</code> —
            the second matters because a flex item&apos;s default{" "}
            <code>min-width: auto</code> refuses to shrink below its content.
          </li>
          <li>
            Rename is absent from the drawer&apos;s row menu by design — the
            page says so and points at{" "}
            <Link
              href="/headless-threads"
              className="text-[var(--accent)] underline underline-offset-4"
            >
              Headless Threads
            </Link>{" "}
            for it. That is the main reason the doc gives for going headless,
            and it is why both routes exist here.
          </li>
        </ul>
      </Panel>
    </>
  );
}
