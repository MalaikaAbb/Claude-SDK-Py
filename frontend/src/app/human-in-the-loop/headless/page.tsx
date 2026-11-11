import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { Callout, Panel } from "@/components/ui";

/**
 * Reference-only. The page's single code block is missing from the rendered
 * page for this framework, and it publishes no agent, so there is nothing to
 * run. See README §9.24.
 */
export default function Page() {
  const link = "text-[var(--accent)] underline underline-offset-4";
  return (
    <>
      <RouteHeader path="/human-in-the-loop/headless" />

      <Callout tone="warn" title="Broken as published: the page has no code for this framework">
        <p className="leading-relaxed">
          The rendered page puts its one snippet, the headless Promise-based
          primitives, where a source region called{" "}
          <code>headless-promise-primitives</code> should be, and that region is
          missing for <code>claude-sdk-python</code>. No agent, runtime or
          component is printed anywhere else on the page. Nothing is written in
          its place, so this route has no demo.
        </p>
      </Callout>

      <Panel title="What the page describes">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Resolving a pause without a chat render slot. For this framework the
          page swaps the interrupt for a <code>useFrontendTool</code> whose
          handler puts its pending payload in React state, keeps each
          tool call&apos;s <code>resolve</code> in a ref keyed by tool-call id,
          and returns <code>render: () =&gt; null</code>, so a separate part of
          the app shows the picker and settles the Promise. It recommends this
          for tests, dashboards and debugging.
        </p>
      </Panel>

      <Panel title="Where to look instead">
        <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            <Link href="/human-in-the-loop/useInterrupt" className={link}>
              Pausing the Agent for Input
            </Link>{" "}
            is the render-prop version, and is missing the same frontend
            snippet.
          </li>
          <li>
            <Link href="/human-in-the-loop" className={link}>
              HITL Overview
            </Link>{" "}
            runs the one Promise-based pause this framework does publish:{" "}
            <code>useHumanInTheLoop</code> with a time picker.
          </li>
        </ul>
      </Panel>
    </>
  );
}
