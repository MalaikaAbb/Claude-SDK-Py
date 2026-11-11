import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const DIR = "frontend/src/app/human-in-the-loop/governed-actions";

// The page's server-side resume check, verbatim. Not run: it calls
// `executeSideEffect`, which the page never defines, and there is no backend
// it belongs to.
const HANDLE_APPROVAL = `type ApprovalResponse = {
  approved: boolean;
  actionId: string;
  reference: string;
};

async function handleApproval(action: GovernedAction, response: ApprovalResponse) {
  if (
    response.approved &&
    response.actionId === action.id &&
    response.reference === action.reference
  ) {
    return executeSideEffect(action.tool, action.arguments);
  }

  return {
    skipped: true,
    reason: "The user did not approve this action.",
  };
}`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/human-in-the-loop/governed-actions" />

      <Callout tone="warn" title="Only the tool-call half can run, and its verdicts are the model's">
        <p className="leading-relaxed">
          The page publishes frontend code only: a <code>GovernedAction</code>{" "}
          envelope, a <code>useInterrupt</code> card and a{" "}
          <code>useHumanInTheLoop</code> tool. No agent, policy engine, emitter
          of <code>interrupt.metadata.action</code>, or{" "}
          <code>executeSideEffect</code> is printed. The agent here is the
          Quickstart adapter with its default prompt. The tool-call variant
          works mechanically, but <code>verdict</code>, <code>reference</code>{" "}
          and <code>id</code> are whatever Claude writes. The interrupt variant
          never shows: nothing emits an interrupt, and the Claude adapter&apos;s
          real interrupts (for <code>defer_tools</code>) carry{" "}
          <code>&#123; source, toolName, input &#125;</code>, not{" "}
          <code>metadata.action</code>. Not yet checked in a browser.
        </p>
      </Callout>

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A checkpoint in front of an action with side effects. The UI gets a
          small envelope (what, which tool, which policy reference, the
          verdict, the exact arguments) and acts on the verdict: run it, block
          it, or ask the user. The page shows two ways to raise it: an
          interrupt the run pauses on, or a frontend tool the model calls.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Before you apply a 15% discount to order 1042, ask me to approve it with approve_governed_action (verdict require_approval).",
            ]}
            expect="An approval card with the summary, tool, reference and arguments, and Approve and run / Reject buttons. Clicking one sends { approved, actionId, reference } back and the agent replies accordingly."
            fail="No card: Claude answered in text instead of calling the tool. A card that appears but does nothing on click means respond was not called."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCodeGroup
          files={[
            { file: `${DIR}/demo-chat/page.tsx` },
            { file: `${DIR}/governed-action-tool.tsx` },
            { file: `${DIR}/governed-action-approval.tsx` },
          ]}
          note="The chat, then the page's two variants verbatim (exports and the shared card import added)."
        />
      </Panel>

      <Panel title="Published but not run" description="The server-side check on resume.">
        <CodeBlock code={HANDLE_APPROVAL} filename="handleApproval" language="ts" />
      </Panel>

      <Panel title="The agent">
        <SourceCode file="backend/src/agents/registry.py" region="registry" />
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          <code>governed-actions</code> is <code>_plain(...)</code>: the
          Quickstart adapter and prompt, no tools. The approval tool reaches it
          from the browser on each run.
        </p>
      </Panel>
    </>
  );
}
