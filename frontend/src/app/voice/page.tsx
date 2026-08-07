import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/voice" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The chat component takes no voice props. It grows a mic button because
          the runtime it is pointed at advertises{" "}
          <code>audioFileTranscriptionEnabled: true</code> on <code>/info</code>
          , and it advertises that because a <code>transcriptionService</code>{" "}
          was set on it. That option only exists on the v2 runtime handler, so
          this is the one route with its own runtime, its own provider, and its
          own endpoint.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Click 🎙 Try a sample audio, then send.",
              "Or click the mic in the composer and speak.",
            ]}
            expect="The sample button drops a sentence into the composer. The mic records, POSTs to /api/copilotkit-voice/transcribe, and the transcript auto-sends."
            fail="No mic button means /info is not advertising transcription — check the runtime route. A mic error means OPENAI_API_KEY is unset; the sample button still works."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/voice/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The runtime that makes the mic appear"
        description="Three things force a separate endpoint: the v2-only option, the /info advertisement it triggers, and the catch-all the v2 handler needs for its own sub-routing."
      >
        <SourceCode file="frontend/src/app/api/copilotkit-voice/[[...slug]]/route.ts" />
      </Panel>

      <Panel
        title="Driving it without a mic"
        description="The doc's own escape hatch, for screenshots, Playwright, and anyone without an OpenAI key."
      >
        <SourceCode file="frontend/src/app/voice/sample-audio-button.tsx" />
      </Panel>

      <Panel title="Doc-vs-implementation notes">
        <Callout tone="warn" title="Transcription is not Anthropic">
          <p className="leading-relaxed">
            Claude answers the chat, but the mic round-trip goes through OpenAI
            Whisper, so <code>ANTHROPIC_API_KEY</code> alone will not make it
            work. Set <code>OPENAI_API_KEY</code> in{" "}
            <code>frontend/.env.local</code> for the mic. Everything else on the
            route — including the sample-audio button — works without it, and
            the guard in the runtime route turns a missing key into a legible
            error rather than an opaque 500.
          </p>
        </Callout>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            The published route imports <code>createClaudeHttpAgent</code> from{" "}
            <code>@/app/api/_shared/claude-http-agent</code>, a repo-local
            helper that is never shown. From how it is called —{" "}
            <code>createClaudeHttpAgent(`$&#123;AGENT_URL&#125;/`)</code> — it
            is a thin <code>HttpAgent</code> wrapper, so this route uses{" "}
            <code>new HttpAgent(&#123; url &#125;)</code> directly.
          </li>
          <li>
            That call also points at the server <em>root</em>. This harness
            mounts one agent per path, so the voice agent is at{" "}
            <code>/voice</code>.
          </li>
          <li>
            The published route&apos;s{" "}
            <code>StaticRuntimeAgents</code>/<code>RuntimeAgent</code> type
            gymnastics work around two copies of{" "}
            <code>@ag-ui/client</code> resolving in one tree. This repo has one
            copy, so the casts are dropped.
          </li>
          <li>
            <code>enableInspector=&#123;false&#125;</code> is hard-coded in the
            doc to stop the dev overlay swallowing Playwright clicks. Here the
            root provider stands down instead and this provider owns the
            inspector — see <code>lib/inspector.ts</code>, which coordinates
            both sides, because two on one page is fatal.
          </li>
          <li>
            The page carries a{" "}
            <code>WhenFrameworkHas flag=&quot;voice_backend_pattern&quot;</code>{" "}
            block describing the Google ADK agent hop. It is Google ADK content
            on a Claude page, and does not apply.
          </li>
        </ul>
      </Panel>

      <Panel title="The agent">
        <SourceCodeGroup
          files={[{ file: "backend/src/agents/registry.py", region: "registry" }]}
          note="The `voice` entry is the Quickstart adapter. Transcription happens entirely in the Next runtime; the Python side receives an ordinary text message."
        />
      </Panel>
    </>
  );
}
