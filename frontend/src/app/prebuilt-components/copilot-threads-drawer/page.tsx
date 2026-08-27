import Link from "next/link";

import { IntelligenceNotice } from "@/components/intelligence-notice";
import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/prebuilt-components/copilot-threads-drawer" />

      <IntelligenceNotice />

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
            ]}
            expect="Two rows in the drawer, auto-named by the LLM after the first message. Clicking a row replays that conversation into the chat."
            fail="A locked 'Threads are a CopilotKit Intelligence feature' panel means no valid licence token. An empty list with a working chat means the API key is missing — see the notice above."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/prebuilt-components/copilot-threads-drawer/demo-chat/page.tsx" />
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
            The doc&apos;s sample nests a <code>CopilotKitProvider</code> with{" "}
            <code>publicLicenseKey=&quot;ck_pub_…&quot;</code> because it is a
            whole page. This app already mounts one at the root, and it sets the
            licence on the <em>runtime</em> instead — a{" "}
            <code>publicLicenseKey</code> is a browser-visible credential, and
            keeping it server-side is the safer default for a repo people clone.
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
