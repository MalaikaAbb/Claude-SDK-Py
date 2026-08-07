"use client";

/**
 * The controls that feed the three context values.
 *
 * The page imports `ACTIVITIES` and `DemoLayout` from a `./demo-layout` it
 * never publishes, and seeds `recentActivity` with `ACTIVITIES[0]` and
 * `ACTIVITIES[2]`. Written here from those two facts and the three
 * `useAgentContext` descriptions.
 */

export const ACTIVITIES = [
  "Opened the Q3 pipeline report",
  "Commented on the Acme renewal thread",
  "Exported the churn dashboard to CSV",
  "Archived 12 stale opportunities",
];

const TIMEZONES = [
  "America/Los_Angeles",
  "America/New_York",
  "Europe/London",
  "Asia/Tokyo",
];

export function DemoLayout({
  userName,
  setUserName,
  userTimezone,
  setUserTimezone,
  recentActivity,
  setRecentActivity,
}: {
  userName: string;
  setUserName: (v: string) => void;
  userTimezone: string;
  setUserTimezone: (v: string) => void;
  recentActivity: string[];
  setRecentActivity: (v: string[]) => void;
}) {
  const toggle = (activity: string) =>
    setRecentActivity(
      recentActivity.includes(activity)
        ? recentActivity.filter((a) => a !== activity)
        : [...recentActivity, activity],
    );

  return (
    <main className="h-full overflow-y-auto p-10">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        What the agent can see
      </h1>
      <p className="mt-2 max-w-prose text-sm text-slate-600 dark:text-slate-400">
        These three values are published with <code>useAgentContext</code>. The
        agent reads them on every turn and has no way to change them — there is
        no setter and no tool. Edit anything here, then ask the chat about it.
      </p>

      <div className="mt-6 max-w-lg space-y-5">
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Display name
          </span>
          <input
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
        </label>

        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Timezone
          </span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {TIMEZONES.map((tz) => (
              <button
                key={tz}
                type="button"
                onClick={() => setUserTimezone(tz)}
                className={`rounded-full border px-2.5 py-1 text-xs ${
                  userTimezone === tz
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                    : "border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"
                }`}
              >
                {tz}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Recent activity
          </span>
          <ul className="mt-1.5 space-y-1.5">
            {ACTIVITIES.map((activity) => (
              <li key={activity}>
                <label className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={recentActivity.includes(activity)}
                    onChange={() => toggle(activity)}
                    className="mt-0.5"
                  />
                  <span>{activity}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
