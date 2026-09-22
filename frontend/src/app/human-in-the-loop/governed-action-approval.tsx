"use client";

import { useEffect } from "react";
import { useInterrupt } from "@copilotkit/react-core/v2";

export type GovernedAction = {
  id: string;
  summary: string;
  tool: string;
  reference: string;
  verdict: "allow" | "deny" | "require_approval";
  arguments: Record<string, unknown>;
};

export function GovernedActionApproval() {
  useInterrupt({
    render: ({ interrupt, resolve, cancel }) => {
      const action = interrupt?.metadata?.action as GovernedAction | undefined;

      if (!action) {
        return null;
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
  }, [action.id, action.verdict]);

  const status =
    action.verdict === "allow"
      ? "Allowed by policy"
      : action.verdict === "deny"
        ? "Blocked by policy"
        : "User approval required";

  return (
    <section className="rounded-lg border p-4 shadow-sm">
      <div className="space-y-1">
        <p className="text-sm font-medium">{status}</p>
        <h3 className="text-base font-semibold">{action.summary}</h3>
        <p className="text-sm text-muted-foreground">Tool: {action.tool}</p>
        <p className="text-sm text-muted-foreground">
          Reference: {action.reference}
        </p>
      </div>

      <pre className="mt-3 overflow-auto rounded bg-muted p-3 text-xs">
        {JSON.stringify(action.arguments, null, 2)}
      </pre>

      {action.verdict === "require_approval" && (
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onApprove}>
            Approve and run
          </button>
          <button type="button" onClick={onReject}>
            Reject
          </button>
        </div>
      )}
    </section>
  );
}
