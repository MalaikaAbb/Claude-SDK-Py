"use client";

/**
 * The wildcard renderer, for every tool without a named one.
 *
 * The page passes `name`, `parameters`, `status` and `result` to a
 * `CustomCatchallRenderer` it never publishes, and imports a
 * `CatchallToolStatus` type it never declares. Both are written here from those
 * call sites.
 */

export type CatchallToolStatus = "inProgress" | "executing" | "complete";

export function CustomCatchallRenderer({
  name,
  parameters,
  status,
  result,
}: {
  name: string;
  parameters?: unknown;
  status: CatchallToolStatus;
  result?: unknown;
}) {
  const done = status === "complete";

  return (
    <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-3 font-mono text-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {name}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${
            done
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
              : "animate-pulse bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
          }`}
        >
          {done ? "Done" : "Running"}
        </span>
      </div>
      <Block label="args" value={parameters} />
      {done && <Block label="result" value={result} />}
    </div>
  );
}

function Block({ label, value }: { label: string; value: unknown }) {
  if (value === undefined || value === null) return null;
  return (
    <details className="mt-2">
      <summary className="cursor-pointer text-slate-500">{label}</summary>
      <pre className="mt-1 overflow-x-auto rounded bg-slate-50 p-2 text-[11px] text-slate-700 dark:bg-slate-950 dark:text-slate-300">
        {typeof value === "string" ? value : JSON.stringify(value, null, 2)}
      </pre>
    </details>
  );
}
