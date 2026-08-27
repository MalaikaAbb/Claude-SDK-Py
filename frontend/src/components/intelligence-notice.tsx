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
    </Callout>
  );
}
