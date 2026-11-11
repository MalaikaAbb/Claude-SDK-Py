"use client";

import { useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

import OpenGenUiDemo from "../open-gen-ui";
import OpenGenUiAdvancedDemo from "../open-gen-ui-advanced";

type Mode = "minimal" | "advanced";

/**
 * Ported from the google-adk harness. The page's two demos, one at a time. Each mounts its own `<CopilotKit>`
 * against /api/copilotkit-ogui, so switching remounts the provider and
 * starts a fresh conversation.
 */
export default function Page() {
  const [mode, setMode] = useState<Mode>("minimal");

  return (
    <DemoFrame
      parentPath="/generative-ui/open-generative-ui"
      subtitle={`agent: ${mode === "minimal" ? "open-gen-ui" : "open-gen-ui-advanced"}`}
    >
      <div className="flex h-full flex-col">
        <div className="flex shrink-0 items-center gap-2 border-b border-slate-200 px-4 py-2 dark:border-slate-800">
          {(["minimal", "advanced"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-md px-3 py-1 text-xs font-medium ${
                mode === m
                  ? "bg-[var(--accent)] text-white"
                  : "border border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          {mode === "minimal" ? <OpenGenUiDemo /> : <OpenGenUiAdvancedDemo />}
        </div>
      </div>
    </DemoFrame>
  );
}
