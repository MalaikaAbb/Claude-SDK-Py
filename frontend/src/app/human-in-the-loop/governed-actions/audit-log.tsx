"use client";

import { useEffect, useState } from "react";

/**
 * The server's record of every governed action: proposal, verdict, the user's
 * decision and what actually ran. This is the page's last guardrail ("log
 * proposal, verdict, user decision, and execution result"), made visible.
 *
 * Polls `/api/governance/audit`, which proxies the agent server's
 * `GET /governance/audit`. Since the data comes from the backend, a row
 * marked `executed` means the side effect ran on the server, not just that the
 * card said so.
 */

type ActionRow = {
  id: string;
  reference: string;
  tool: string;
  summary: string;
  verdict: string;
  status: string;
  reason: string;
};

type AuditRow = {
  at: string;
  reference: string;
  tool: string;
  stage: string;
  detail: string;
};

type Snapshot = { actions: ActionRow[]; audit: AuditRow[] };

const STATUS_TONE: Record<string, string> = {
  executed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  approved: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
  denied: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  rejected: "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  cancelled: "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
};

export function AuditLog() {
  const [data, setData] = useState<Snapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/governance/audit", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = (await res.json()) as Snapshot;
        if (alive) {
          setData(body);
          setError(null);
        }
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : String(err));
      }
    };
    void load();
    const timer = setInterval(load, 1500);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <aside
      data-testid="governance-audit"
      className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto border-l border-slate-200 p-4 text-sm dark:border-slate-800"
    >
      <div>
        <h2 className="font-semibold text-slate-900 dark:text-slate-100">Server audit log</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Shared by both tabs. Policy: tickets and @acme.test mail run at once;
          outside mail and 11–30% discounts need approval; bigger discounts and
          record deletion are denied.
        </p>
        {error && <p className="mt-2 text-xs text-red-600">Backend unreachable: {error}</p>}
      </div>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</h3>
        {!data?.actions.length ? (
          <p className="text-xs text-slate-500">None yet.</p>
        ) : (
          <ul className="space-y-2">
            {[...data.actions].reverse().map((a) => (
              <li
                key={a.id}
                data-testid="governance-action-row"
                data-status={a.status}
                className="rounded-md border border-slate-200 p-2 dark:border-slate-800"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-slate-500">{a.reference}</span>
                  <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${STATUS_TONE[a.status] ?? ""}`}>
                    {a.status}
                  </span>
                </div>
                <p className="mt-1 text-slate-800 dark:text-slate-200">{a.summary}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {a.tool} · verdict {a.verdict} — {a.reason}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Events</h3>
        <ol className="space-y-1 font-mono text-xs text-slate-600 dark:text-slate-400">
          {[...(data?.audit ?? [])].reverse().map((row, i) => (
            <li key={`${row.at}-${i}`}>
              <span className="text-slate-400">{row.at.slice(11, 19)}</span> {row.reference}{" "}
              <span className="font-semibold">{row.stage}</span> {row.detail}
            </li>
          ))}
        </ol>
      </section>
    </aside>
  );
}
