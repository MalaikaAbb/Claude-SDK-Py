import type { NextRequest } from "next/server";
import {
  CopilotRuntime,
  TranscriptionService,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";
import type { TranscribeFileOptions } from "@copilotkit/runtime/v2";
import { HttpAgent } from "@ag-ui/client";
import { TranscriptionServiceOpenAI } from "@copilotkit/voice";
import OpenAI from "openai";

import { AGENT_URL } from "@/lib/agents";

// The voice route, per https://docs.copilotkit.ai/claude-sdk-python/voice
//
// Three things make it a separate endpoint from /api/copilotkit:
//
//  1. `transcriptionService` only exists on the **v2** runtime. The v1 wrapper
//     (`copilotRuntimeNextJSAppRouterEndpoint`) drops the option, so this uses
//     `createCopilotRuntimeHandler` from @copilotkit/runtime/v2 directly.
//  2. Setting it is what makes the runtime advertise
//     `audioFileTranscriptionEnabled: true` on /info — which is the only
//     reason the chat composer renders a mic button at all.
//  3. The `[[...slug]]` catch-all lets the v2 runtime own its own sub-routing
//     (/info, /agent/:id/run, /transcribe) under this base path, so `basePath`
//     below must match this file's directory.
//
// The agent hop is one longer here than elsewhere: the browser talks to
// /api/copilotkit-voice, and this runtime forwards `voice-demo` runs to the
// Python server's /voice endpoint.

const voiceDemoAgent = new HttpAgent({ url: `${AGENT_URL}/voice` });

/**
 * Transcription is the one thing in this repo that is not Anthropic.
 *
 * Claude answers the chat, but the mic round-trip goes through OpenAI Whisper,
 * so `ANTHROPIC_API_KEY` alone will not make it work. Rather than let the OpenAI
 * SDK fail deep inside a request with an opaque 500, this guard checks for the
 * key up front and throws something a developer can act on. Everything else on
 * the route — including the doc's sample-audio button, which injects text
 * directly — works without it.
 */
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
        "OPENAI_API_KEY is not set, so speech cannot be transcribed. " +
          "Set it in frontend/.env.local and restart, or use the " +
          "'Try a sample audio' button, which bypasses transcription.",
      );
    }
    return this.delegate.transcribeFile(options);
  }
}

let cachedHandler: ((req: Request) => Promise<Response>) | null = null;

function getHandler(): (req: Request) => Promise<Response> {
  if (cachedHandler) return cachedHandler;

  const runtime = new CopilotRuntime({
    agents: {
      "voice-demo": voiceDemoAgent,
      default: voiceDemoAgent,
    },
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
