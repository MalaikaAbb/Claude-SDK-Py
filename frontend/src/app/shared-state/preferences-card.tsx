"use client";

/**
 * The write side of shared state.
 *
 * The page shows the `handlePreferencesChange` callback and the `Preferences`
 * type it takes, but never the editor that calls it. This is that editor, built
 * from the four keys the backend's `build_preferences_block` reads: `name`,
 * `tone`, `language`, `interests`.
 */

export interface Preferences {
  name?: string;
  tone?: string;
  language?: string;
  interests?: string[];
}

const TONES = ["friendly", "formal", "blunt"];
const LANGUAGES = ["English", "Spanish", "French"];
const INTERESTS = ["cycling", "cooking", "sci-fi", "jazz"];

export function PreferencesCard({
  preferences,
  onChange,
}: {
  preferences: Preferences;
  onChange: (next: Preferences) => void;
}) {
  const set = (patch: Partial<Preferences>) =>
    onChange({ ...preferences, ...patch });

  const toggleInterest = (interest: string) => {
    const current = preferences.interests ?? [];
    set({
      interests: current.includes(interest)
        ? current.filter((i) => i !== interest)
        : [...current, interest],
    });
  };

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Your preferences
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Every edit calls <code>agent.setState</code>. The agent reads them at
          the top of its next turn.
        </p>
      </div>

      <div className="space-y-4 p-5">
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Name
          </span>
          <input
            value={preferences.name ?? ""}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="What should the agent call you?"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
        </label>

        <Choice
          label="Tone"
          options={TONES}
          value={preferences.tone}
          onSelect={(tone) => set({ tone })}
        />
        <Choice
          label="Language"
          options={LANGUAGES}
          value={preferences.language}
          onSelect={(language) => set({ language })}
        />

        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Interests
          </span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {INTERESTS.map((interest) => {
              const on = (preferences.interests ?? []).includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`rounded-full border px-2.5 py-1 text-xs ${
                    on
                      ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                      : "border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Choice({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: string[];
  value?: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div>
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={`rounded-full border px-2.5 py-1 text-xs ${
              value === option
                ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                : "border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
