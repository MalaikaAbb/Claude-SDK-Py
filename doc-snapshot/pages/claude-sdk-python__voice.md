# Voice

> Real-time speech-to-text in the chat composer. The user speaks, the runtime transcribes, the agent runs the resulting prompt.


<!-- interactive demo: voice -->


You have a working chat surface and you want users to be able to speak instead of type. By the end of this guide, the chat composer will sprout a mic button, recorded audio will be transcribed by the runtime, and the transcript will auto-send to the agent like any other message.

## When to use this

- **Hands-free or accessibility flows** where typing isn't the right input modality.
- **Mobile or kiosk surfaces** where a long voice query is faster than thumb-typing.
- **Demo and test loops** where you want canned audio to drive the chat without a microphone.

If you only need file uploads (audio, images, video, documents), use [Multimodal Attachments](/claude-sdk-python/multimodal-attachments) instead. Voice is specifically about live transcription of recorded speech into chat input.

## Frontend

`<CopilotChat />` from `@copilotkit/react-core/v2` renders the mic button automatically when the runtime advertises `audioFileTranscriptionEnabled: true` on its `/info` endpoint. There's nothing to wire up on the chat surface itself:

```typescript
// src/app/demos/voice/page.tsx
import { CopilotKit } from "@copilotkit/react-core/v2";
import { VoiceChat } from "./voice-chat";

export default function VoiceDemoPage() {
  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit-voice"
      agent="voice-demo"
      useSingleEndpoint={false}
      // The dev-only `<cpk-web-inspector>` overlay (auto-enabled on
      // localhost via shouldShowDevConsole) intercepts pointer events
      // on top of the voice sample-audio button, so dev/D5 probe runs
      // can't click it through Playwright. Production isn't localhost
      // so the inspector never mounts there — voice is D5 in prod and
      // D4 locally for this reason alone. Disable explicitly here so
      // the demo behaves the same in both environments.
      enableInspector={false}
    >
      <VoiceChat />
    </CopilotKit>
  );
}
```

The `runtimeUrl="/api/copilotkit-voice"` points the browser to your Next.js API route. When the user clicks the mic, the chat captures audio, POSTs it to that runtime route's `/transcribe` endpoint, drops the resulting transcript into the composer, and submits.

### Driving the demo without a mic

For Playwright runs, screenshots, or any flow where prompting for mic permissions is awkward, ship a button that emits a canned sample phrase through an `onTranscribed` callback, bypassing the transcription endpoint entirely:

```typescript
// src/app/demos/voice/sample-audio-button.tsx
export function SampleAudioButton({
  onTranscribed,
  sampleText,
}: SampleAudioButtonProps) {
  return (
    <button
      type="button"
      data-testid="voice-sample-audio-button"
      onClick={() => onTranscribed(sampleText)}
      title={`Inserts: "${sampleText}"`}
      className="inline-flex w-fit items-center gap-2 rounded-md border border-black/10 bg-white px-3 py-1.5 text-xs font-medium hover:bg-black/5 dark:border-white/10 dark:bg-black/30 dark:hover:bg-white/10"
    >
      <span aria-hidden>🎙</span>
      <span>Try a sample audio</span>
    </button>
  );
}
```

The parent chat component can then drop that text into the composer's textarea (matched via `data-testid="copilot-chat-textarea"`) using the native value setter and a synthetic `input` event so React's managed state updates correctly.

## Backend

### Next.js API route

Create a dedicated API route at `app/api/copilotkit-voice/[[...slug]]/route.ts`. The `[[...slug]]` catch-all pattern lets the V2 runtime handle its internal URL routing (`/info`, `/agent/:id/run`, `/transcribe`, etc.) under the `/api/copilotkit-voice` base path.

Wire up the V2 runtime with a `TranscriptionService`. The V1 wrapper drops the `transcriptionService` option, so use `createCopilotRuntimeHandler` from `@copilotkit/runtime/v2` directly:

```typescript
// src/app/api/copilotkit-voice/[[...slug]]/route.ts
import type { NextRequest } from "next/server";
import {
  CopilotRuntime,
  TranscriptionService,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";
import type {
  CopilotRuntimeOptions,
  TranscribeFileOptions,
} from "@copilotkit/runtime/v2";
import { createClaudeHttpAgent } from "@/app/api/_shared/claude-http-agent";
import { TranscriptionServiceOpenAI } from "@copilotkit/voice";
import OpenAI from "openai";

const AGENT_URL = process.env.AGENT_URL || "http://localhost:8000";

const voiceDemoAgent = createClaudeHttpAgent(`${AGENT_URL}/`);
type StaticRuntimeAgents = Awaited<
  Exclude<CopilotRuntimeOptions["agents"], (...args: never[]) => unknown>
>;
type RuntimeAgent = StaticRuntimeAgents[keyof StaticRuntimeAgents];

// CopilotRuntime and the app can resolve AbstractAgent from different
// @ag-ui/client package instances during local development. AbstractAgent has
// private fields, so TypeScript treats otherwise-compatible HttpAgent values
// nominally. Keep that bridge at the runtime boundary.
const voiceDemoAgents: Record<string, RuntimeAgent> = {
  "voice-demo": voiceDemoAgent as unknown as RuntimeAgent,
  default: voiceDemoAgent as unknown as RuntimeAgent,
};

class GuardedOpenAITranscriptionService extends TranscriptionService {
  private delegate: TranscriptionServiceOpenAI | null;

  constructor() {
    super();
    const apiKey = process.env.OPENAI_API_KEY;
    this.delegate = apiKey
      ? new TranscriptionServiceOpenAI({ openai: new OpenAI({ apiKey }) })
      : null;
  }

  async transcribeFile(options: TranscribeFileOptions): Promise<string> {
    if (!this.delegate) {
      throw new Error(
        "OPENAI_API_KEY not configured for this deployment (api key missing). " +
          "Set OPENAI_API_KEY to enable voice transcription.",
      );
    }
    return this.delegate.transcribeFile(options);
  }
}

let cachedHandler: ((req: Request) => Promise<Response>) | null = null;
function getHandler(): (req: Request) => Promise<Response> {
  if (cachedHandler) return cachedHandler;

  const runtime = new CopilotRuntime({
    agents: voiceDemoAgents,
    transcriptionService: new GuardedOpenAITranscriptionService(),
  });

  cachedHandler = createCopilotRuntimeHandler({
    runtime,
    basePath: "/api/copilotkit-voice",
  });
  return cachedHandler;
}

export const POST = (req: NextRequest) => getHandler()(req);
export const GET = (req: NextRequest) => getHandler()(req);
export const PUT = (req: NextRequest) => getHandler()(req);
export const DELETE = (req: NextRequest) => getHandler()(req);
```

The `basePath: "/api/copilotkit-voice"` in `createCopilotRuntimeHandler` must match the API route's directory path. With `transcriptionService` set, the runtime advertises `audioFileTranscriptionEnabled: true` on `/info` (which is what tells the chat to render the mic button) and routes `POST /transcribe` to the service.



### Custom transcription backends

`TranscriptionService` from `@copilotkit/runtime/v2` is an abstract class. Subclass it to plug in any transcription provider — Whisper, AssemblyAI, Deepgram, your own model. The library ships `TranscriptionServiceOpenAI` as the canonical reference implementation.

A useful pattern is wrapping your service in a guard that returns a clean 4xx when credentials aren't configured, instead of an opaque 5xx from the underlying SDK:

```typescript
// src/app/api/copilotkit-voice/[[...slug]]/route.ts
import type { NextRequest } from "next/server";
import {
  CopilotRuntime,
  TranscriptionService,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";
import type {
  CopilotRuntimeOptions,
  TranscribeFileOptions,
} from "@copilotkit/runtime/v2";
import { createClaudeHttpAgent } from "@/app/api/_shared/claude-http-agent";
import { TranscriptionServiceOpenAI } from "@copilotkit/voice";
import OpenAI from "openai";

const AGENT_URL = process.env.AGENT_URL || "http://localhost:8000";

const voiceDemoAgent = createClaudeHttpAgent(`${AGENT_URL}/`);
type StaticRuntimeAgents = Awaited<
  Exclude<CopilotRuntimeOptions["agents"], (...args: never[]) => unknown>
>;
type RuntimeAgent = StaticRuntimeAgents[keyof StaticRuntimeAgents];

// CopilotRuntime and the app can resolve AbstractAgent from different
// @ag-ui/client package instances during local development. AbstractAgent has
// private fields, so TypeScript treats otherwise-compatible HttpAgent values
// nominally. Keep that bridge at the runtime boundary.
const voiceDemoAgents: Record<string, RuntimeAgent> = {
  "voice-demo": voiceDemoAgent as unknown as RuntimeAgent,
  default: voiceDemoAgent as unknown as RuntimeAgent,
};

class GuardedOpenAITranscriptionService extends TranscriptionService {
  private delegate: TranscriptionServiceOpenAI | null;

  constructor() {
    super();
    const apiKey = process.env.OPENAI_API_KEY;
    this.delegate = apiKey
      ? new TranscriptionServiceOpenAI({ openai: new OpenAI({ apiKey }) })
      : null;
  }

  async transcribeFile(options: TranscribeFileOptions): Promise<string> {
    if (!this.delegate) {
      throw new Error(
        "OPENAI_API_KEY not configured for this deployment (api key missing). " +
          "Set OPENAI_API_KEY to enable voice transcription.",
      );
    }
    return this.delegate.transcribeFile(options);
  }
}
```

<IntegrationGrid path="voice" />
