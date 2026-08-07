"use client";

import {
  CopilotChat,
  UseAgentUpdate,
  useAgent,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import { DocumentCanvas } from "../document-canvas";

const AGENT_ID = "shared-state-streaming";

/**
 * The frontend half, exactly as published — and it is correct.
 *
 * What is missing is the backend half. The page's `stream_document_state`
 * parses partial `input_json_delta` chunks off a raw Anthropic stream and emits
 * a STATE_SNAPSHOT per token. ClaudeAgentAdapter consumes that stream
 * internally and never hands one out, and `write_document` is a backend tool
 * with no registration path, so the document arrives in one write at the end of
 * the turn rather than growing token-by-token.
 *
 * The LIVE badge and the subscription are real; the streaming is not.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/shared-state/streaming" subtitle={`agent: ${AGENT_ID}`}>
      <Demo />
    </DemoFrame>
  );
}

function Demo() {
  // Subscribe to BOTH state changes and run-status changes. The former
  // drives the per-token document rerender; the latter toggles the
  // "LIVE" badge when the agent starts / stops.
  const { agent } = useAgent({
    agentId: AGENT_ID,
    updates: [UseAgentUpdate.OnStateChanged, UseAgentUpdate.OnRunStatusChanged],
  });

  useConfigureSuggestions({
    suggestions: [
      {
        title: "Write a short essay",
        message: "Write a short essay about why small teams ship faster.",
      },
      {
        title: "Draft an email",
        message: "Draft a friendly email postponing a meeting to next Tuesday.",
      },
    ],
    available: "always",
  });

  const state = (agent.state ?? {}) as { document?: string };

  return (
    <div className="grid h-full grid-cols-1 gap-4 p-4 lg:grid-cols-[1fr_420px]">
      <DocumentCanvas document={state.document ?? ""} isRunning={agent.isRunning} />
      <div className="min-h-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
        <CopilotChat agentId={AGENT_ID} className="h-full" />
      </div>
    </div>
  );
}
