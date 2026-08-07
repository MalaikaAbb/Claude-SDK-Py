"use client";

/**
 * The `get_weather` renderer.
 *
 * The page passes this component seven props — `loading`, `location`,
 * `temperature`, `humidity`, `windSpeed`, `conditions` — and never publishes
 * it. Written here from that call signature, minimally.
 *
 * The `loading` branch is the part worth having: a renderer is mounted the
 * moment the tool call *starts*, with `status` short of "complete" and no
 * result yet, so it has to draw something sensible from the arguments alone.
 */

export interface WeatherCardProps {
  loading: boolean;
  location: string;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  conditions?: string;
}

export function WeatherCard({
  loading,
  location,
  temperature,
  humidity,
  windSpeed,
  conditions,
}: WeatherCardProps) {
  return (
    <div className="w-full max-w-sm rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-4 dark:border-sky-900 dark:from-sky-950/50 dark:to-slate-900">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {location || "…"}
        </p>
        <span className="text-[10px] uppercase tracking-[0.14em] text-sky-700 dark:text-sky-300">
          {loading ? "Running" : "Done"}
        </span>
      </div>
      {loading ? (
        <p className="mt-3 animate-pulse text-sm text-slate-500">
          Checking the weather…
        </p>
      ) : (
        <>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
            {temperature}°
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">{conditions}</p>
          <dl className="mt-3 flex gap-6 text-xs text-slate-500">
            <div>
              <dt className="uppercase tracking-wide">Humidity</dt>
              <dd className="tabular-nums text-slate-700 dark:text-slate-300">
                {humidity}%
              </dd>
            </div>
            <div>
              <dt className="uppercase tracking-wide">Wind</dt>
              <dd className="tabular-nums text-slate-700 dark:text-slate-300">
                {windSpeed} mph
              </dd>
            </div>
          </dl>
        </>
      )}
    </div>
  );
}
