"use client";

import { useEffect } from "react";

/**
 * The page's action envelope and approval card, shared by both patterns.
 *
 * `GovernedAction` and `GovernedActionCard` are the page's, verbatim, with two
 * cosmetic changes: `text-muted-foreground` and `bg-muted` are shadcn tokens
 * this app does not define, so they became slate utilities, and the two
 * buttons got visible styling (the page leaves them unstyled).
 *
 * The verdict never comes from the model. The backend's policy
 * (`backend/src/agents/governance.py`) sets it before the card ever sees it.
 */

export type GovernedAction = {
  id: string;
  summary: string;
  tool: string;
  reference: string;
  verdict: "allow" | "deny" | "require_approval";
  arguments: Record<string, unknown>;
};

export function GovernedActionCard({
  action,
  onApprove,
  onReject,
  onBlock,
}: {
  action: GovernedAction;
  onApprove: () => void;
  onReject: () => void;
  onBlock: () => void;
}) {
  useEffect(() => {
    if (action.verdict === "allow") onApprove();
    if (action.verdict === "deny") onBlock();
    // The page keys this on the action alone, so a re-render with fresh
    // callbacks cannot fire the auto-decision twice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action.id, action.verdict]);

  const status =
    action.verdict === "allow"
      ? "Allowed by policy"
      : action.verdict === "deny"
        ? "Blocked by policy"
        : "User approval required";

  return (
    <section
      data-testid="governed-action-card"
      data-verdict={action.verdict}
      className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="space-y-1">
        <p className="text-sm font-medium text-amber-700 dark:text-amber-300">{status}</p>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          {action.summary}
        </h3>
        <p className="text-sm text-slate-500">Tool: {action.tool}</p>
        <p className="text-sm text-slate-500">Reference: {action.reference}</p>
      </div>

      <pre className="mt-3 overflow-auto rounded bg-slate-100 p-3 text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200">
        {JSON.stringify(action.arguments, null, 2)}
      </pre>

      {action.verdict === "require_approval" && (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onApprove}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Approve and run
          </button>
          <button
            type="button"
            onClick={onReject}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-800 hover:border-red-400 hover:text-red-700 dark:border-slate-700 dark:text-slate-200"
          >
            Reject
          </button>
        </div>
      )}
    </section>
  );
}
