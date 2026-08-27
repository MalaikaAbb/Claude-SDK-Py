import { Callout } from "@/components/ui";

/**
 * The shared precondition for every Rich Threads route.
 *
 * Threads are not a client feature: they are stored and synced by CopilotKit
 * Intelligence, so all three routes fail the same way when the runtime has no
 * key — chat keeps working and the thread list is simply empty or locked. This
 * says so once, in the same words, on each of them.
 */
export function IntelligenceNotice() {
  return (
    <Callout tone="premium" title="Needs CopilotKit Intelligence — and two credentials, not one">
      <p className="leading-relaxed">
        Threads are stored server-side, so this route does nothing useful until
        the runtime is connected. Set{" "}
        <code>INTELLIGENCE_API_KEY</code> in{" "}
        <code>frontend/.env.local</code> and restart. Without it the runtime
        falls back to SSE with an in-memory runner: chat still works on every
        route in this harness, and the thread list has nothing to list.
      </p>
      <p className="mt-2 leading-relaxed">
        <code>COPILOTKIT_LICENSE_TOKEN</code> is a{" "}
        <strong>separate</strong> credential and is what unlocks the UI.
        The API key is what makes threads <em>work</em>; the licence is what{" "}
        <code>/info</code> reports a status from, and{" "}
        <code>&lt;CopilotThreadsDrawer&gt;</code> renders its locked view unless
        that status is valid. A runtime can therefore serve threads perfectly
        while every drawer in the app shows a locked panel. Set both.
      </p>
      <p className="mt-2 leading-relaxed">
        Free developer accounts cover both — this repo has no mocked-out
        substitute, because a faked thread list would be a false pass.
      </p>
      <p className="mt-2 leading-relaxed">
        <strong>Turning Intelligence on makes every run in the harness depend
        on a WebSocket.</strong> <code>IntelligenceAgentRunner</code> opens a
        Phoenix socket per run and joins{" "}
        <code>ingestion:&#123;runId&#125;</code>, so if{" "}
        <code>wss://realtime.intelligence.copilotkit.ai</code> cannot be joined,
        runs fail with <em>Timed out joining channel</em> — on every route, not
        just these three. There is no opt-out: the runtime options are a union,
        and the Intelligence variant has no <code>runner</code> field. Unset{" "}
        <code>INTELLIGENCE_API_KEY</code> to fall back to SSE if you need chat
        back.
      </p>
    </Callout>
  );
}

/**
 * The other precondition, and the one that is easy to get wrong.
 *
 * All three Rich Threads routes are views of one store, so they must name one
 * agent. Shown on each of them because the symptom of getting it wrong — three
 * lists that never agree — looks like a sync bug rather than a config mistake.
 */
export function SharedThreadStoreNotice() {
  return (
    <Callout tone="info" title="All three routes share one agent, on purpose">
      <p className="leading-relaxed">
        <code>useThreads(&#123; agentId &#125;)</code> puts that id into the
        thread store&apos;s fetch context, so <strong>the thread list is scoped
        per agent</strong>. Point these three routes at three different agents
        and you get three disjoint lists: a conversation started in the drawer
        never appears in the headless list, and the Lifecycle page&apos;s
        &quot;known conversation&quot; picker stays empty because nothing was
        ever created under its agent.
      </p>
      <p className="mt-2 leading-relaxed">
        They therefore all use <code>agentId=&quot;threads&quot;</code>. That is
        also what makes the three pages worth reading together — start a
        conversation in the drawer, rename it from the headless list, then open
        it from the Lifecycle picker.
      </p>
    </Callout>
  );
}
