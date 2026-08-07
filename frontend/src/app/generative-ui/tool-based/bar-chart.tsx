"use client";

import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { z } from "zod";

/**
 * The component the agent renders by calling it as a tool.
 *
 * The page names this — "The example above uses Recharts for the bar chart; it
 * doesn't know anything about CopilotKit" — and publishes neither the component
 * nor its `barChartPropsSchema`. Both are inferred from that sentence and from
 * the tool name, `render_bar_chart`, and kept minimal.
 *
 * The point the page is making holds: nothing below imports CopilotKit. Props
 * arrive already parsed and validated by the Zod schema.
 */

export const barChartPropsSchema = z.object({
  title: z.string().describe("Heading for the chart."),
  data: z
    .array(
      z.object({
        label: z.string(),
        value: z.number(),
      }),
    )
    .describe("The bars, in display order."),
});

export type BarChartProps = z.infer<typeof barChartPropsSchema>;

export function BarChart({ title, data }: BarChartProps) {
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </p>
      {safeData.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">No data yet…</p>
      ) : (
        <div className="mt-3">
          <ResponsiveContainer width="100%" height={220}>
            <RechartsBarChart data={safeData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip cursor={{ opacity: 0.1 }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="var(--accent)" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
