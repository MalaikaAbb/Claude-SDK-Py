"use client";

import Link from "next/link";

import { DemoFrame } from "@/components/demo-frame";

import { OrderSearch } from "../_demo/OrderSearch";

/**
 * "React frontend tool": the page's `OrderSearch`, mounted inside the app's
 * root `CopilotKitProvider` as the page requires. The page prints no agent, so
 * there is no chat here; the tool only registers (and mirrors onto
 * `document.modelContext` in a WebMCP browser). Its handler calls the
 * undefined `searchOrders` and throws.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/webmcp" subtitle="tool: searchOrders · no agent">
      <div className="flex h-full flex-col">
        <p className="shrink-0 border-b border-slate-200 px-4 py-1.5 text-xs text-slate-500 dark:border-slate-800">
          React frontend tool.{" "}
          <Link href="/webmcp/demo-chat/core-only" className="text-[var(--accent)] underline underline-offset-4">
            Switch to the core-only registration (no agent) →
          </Link>
        </p>
        <OrderSearch />
      </div>
    </DemoFrame>
  );
}
