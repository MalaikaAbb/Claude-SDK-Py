"use client";

/**
 * Live delegation log — renders the `delegations` slot of agent state.
 *
 * Each entry corresponds to one invocation of a sub-agent. The list
 * grows in real time as the supervisor fans work out to its children.
 * The parent header shows how many sub-agents have been called and
 * whether the supervisor is still running.
 *
 * Published in full on the page and reproduced here, with two changes:
 * `SUB_AGENT_STYLE` and the `SubAgentName` / `DelegationLogProps` types are
 * used by the published component and declared nowhere, so they are written
 * out below.
 */

export type SubAgentName = "research_agent" | "writing_agent" | "critique_agent";

export interface Delegation {
  id: string;
  sub_agent: SubAgentName;
  task: string;
  result: string;
  status: string;
}

export interface DelegationLogProps {
  delegations: Delegation[];
  isRunning: boolean;
}

const SUB_AGENT_STYLE: Record<
  SubAgentName,
  { emoji: string; label: string; color: string }
> = {
  research_agent: {
    emoji: "🔎",
    label: "research",
    color: "border-sky-300 text-sky-800 dark:border-sky-800 dark:text-sky-200",
  },
  writing_agent: {
    emoji: "✍️",
    label: "writing",
    color:
      "border-violet-300 text-violet-800 dark:border-violet-800 dark:text-violet-200",
  },
  critique_agent: {
    emoji: "🧐",
    label: "critique",
    color:
      "border-amber-300 text-amber-800 dark:border-amber-800 dark:text-amber-200",
  },
};

// Fixed list of the three sub-agent roles the supervisor can call.
// Rendered as always-visible indicator chips at the top of the log
// (regardless of whether the supervisor has delegated yet) so the user
// can see at a glance which sub-agents exist and which are currently active.
const INDICATOR_ROLES: ReadonlyArray<{
  role: "researcher" | "writer" | "critic";
  subAgent: SubAgentName;
}> = [
  { role: "researcher", subAgent: "research_agent" },
  { role: "writer", subAgent: "writing_agent" },
  { role: "critic", subAgent: "critique_agent" },
];

export function DelegationLog({ delegations, isRunning }: DelegationLogProps) {
  const calledRoles = new Set<SubAgentName>(delegations.map((d) => d.sub_agent));

  return (
    <div
      data-testid="delegation-log"
      className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-3 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Sub-agent delegations
          </span>
          {isRunning && (
            <span
              data-testid="supervisor-running"
              className="inline-flex items-center gap-1.5 rounded-full border border-indigo-300 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-900 dark:border-indigo-800 dark:text-slate-100"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
              Supervisor running
            </span>
          )}
        </div>
        <span
          data-testid="delegation-count"
          className="font-mono text-xs text-slate-500"
        >
          {delegations.length} calls
        </span>
      </div>

      <div
        data-testid="subagent-indicators"
        className="flex items-center gap-2 border-b border-slate-200 bg-white px-6 py-2 dark:border-slate-800 dark:bg-slate-900"
      >
        {INDICATOR_ROLES.map(({ role, subAgent }) => {
          const style = SUB_AGENT_STYLE[subAgent];
          const fired = calledRoles.has(subAgent);
          return (
            <span
              key={role}
              data-testid={`subagent-indicator-${role}`}
              data-role={role}
              data-fired={fired ? "true" : "false"}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${style.color} ${
                fired ? "" : "opacity-60"
              }`}
            >
              <span aria-hidden>{style.emoji}</span>
              <span>{style.label}</span>
            </span>
          );
        })}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {delegations.length === 0 ? (
          <p className="text-sm italic text-slate-500">
            Ask the supervisor to complete a task. Every sub-agent it calls will
            appear here.
          </p>
        ) : (
          delegations.map((d, idx) => {
            const style = SUB_AGENT_STYLE[d.sub_agent];
            return (
              <div
                key={d.id}
                data-testid="delegation-entry"
                className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400">
                      #{idx + 1}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${style.color}`}
                    >
                      <span>{style.emoji}</span>
                      <span>{style.label}</span>
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-400">
                    {d.status}
                  </span>
                </div>
                <div className="mb-2 text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    Task:{" "}
                  </span>
                  {d.task}
                </div>
                <div className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
                  {d.result}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
