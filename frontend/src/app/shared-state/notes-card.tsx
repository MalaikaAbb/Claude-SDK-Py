"use client";

/**
 * The read side of shared state, published in full on the page.
 *
 * Copied with its shadcn wrappers (`Card`, `CardHeader`, `CardTitle`,
 * `CardDescription`, `CardContent`, `Button`) flattened into the plain elements
 * they render — the page imports all six and publishes none of them, and the
 * component is otherwise unchanged, `data-testid`s included.
 *
 * The comment is the doc's.
 */

// Read-side render: this card reflects the agent-authored `notes` slice
// of shared state. The parent page passes `state.notes` in; we never
// touch agent state ourselves — we just render it. The Clear button is
// a small write-back, exposed as an `onClear` prop.

export interface NotesCardProps {
  notes: string[];
  onClear: () => void;
}

export function NotesCard({ notes, onClear }: NotesCardProps) {
  return (
    <div
      data-testid="notes-card"
      className="w-full rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Agent Scratch pad
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The agent writes here through its state tool. The UI re-renders
              from shared state.
            </p>
          </div>
          {notes.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              data-testid="notes-clear-button"
              className="shrink-0 rounded-md bg-rose-600 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="p-5">
        {notes.length === 0 ? (
          <div
            data-testid="notes-empty"
            className="flex min-h-[160px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm italic text-slate-500 dark:border-slate-700 dark:bg-slate-950"
          >
            the agent will make observations about you and note them here!
          </div>
        ) : (
          <ul
            data-testid="notes-list"
            className="space-y-2 text-sm text-slate-900 dark:text-slate-100"
          >
            {notes.map((note, i) => (
              <li
                key={i}
                data-testid="note-item"
                className="flex gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950"
              >
                <span className="select-none font-mono text-xs leading-5 text-slate-400">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1">{note}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
