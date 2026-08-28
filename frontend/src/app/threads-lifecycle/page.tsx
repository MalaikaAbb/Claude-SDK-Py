import Link from "next/link";

import {
  IntelligenceNotice,
  SharedThreadStoreNotice,
} from "@/components/intelligence-notice";
import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/threads-lifecycle" />

      <IntelligenceNotice />

      <SharedThreadStoreNotice />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Where a <code>threadId</code> comes from and what moves it. The
          lifecycle is four beats — <strong>mint</strong> on mount when none is
          supplied, <strong>run</strong> under that id, <strong>hydrate</strong>{" "}
          by replaying persisted history when the id is known, and{" "}
          <strong>switch or start</strong>. This route puts the live id on
          screen so you can watch each transition.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The <code>explicit</code> flag is the subtle part.{" "}
          <code>setActiveThreadId(id, &#123; explicit: true &#125;)</code>{" "}
          treats the id as a known thread and replays its history;{" "}
          <code>explicit: false</code> sets the same id but shows the welcome
          screen. Both buttons are on the demo so the difference is one click
          apart.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Send a message, press New chat, and watch threadId change.",
              "Pick the first conversation and press Open conversation, then Set id, no replay.",
            ]}
            expect="threadId changes on New chat and explicit flips to false. Open conversation replays the history; Set id, no replay shows the same id with a welcome screen."
            fail="If the buttons log a warning and nothing moves, something is passing an authoritative threadId prop — the setters no-op when the id is prop-controlled."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/threads-lifecycle/demo-chat/page.tsx" />
      </Panel>

      <Panel title="Pick one source of truth">
        <Callout tone="warn">
          <p className="leading-relaxed">
            The setters <strong>no-op and log a warning</strong> when the{" "}
            <code>threadId</code> is prop-controlled. So you drive threads
            imperatively with the configuration setters, or declaratively with a{" "}
            <code>threadId</code> prop — never both.
          </p>
          <p className="mt-2 leading-relaxed">
            This harness has one route on each side of that rule, deliberately.
            This one passes no prop and uses the setters;{" "}
            <Link
              href="/headless-threads"
              className="text-[var(--accent)] underline underline-offset-4"
            >
              Headless Threads
            </Link>{" "}
            passes the prop and keeps the id in React state. Reading them
            together is the clearest way to see why mixing the two produces a
            dead button.
          </p>
        </Callout>
      </Panel>

      <Panel title="Doc-vs-implementation notes">
        <ul className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            <strong>Replay needs a store, and the client cannot tell you it is
            missing.</strong> Hydration calls <code>connectAgent()</code>, which
            replays whatever the server holds. With no persistence layer that
            returns an empty stream and the conversation just starts blank — so
            a history bug here is almost always a runtime configuration
            problem, not client code.
          </li>
          <li>
            The page is explicit that v2 has no <code>useCopilotChat</code> hook
            and no <code>initialMessages</code> prop. Manual hydration is{" "}
            <code>agent.setMessages(...)</code> read off{" "}
            <code>useAgent()</code>.
          </li>
          <li>
            Its auto-mint warning is the one this harness leans on elsewhere:
            the fallback id is computed with <code>useMemo</code>, so any
            remount — a changed React <code>key</code>, a parent unmount, or
            StrictMode&apos;s double-mount in dev — silently starts a new
            conversation. Headless Threads turns that into its reset mechanism.
          </li>
          <li>
            Sections this route does not implement: scoping threads to a
            signed-in user (needs a real auth session), creating a thread from
            your own API on the first message, and the framework-checkpointer
            comparison. All three are production concerns rather than something
            a local harness can demonstrate honestly.
          </li>
        </ul>
      </Panel>
    </>
  );
}
