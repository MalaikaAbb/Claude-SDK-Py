"use client";

import {
  CopilotChat,
  ToolCallStatus,
  useConfigureSuggestions,
  useHumanInTheLoop,
  useInterrupt,
} from "@copilotkit/react-core/v2";
import { useState } from "react";
import { z } from "zod";

import { DemoFrame } from "@/components/demo-frame";

import { AuditLog } from "../audit-log";
import { GovernedActionCard, type GovernedAction } from "../governed-action";

/** One agent per pattern, so each tab gets its own conversation and tools. */
const INTERRUPT_AGENT_ID = "governed-actions-interrupt";
const HITL_AGENT_ID = "governed-actions-hitl";

type Mode = "interrupt" | "hitl";

const TABS: { mode: Mode; label: string; agentId: string }[] = [
  { mode: "interrupt", label: "Inline approval · useInterrupt", agentId: INTERRUPT_AGENT_ID },
  { mode: "hitl", label: "Tool-call approval · useHumanInTheLoop", agentId: HITL_AGENT_ID },
];

const SUGGESTIONS = [
  {
    title: "Email a customer (needs approval)",
    message: "Email the Q3 pricing sheet to dana@globex.com.",
  },
  {
    title: "20% discount (needs approval)",
    message: "Give Initech a 20% discount on their next invoice.",
  },
  {
    title: "Open a ticket (allowed)",
    message: "Open a high-priority ticket: the checkout page is down.",
  },
  {
    title: "Delete a record (denied)",
    message: "Delete customer record CUST-4471.",
  },
];

/**
 * Both of the page's approval patterns, one per tab, over one server policy.
 *
 * The side panel is the server's audit log, which both tabs write to — it is
 * how you tell "the card said approved" apart from "the side effect ran".
 */
export default function Page() {
  const [mode, setMode] = useState<Mode>("interrupt");
  const active = TABS.find((t) => t.mode === mode)!;

  return (
    <DemoFrame
      parentPath="/human-in-the-loop/governed-actions"
      subtitle={`agent: ${active.agentId}`}
    >
      <div className="grid h-full grid-cols-1 md:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-h-0 flex-col">
          <div role="tablist" className="flex shrink-0 gap-1 border-b border-slate-200 px-3 pt-2 dark:border-slate-800">
            {TABS.map((tab) => (
              <button
                key={tab.mode}
                role="tab"
                type="button"
                aria-selected={tab.mode === mode}
                data-testid={`governed-tab-${tab.mode}`}
                onClick={() => setMode(tab.mode)}
                className={`rounded-t-md border-b-2 px-3 py-1.5 text-sm ${
                  tab.mode === mode
                    ? "border-[var(--accent)] font-medium text-slate-900 dark:text-slate-100"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1">
            {/* Keyed so switching tabs mounts a fresh chat and only that tab's hook. */}
            {mode === "interrupt" ? <InterruptChat key="interrupt" /> : <HitlChat key="hitl" />}
          </div>
        </div>
        <div className="hidden min-h-0 md:block">
          <AuditLog />
        </div>
      </div>
    </DemoFrame>
  );
}

function InterruptChat() {
  useConfigureSuggestions({ suggestions: SUGGESTIONS, available: "always" });
  return (
    <>
      <GovernedActionApproval />
      <CopilotChat agentId={INTERRUPT_AGENT_ID} className="h-full" />
    </>
  );
}

function HitlChat() {
  useConfigureSuggestions({ suggestions: SUGGESTIONS, available: "always" });
  return (
    <>
      <GovernedActionTool />
      <CopilotChat agentId={HITL_AGENT_ID} className="h-full" />
    </>
  );
}

//#region use-interrupt
/**
 * The page's inline-approval block. Three changes, all forced:
 *   - `agentId` is passed. Without it the hook binds to the default agent,
 *     not the one this tab's chat runs.
 *   - The missing-action branch returns an empty fragment, not `null`:
 *     `render` is typed to return a `ReactElement`.
 *   - The page's `as GovernedAction` cast is kept, but on a value typed
 *     `unknown`, so it goes through `unknown` explicitly.
 */
function GovernedActionApproval() {
  useInterrupt({
    agentId: INTERRUPT_AGENT_ID,
    render: ({ interrupt, resolve, cancel }) => {
      const action = interrupt?.metadata?.action as unknown as GovernedAction | undefined;

      if (!action) {
        return <></>;
      }

      return (
        <GovernedActionCard
          action={action}
          onApprove={() =>
            resolve({
              approved: true,
              actionId: action.id,
              reference: action.reference,
            })
          }
          onReject={() =>
            resolve({
              approved: false,
              actionId: action.id,
              reference: action.reference,
            })
          }
          onBlock={() => cancel()}
        />
      );
    },
  });

  return null;
}
//#endregion

//#region use-human-in-the-loop
const governedActionSchema = z.object({
  id: z.string(),
  summary: z.string(),
  tool: z.string(),
  reference: z.string(),
  verdict: z.enum(["allow", "deny", "require_approval"]),
  arguments: z.record(z.unknown()),
});

/**
 * The page's tool-call approval block, plus `agentId` and the explicit
 * generic — `useHumanInTheLoop` does not infer `args` from `parameters`
 * (README §9.16), so without it `action={args}` does not type-check.
 */
function GovernedActionTool() {
  useHumanInTheLoop<GovernedAction>(
    {
      agentId: HITL_AGENT_ID,
      name: "approve_governed_action",
      description:
        "Ask the user to approve a governed side-effect action before it runs.",
      parameters: governedActionSchema,
      render: ({ args, status, respond }) => {
        if (status !== ToolCallStatus.Executing || !respond) {
          return null;
        }

        return (
          <GovernedActionCard
            action={args}
            onApprove={() =>
              respond({
                approved: true,
                actionId: args.id,
                reference: args.reference,
              })
            }
            onReject={() =>
              respond({
                approved: false,
                actionId: args.id,
                reference: args.reference,
              })
            }
            onBlock={() =>
              respond({
                approved: false,
                actionId: args.id,
                reference: args.reference,
              })
            }
          />
        );
      },
    },
    [],
  );

  return null;
}
//#endregion
