"use client";

/**
 * The surface both State Streaming and State Rendering point at.
 *
 * Neither page publishes a component — they publish the `useAgent`
 * subscription and describe what it should drive ("the UI can watch the answer
 * assemble token-by-token", "a LIVE badge when the agent starts / stops").
 * This is that, minimally: the document text, and a badge driven by
 * `isRunning`.
 */
export function DocumentCanvas({
  document,
  isRunning,
}: {
  document: string;
  isRunning: boolean;
}) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-2.5 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          agent.state.document
        </h2>
        {isRunning ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-600" />
            Live
          </span>
        ) : (
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Idle
          </span>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {document ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800 dark:text-slate-200">
            {document}
            {isRunning && <span className="ml-0.5 animate-pulse">▊</span>}
          </p>
        ) : (
          <p className="pt-10 text-center text-sm italic text-slate-500">
            Ask the agent to write something. It should appear here as state,
            not as a chat message.
          </p>
        )}
      </div>
    </div>
  );
}
