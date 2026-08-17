# Dynamic Schema A2UI

> LLM-generated A2UI. A secondary LLM creates both the schema and data from any prompt.


<!-- interactive demo: declarative-gen-ui -->


In the dynamic-schema approach, a secondary LLM generates the entire
UI (schema, data, and layout) based on the conversation context.
It's the most flexible A2UI flavor; the agent can render any UI for
any request without pre-defined schemas.

## How it works

1. The agent calls the A2UI tool to draw a surface, made available
   when `injectA2UITool: true`.
2. The runtime serializes your client-side catalog (component names +
   Zod prop schemas) into the agent's `copilotkit.context` so the LLM
   knows which components it may emit.
3. The tool call streams through LangGraph as `TOOL_CALL_ARGS` events.
4. The A2UI middleware intercepts the stream and renders cards
   progressively as data items arrive.

## The 3-file split

The canonical Bring-Your-Own-Catalog (BYOC) layout keeps three files
side-by-side under `frontend/src/app/a2ui/`:

| File | What lives there |
|---|---|
| `definitions.ts` | Zod props schema + human-readable descriptions for each custom component. Platform-agnostic, so the runtime can serialise it to the LLM. |
| `renderers.tsx` | React implementations keyed by the same names. TypeScript enforces that every definition has a renderer. |
| `catalog.ts` | `createCatalog(definitions, renderers, { includeBasicCatalog: true })`: merges your custom components with CopilotKit's built-in primitives. |

<Steps>
<Step>
### Declare your custom component definitions

Each entry pairs a Zod prop schema with a description. The description
is crucial; the LLM reads it to decide which component to emit. The
example below ships a small dashboard catalog (Card / StatusBadge /
Metric / InfoRow / PrimaryButton):

```typescript
// src/app/demos/declarative-gen-ui/a2ui/definitions.ts
import { z } from "zod";
import type { CatalogDefinitions } from "@copilotkit/a2ui-renderer";

export const myDefinitions = {
  Card: {
    description:
      "A titled card container with an optional subtitle and a single child slot. Use it to group related content (metrics, rows, buttons).",
    props: z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      child: z.string().optional(),
    }),
  },

  StatusBadge: {
    description:
      "A small coloured pill communicating the state of something (healthy/degraded/down, online/offline, open/closed). Choose `variant` to match the intent.",
    props: z.object({
      text: z.string(),
      variant: z.enum(["success", "warning", "error", "info"]).optional(),
    }),
  },

  Metric: {
    description:
      "A key/value KPI display with an optional trend indicator. Ideal for dashboards (e.g. 'Revenue • $12.4k • up').",
    props: z.object({
      label: z.string(),
      value: z.string(),
      trend: z.enum(["up", "down", "neutral"]).optional(),
    }),
  },

  InfoRow: {
    description:
      "A compact two-column 'label: value' row. Good for stacks of facts inside a Card (owner, region, last updated, etc.).",
    props: z.object({
      label: z.string(),
      value: z.string(),
    }),
  },

  DataTable: {
    description:
      "A data table with column headers and rows. Ideal for rankings and per-person/per-item breakdowns (rep performance vs quota, deal lists). Each row's keys MUST appear in `columns[].key`; unknown row keys render as blank cells and indicate model/schema drift.",
    props: z.object({
      columns: z.array(z.object({ key: z.string(), label: z.string() })),
      // Cells may be strings or numbers — the renderer stringifies at
      // render time, but accepting both lets the LLM emit raw numerics
      // (e.g. attainment 124) instead of being forced to stringify.
      rows: z.array(z.record(z.union([z.string(), z.number()]))),
    }),
  },

  PrimaryButton: {
    description:
      "A styled primary call-to-action button. Attach an optional `action` that will be dispatched back to the agent when the user clicks it.",
    props: z.object({
      label: z.string(),
      action: z.any().optional(),
    }),
  },

  PieChart: {
    description:
      "A pie/donut chart with a brand-coloured legend. Provide `title`, `description`, and `data` as an array of `{ label, value }` objects. Great for part-of-whole breakdowns (sales by region, traffic sources, portfolio allocation).",
    props: z.object({
      title: z.string(),
      description: z.string(),
      data: z.array(
        z.object({
          label: z.string(),
          value: z.number(),
        }),
      ),
    }),
  },

  BarChart: {
    description:
      "A vertical bar chart built on Recharts. Provide `title`, `description`, and `data` as an array of `{ label, value }` objects. Great for comparing series across categories (quarterly revenue, headcount by team, signups per month).",
    props: z.object({
      title: z.string(),
      description: z.string(),
      data: z.array(
        z.object({
          label: z.string(),
          value: z.number(),
        }),
      ),
    }),
  },
} satisfies CatalogDefinitions;
```
</Step>

<Step>
### Implement the React renderers

Every key in `myDefinitions` must have a matching renderer. Props are
statically typed against the Zod schema, so refactors stay safe:

```typescript
// src/app/demos/declarative-gen-ui/a2ui/renderers.tsx
export const myRenderers: CatalogRenderers<MyDefinitions> = {
  Card: ({ props, children }) => (
    <Card
      className="w-full min-w-0 overflow-hidden"
      data-testid="declarative-card"
    >
      <CardHeader>
        <CardTitle>{props.title}</CardTitle>
        {props.subtitle && <CardDescription>{props.subtitle}</CardDescription>}
      </CardHeader>
      {props.child && (
        <CardContent className="flex flex-col gap-4">
          {children(props.child)}
        </CardContent>
      )}
    </Card>
  ),

  StatusBadge: ({ props }) => (
    <Badge
      variant={props.variant ?? "info"}
      data-testid="declarative-status-badge"
    >
      {props.text}
    </Badge>
  ),

  Metric: ({ props }) => {
    const trend = props.trend ?? "neutral";
    const arrow = trend === "up" ? "↑" : trend === "down" ? "↓" : "";
    const trendClass =
      trend === "up"
        ? "text-emerald-600"
        : trend === "down"
          ? "text-rose-600"
          : "text-[var(--foreground)]";
    return (
      // `flex-1 min-w-[120px]` lets a row of Metrics distribute evenly
      // inside the basic catalog's gap-less Row — 3 metrics in a 600px
      // card column get ~200px each instead of squishing to content width.
      <div
        data-testid="declarative-metric"
        className="flex flex-1 min-w-[120px] flex-col gap-1"
      >
        <div className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          {props.label}
        </div>
        <div
          className={`flex items-baseline gap-1.5 text-2xl font-semibold tabular-nums ${trendClass}`}
        >
          <span>{props.value}</span>
          {arrow && <span className="text-base">{arrow}</span>}
        </div>
      </div>
    );
  },

  InfoRow: ({ props }) => (
    // Divider via `border-b last:border-b-0` so the final row doesn't dangle
    // a trailing line, regardless of whether the agent wraps these in a
    // Column or drops them directly into a Card's child slot.
    <div
      data-testid="declarative-info-row"
      className="flex items-baseline justify-between gap-4 py-2 border-b border-[var(--border)] last:border-b-0 last:pb-0 first:pt-0"
    >
      <span className="text-sm text-[var(--muted-foreground)]">
        {props.label}
      </span>
      <span className="text-sm font-medium text-[var(--foreground)] text-right tabular-nums">
        {props.value}
      </span>
    </div>
  ),

  DataTable: ({ props }) => {
    const cols = Array.isArray(props.columns) ? props.columns : [];
    const rows = Array.isArray(props.rows) ? props.rows : [];
    return (
      <div
        data-testid="declarative-data-table"
        className="w-full overflow-x-auto"
      >
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {cols.map((col) => (
                <th
                  key={col.key}
                  className="border-b-2 border-[var(--border)] px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              // Stable row key: prefer the first column's value (primary-key-ish),
              // suffix with index in case values repeat, fall back to a JSON
              // stringify of the row when columns is empty. Stable keys prevent
              // React from re-mounting every row when the agent re-emits a
              // slightly different table.
              const pk = cols.length > 0 ? row[cols[0].key] : undefined;
              const rowKey =
                pk !== undefined ? `${pk}-${i}` : JSON.stringify(row);
              return (
                <tr
                  key={rowKey}
                  className="border-b border-[var(--border)] last:border-b-0"
                >
                  {cols.map((col) => (
                    <td
                      key={col.key}
                      className="px-3 py-2 tabular-nums text-[var(--foreground)]"
                    >
                      {String(row[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  },

  PrimaryButton: ({ props, dispatch }) => (
    <Button
      onClick={() => {
        if (props.action && dispatch) dispatch(props.action);
      }}
    >
      {props.label}
    </Button>
  ),

  PieChart: ({ props }) => {
    const data = props.data ?? [];
    const safeData = Array.isArray(data) ? data : [];
    const total = safeData.reduce((sum, d) => sum + (Number(d.value) || 0), 0);

    return (
      // `flex-1 min-w-0` so multiple charts in a basic-catalog Row
      // distribute the available width evenly instead of each insisting
      // on its content size and overflowing.
      <Card
        className="w-full flex-1 min-w-0 overflow-hidden"
        data-testid="declarative-pie-chart"
      >
        <CardHeader>
          <CardTitle>{props.title}</CardTitle>
          <CardDescription>{props.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {safeData.length === 0 ? (
            <div className="py-8 text-center text-sm text-[var(--muted-foreground)]">
              No data available
            </div>
          ) : (
            <>
              <DonutChart data={safeData} />
              <div className="flex flex-col gap-2 pt-2">
                {safeData.map((item, index) => {
                  const val = Number(item.value) || 0;
                  const pct =
                    total > 0 ? ((val / total) * 100).toFixed(0) : "0";
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 text-sm"
                    >
                      <span
                        className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
                        style={{
                          backgroundColor:
                            CHART_COLORS[index % CHART_COLORS.length],
                        }}
                      />
                      <span className="flex-1 truncate text-[var(--foreground)]">
                        {item.label}
                      </span>
                      <span className="tabular-nums text-[var(--muted-foreground)]">
                        {val.toLocaleString()}
                      </span>
                      <span className="w-10 text-right tabular-nums text-[var(--muted-foreground)]">
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  },

  BarChart: ({ props }) => {
    const { isNew } = useSeenIndices();
    const data = props.data ?? [];
    const safeData = Array.isArray(data) ? data : [];

    return (
      <Card
        className="w-full flex-1 min-w-0 overflow-hidden"
        data-testid="declarative-bar-chart"
      >
        {/* Scoped keyframe — no globals.css needed */}
        <style>{`
          @keyframes barSlideIn {
            from { transform: translateY(40px); opacity: 0; }
            20% { opacity: 1; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
        <CardHeader>
          <CardTitle>{props.title}</CardTitle>
          <CardDescription>{props.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {safeData.length === 0 ? (
            <div className="py-8 text-center text-sm text-[var(--muted-foreground)]">
              No data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <RechartsBarChart
                data={safeData}
                margin={{ top: 12, right: 12, bottom: 4, left: -8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  stroke="var(--border)"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  stroke="var(--border)"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                />
                <Bar
                  isAnimationActive={false}
                  dataKey="value"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  shape={
                    ((barProps: any) => (
                      <AnimatedBar
                        {...barProps}
                        isNew={isNew(barProps.index as number)}
                      />
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    )) as any
                  }
                >
                  {safeData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Bar>
              </RechartsBarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    );
  },
};
```
</Step>

<Step>
### Wire definitions × renderers into a catalog

`createCatalog` is what you hand to the provider. Flip
`includeBasicCatalog: true` to merge CopilotKit's built-ins
(Column, Row, Text, Image, Card, Button, List, Tabs, …), so the LLM
can compose custom + basic components interchangeably:

```typescript
// src/app/demos/declarative-gen-ui/a2ui/catalog.ts
import { createCatalog } from "@copilotkit/a2ui-renderer";

import { myDefinitions } from "./definitions";
import { myRenderers } from "./renderers";

export const myCatalog = createCatalog(myDefinitions, myRenderers, {
  catalogId: "declarative-gen-ui-catalog",
  includeBasicCatalog: true,
});
```
</Step>

<Step>
### Pass the catalog to the provider

A single prop (`a2ui={{ catalog }}`) is all the frontend needs; the
provider registers the catalog and wires up the built-in A2UI
activity-message renderer:

```typescript
// src/app/demos/declarative-gen-ui/page.tsx
import React from "react";
import { CopilotKit } from "@copilotkit/react-core/v2";

import { myCatalog } from "./a2ui/catalog";
import { Chat } from "./chat";

export default function DeclarativeGenUIDemo() {
  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit-declarative-gen-ui"
      agent="declarative-gen-ui"
      a2ui={{ catalog: myCatalog }}
    >
      <div className="flex justify-center items-center h-screen w-full">
        <div className="h-full w-full max-w-4xl">
          <Chat />
        </div>
      </div>
    </CopilotKit>
```

That is all the default path needs. The catalog auto-enables A2UI and
injects the `generate_a2ui` tool, so the runtime needs no `a2ui` block.
(No catalog? Turn it on from the runtime instead with
`a2ui: { injectA2UITool: true }`.)
</Step>
</Steps>

## I opted out of auto-inject, now what?

By not passing a catalog, not setting `injectA2UITool`, or by passing
a catalog and setting `injectA2UITool: false`, you have opted out
entirely. That means you hook up two pieces yourself: the
`generate_a2ui` tool which lets your agent generate A2UI surfaces, and
the `A2UIMiddleware` which lets those surfaces render.

<Steps>
<Step>
### The `A2UIMiddleware`

The `A2UIMiddleware` is what turns the agent's `a2ui_operations` into
rendered surfaces. Without it, the agent's output never becomes UI; it
falls through as a plain tool result. It can also inject the
`generate_a2ui` tool for you (`injectA2UITool: true`), letting you skip
the next step. Attach it to the AG-UI agent:

```typescript
import { A2UIMiddleware } from "@ag-ui/a2ui-middleware";

agent.use(new A2UIMiddleware({ injectA2UITool: false }));
```
</Step>

<Step>
### The A2UI agent tool

The `generate_a2ui` tool runs a secondary LLM (a subagent) that designs
the surface, which is why you hand it a model. Build it with the AG-UI
factory and add it to your agent's tools:

```python title="agent.py"
from ag_ui_langgraph import get_a2ui_tools
from langchain_openai import ChatOpenAI

generate_a2ui = get_a2ui_tools({
    "model": ChatOpenAI(model="gpt-4o"),
    "default_catalog_id": "copilotkit://app-dashboard-catalog",
})

tools = [my_other_tool, generate_a2ui]
```
</Step>
</Steps>

## Progressive streaming

The secondary LLM's `render_a2ui` tool call streams through LangGraph
as `TOOL_CALL_ARGS` events. The A2UI middleware:

1. Waits for the full `components` array before emitting anything;
   the schema must be complete before rendering starts.
2. Extracts `surfaceId` + `root` from the partial JSON.
3. Emits `createSurface` + `updateComponents` once the schema is
   complete.
4. Extracts complete `items` objects progressively and emits an
   `updateDataModel` for each, so cards appear one by one as data
   streams in.

A built-in progress indicator shows while the schema is still
generating and hides automatically once data items start arriving.

## When should I use dynamic schemas?

- You don't know the UI shape ahead of time; the agent decides what
  to show based on the user's request.
- You want to prototype A2UI without committing to a schema file yet.
- You're building a conversational dashboard where the layout varies
  per turn.

If the surface is well-known (e.g. a product card, a flight result),
prefer a **[fixed schema](./fixed-schema)**; it's faster, cheaper,
and the UI is deterministic.

<IntegrationGrid path="generative-ui/a2ui" />
