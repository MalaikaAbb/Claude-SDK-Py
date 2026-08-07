"use client";

import { useState } from "react";

/**
 * The picker the agent's `book_call` tool call renders.
 *
 * The page passes it `topic`, `attendee`, `slots`, `status` and `onSubmit`, and
 * imports a `TimeSlot` type from it — but never publishes the component. Written
 * here from those five props.
 *
 * The buttons gate on the local `picked` value rather than on `status`, so the
 * card cannot resolve the tool call twice even in the window before `status`
 * catches up.
 */

export interface TimeSlot {
  label: string;
  iso: string;
}

export function TimePickerCard({
  topic,
  attendee,
  slots,
  onSubmit,
}: {
  topic: string;
  attendee?: string;
  slots: TimeSlot[];
  status?: string;
  onSubmit: (result: string) => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);

  const choose = (slot: TimeSlot) => {
    if (picked) return;
    setPicked(slot.label);
    onSubmit(slot.iso);
  };

  return (
    <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        {topic}
      </p>
      {attendee && (
        <p className="mt-0.5 text-xs text-slate-500">with {attendee}</p>
      )}

      {picked ? (
        <p className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
          Booked for {picked}. The agent has the answer.
        </p>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {slots.map((slot) => (
            <button
              key={slot.iso}
              type="button"
              onClick={() => choose(slot)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] dark:border-slate-700 dark:text-slate-200"
            >
              {slot.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
