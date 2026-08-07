"use client";

import {
  CopilotSidebar,
  useAgentContext,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";
import { useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

const AGENT_ID = "agent-config";

type Tone = "professional" | "casual" | "enthusiastic";
type Expertise = "beginner" | "intermediate" | "expert";
type ResponseLength = "concise" | "detailed";

export type AgentConfig = {
  tone: Tone;
  expertise: Expertise;
  responseLength: ResponseLength;
};

const TONES: Tone[] = ["professional", "casual", "enthusiastic"];
const EXPERTISE: Expertise[] = ["beginner", "intermediate", "expert"];
const LENGTHS: ResponseLength[] = ["concise", "detailed"];

/**
 * The UI owns a typed config object and mirrors every change into the agent.
 *
 * `ConfigContextRelay` is the page's, verbatim. The controls that feed it are
 * not published, so they are written here from the three axes and their allowed
 * values — which the page does publish, on the backend side.
 *
 * The page's backend half reads these off `forwarded_props` instead, and that
 * does not work here: `useAgentContext` writes to `input_data.context`, and
 * ClaudeAgentAdapter filters `forwarded_props` through a whitelist that
 * excludes all three keys either way. What makes this route work is that the
 * adapter folds `context` into the system prompt itself. See the notes page.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/agent-config" subtitle={`agent: ${AGENT_ID}`}>
      <Demo />
    </DemoFrame>
  );
}

function ConfigContextRelay({ config }: { config: AgentConfig }) {
  useAgentContext({
    description: "Agent response preferences",
    value: {
      tone: config.tone,
      expertise: config.expertise,
      responseLength: config.responseLength,
    },
  });
  return null;
}

function Demo() {
  const [config, setConfig] = useState<AgentConfig>({
    tone: "professional",
    expertise: "intermediate",
    responseLength: "concise",
  });

  useConfigureSuggestions({
    suggestions: [
      {
        title: "Explain something technical",
        message: "Explain what a database index is.",
      },
      {
        title: "Check the config landed",
        message: "What tone and expertise level have I asked you for?",
      },
    ],
    available: "always",
  });

  return (
    <div className="h-full overflow-hidden">
      <ConfigContextRelay config={config} />

      <main className="h-full overflow-y-auto p-10">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Agent settings
        </h1>
        <p className="mt-2 max-w-prose text-sm text-slate-600 dark:text-slate-400">
          Change an axis, then ask the same question again. The config is not a
          chat message — it travels as context and is rebuilt into the
          agent&apos;s prompt on every turn.
        </p>

        <div className="mt-6 max-w-lg space-y-5">
          <Axis
            label="Tone"
            options={TONES}
            value={config.tone}
            onSelect={(tone) => setConfig({ ...config, tone })}
          />
          <Axis
            label="Expertise"
            options={EXPERTISE}
            value={config.expertise}
            onSelect={(expertise) => setConfig({ ...config, expertise })}
          />
          <Axis
            label="Response length"
            options={LENGTHS}
            value={config.responseLength}
            onSelect={(responseLength) =>
              setConfig({ ...config, responseLength })
            }
          />

          <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      </main>

      <CopilotSidebar agentId={AGENT_ID} defaultOpen />
    </div>
  );
}

function Axis<T extends string>({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onSelect: (value: T) => void;
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
