import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/human-in-the-loop/governed-actions" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A gate in front of every side effect the agent can cause. The agent
          only ever <em>proposes</em> an action; a server-side policy gives it a
          verdict — <code>allow</code>, <code>deny</code> or{" "}
          <code>require_approval</code> — and only the last one shows the user a
          card with the exact arguments. The page offers two ways to show that
          card, and the demo has one tab for each: <code>useInterrupt</code>{" "}
          (the run ends paused and resumes with the answer) and{" "}
          <code>useHumanInTheLoop</code> (the approval is a browser tool call).
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Email the Q3 pricing sheet to dana@globex.com.",
              "Give Initech a 20% discount on their next invoice.",
              "Open a high-priority ticket: the checkout page is down.",
              "Delete customer record CUST-4471.",
            ]}
            expect="The first two show a 'User approval required' card with a GOV-#### reference and the JSON arguments. Approve and run: the audit log row turns 'executed' and the agent confirms. Reject: the row turns 'rejected' and nothing runs. The ticket executes with no card; the deletion is 'denied' and the agent explains why."
            fail="The agent claims it sent the email with no card and no 'executed' row (it skipped the gate); the card appears but approving does nothing (resume/respond never reached the backend); or the audit panel says 'Backend unreachable'."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/human-in-the-loop/governed-actions/demo-chat/page.tsx" />
      </Panel>

      <Panel title="The envelope and the card" description="Shared by both tabs. The page's code, restyled for this app's theme.">
        <SourceCode file="frontend/src/app/human-in-the-loop/governed-actions/governed-action.tsx" />
      </Panel>

      <Panel
        title="Server policy and handleApproval"
        description="Repo-authored. The page lists these guardrails but publishes no backend code for them."
      >
        <SourceCode file="backend/src/agents/governance.py" region="policy" />
        <div className="mt-4">
          <SourceCode file="backend/src/agents/governance.py" region="handle-approval" />
        </div>
      </Panel>

      <Panel
        title="The interrupt bridge"
        description="Repo-authored. What makes useInterrupt work on ClaudeAgentAdapter."
      >
        <SourceCode file="backend/src/agents/governance_bridge.py" region="interrupt-stream" />
        <div className="mt-4">
          <SourceCode file="backend/src/agents/governance_bridge.py" region="resume" />
        </div>
      </Panel>

      <Panel title="Doc-vs-implementation notes">
        <Callout tone="warn" title="useInterrupt needs a backend the adapter is not">
          <p className="leading-relaxed">
            The v2 hook waits for <code>RUN_FINISHED</code> with{" "}
            <code>outcome.type === &quot;interrupt&quot;</code> and resumes by
            sending a <code>resume</code> array on the next run.{" "}
            <code>ClaudeAgentAdapter</code> does neither. It never pauses a run,
            and on the next run it forwards only the last message&apos;s text, so
            a bare resume would re-send the assistant&apos;s own words as a
            prompt. <code>governance_bridge.py</code> fills both gaps around{" "}
            <code>adapter.run</code>. It also strips its own resume note back out
            of the <code>RUN_STARTED</code> echo and the{" "}
            <code>MESSAGES_SNAPSHOT</code>, so the note never shows as a user
            message.
          </p>
        </Callout>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            <code>useInterrupt</code>&apos;s <code>render</code> is typed to
            return a <code>ReactElement</code>, so the page&apos;s{" "}
            <code>return null</code> does not compile. The demo returns an empty
            fragment. The hook also needs an <code>agentId</code> here, or it
            listens to the default agent.
          </li>
          <li>
            <code>useHumanInTheLoop</code> needs the explicit{" "}
            <code>&lt;GovernedAction&gt;</code> generic before{" "}
            <code>action=&#123;args&#125;</code> type-checks. This is the same
            gap as on the main Human in the Loop page.
          </li>
          <li>
            The page&apos;s <code>handleApproval</code> trusts the response it is
            handed. On the tool path, the model is what calls the backend next,
            so trusting its arguments would let it approve its own action. Here
            the backend reads the decision from the{" "}
            <code>approve_governed_action</code> tool result in the message
            history, and <code>execute_governed_action</code> takes only an id
            and a reference.
          </li>
          <li>
            In this design, <code>allow</code> and <code>deny</code> are
            settled on the server, so the interrupt tab only ever gets{" "}
            <code>require_approval</code> cards. The card&apos;s auto-approve and
            auto-block effects still run on the tool tab, where the model
            forwards every verdict.
          </li>
          <li>
            While an interrupt is open, the AG-UI client refuses any new run
            that does not answer it. Typing a new message before approving or
            rejecting fails with &quot;pending interrupt(s) not addressed by
            resume&quot;.
          </li>
          <li>
            On both tabs the card disappears once it is answered (the
            page&apos;s <code>status !== Executing</code> check and the hook
            clearing its pending interrupt). The audit log is the lasting
            record.
          </li>
        </ul>
      </Panel>
    </>
  );
}
