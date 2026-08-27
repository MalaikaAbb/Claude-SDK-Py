import Link from "next/link";

import {
  IntelligenceNotice,
  SharedThreadStoreNotice,
} from "@/components/intelligence-notice";
import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/headless-threads" />

      <IntelligenceNotice />

      <SharedThreadStoreNotice />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The same thread store as the drawer, with the UI entirely yours.{" "}
          <code>useThreads</code> returns the list plus{" "}
          <code>renameThread</code>, <code>archiveThread</code>,{" "}
          <code>deleteThread</code>, <code>startNewThread</code> and the
          pagination trio. The list is sorted most-recently-updated first and
          stays in sync over a WebSocket, so a thread created in another tab
          appears here without polling.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Archive is a soft delete — the row is hidden from the default list but
          the thread survives, and <code>includeArchived: true</code> brings it
          back. Delete is permanent. Neither ships a confirmation dialog.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Send a message, then press Rename on the row.",
              "Archive it, then press New conversation and send another.",
            ]}
            expect="The row title becomes 'Renamed'. Archiving hides it. New conversation clears the chat to a welcome screen and the next message opens a second row."
            fail="If 'New conversation' appears to do nothing, the chat is reusing its mount-time id — see the note on the two-step reset below."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/headless-threads/demo-chat/page.tsx" />
      </Panel>

      <Panel title="The two things worth knowing">
        <ul className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            <strong>Rename is the reason this route exists.</strong> It is a{" "}
            <code>useThreads</code> action the prebuilt drawer&apos;s row menu
            does not surface, and the doc names it as the main motivation for
            building your own list.
          </li>
          <li>
            <strong>&quot;New conversation&quot; takes two steps, and the
            second one is a remount.</strong>{" "}
            <code>useThreads().startNewThread()</code> clears the list selection
            and nothing else — it never touches the chat&apos;s{" "}
            <code>threadId</code>. The chat&apos;s own setter lives on the
            configuration provider, which this route deliberately does not
            mount, and which would no-op anyway because the chat here is
            prop-controlled. Clearing the prop is not enough either: with no
            prop the chat falls back to an id minted with <code>useMemo</code>{" "}
            at mount, so it returns to the <em>same</em> id every time. Bumping
            a React <code>key</code> forces the remount that re-runs that memo.
            The{" "}
            <Link
              href="/threads-lifecycle"
              className="text-[var(--accent)] underline underline-offset-4"
            >
              Lifecycle page
            </Link>{" "}
            documents that remount behaviour as a footgun; here it is the
            mechanism.
          </li>
        </ul>
      </Panel>

      <Panel title="Doc-vs-implementation notes">
        <ul className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            The doc publishes <code>ThreadSidebar</code> and <code>App</code> as
            two separate fragments — the sidebar without the{" "}
            <code>onSelectThread</code> prop it is later called with, and the
            app without the new-thread handling. This route joins them and adds
            the two-step reset the drawer performs internally.
          </li>
          <li>
            Its runtime snippet uses a <code>verifyAppSession(request)</code>{" "}
            helper that is never defined, and throws on an unauthenticated
            request. That is the right shape for production; a local harness has
            no session, so this repo&apos;s <code>identifyUser</code> reads the
            demo identity headers the root provider sends.
          </li>
          <li>
            The page&apos;s &quot;Migrating existing history?&quot; callout
            links to Google ADK and LangGraph thread-import guides from a Claude
            page. There is no Claude equivalent listed.
          </li>
        </ul>
      </Panel>
    </>
  );
}
