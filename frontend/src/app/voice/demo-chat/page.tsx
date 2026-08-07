"use client";

import { CopilotChat, CopilotKit } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";
import { nestedInspectorSetting } from "@/lib/inspector";

import { SampleAudioButton } from "../sample-audio-button";

const SAMPLE_TEXT =
  "What can a Claude Agent SDK agent do that a plain chatbot cannot?";

/**
 * Voice needs its own provider, because it needs its own runtime.
 *
 * `transcriptionService` only exists on the v2 runtime, so the mic is served
 * by /api/copilotkit-voice rather than the app-wide /api/copilotkit. The chat
 * component itself takes no voice props at all — it grows a mic button purely
 * because that runtime advertises `audioFileTranscriptionEnabled: true` on
 * /info.
 *
 * `useSingleEndpoint={false}` is what makes the client call the runtime's
 * sub-paths (/info, /transcribe, /agent/:id/run) separately.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/voice" subtitle="agent: voice-demo · runtime: v2">
      <CopilotKit
        runtimeUrl="/api/copilotkit-voice"
        agent="voice-demo"
        useSingleEndpoint={false}
        // Owns the inspector on this route, because the chat runs on *this*
        // provider's core. Never hard-code `true` here: the app-wide provider
        // must stand down first, or the page gets two lit inspectors and an
        // unbounded console storm. `lib/inspector.ts` coordinates both sides.
        enableInspector={nestedInspectorSetting}
      >
        <div className="flex h-full flex-col">
          <div className="shrink-0 border-b border-slate-200 px-4 py-2 dark:border-slate-800">
            <SampleAudioButton sampleText={SAMPLE_TEXT} />
          </div>
          <div className="min-h-0 flex-1">
            <CopilotChat className="h-full" />
          </div>
        </div>
      </CopilotKit>
    </DemoFrame>
  );
}
