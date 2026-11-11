import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const DIR = "frontend/src/app/generative-ui/mcp-apps";

// The page's "MCP Apps with Intelligence" runtime, verbatim. Not run: it
// builds a BuiltInAgent (this harness runs Claude agents only) and needs a
// CopilotKit Intelligence API key. See the callout below.
const WITH_INTELLIGENCE = `import {
  BuiltInAgent,
  CopilotKitIntelligence,
  CopilotRuntime,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";

const agent = new BuiltInAgent({
  model: "openai/gpt-6-luna",
  prompt: "You are a helpful assistant.",
});

const runtime = new CopilotRuntime({
  agents: { default: agent },
  // Intelligence stores threads and runs. Do not pass \`runner\` as well.
  intelligence: new CopilotKitIntelligence({
    apiKey: process.env.CPK_INTELLIGENCE_API_KEY!,
  }),
  // Replace this fixed user with the user from your verified session.
  identifyUser: () => ({ id: "demo-user", name: "Demo User" }),
  // Unchanged from the in-memory setup.
  mcpApps: {
    servers: [
      {
        type: "http",
        url: "https://mcp.excalidraw.com/mcp",
        serverId: "excalidraw",
      },
    ],
  },
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit",
});

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const DELETE = handler;`;

const SAME_ORIGIN = `<CopilotKit runtimeUrl="/api/copilotkit" mcpApps={{ allowSameOriginFallback: true }}>
  {children}
</CopilotKit>`;

const TRANSPORTS = `{
  type: "http",
  url: "http://localhost:3101/mcp",
  serverId: "my-http-server"
}

{
  type: "sse",
  url: "https://mcp.example.com/sse",
  headers: {
    "Authorization": "Bearer token"
  },
  serverId: "my-sse-server"
}`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/mcp-apps" />

      <Callout tone="warn" title="Broken as published: the agent cannot run">
        <p className="leading-relaxed">
          The Code tab&apos;s <code>mcp_apps_agent.py</code> is a hand-written
          streaming loop over the raw Anthropic API, and it imports{" "}
          <code>normalize_claude_model</code> from an{" "}
          <code>agents.claude_agent_sdk_adapter</code> module that is never
          published. It is kept verbatim and unwired in{" "}
          <code>backend/src/agents/doc_reference/mcp_apps_agent.py</code>, and
          nothing is put in its place: no agent is mounted at{" "}
          <code>/mcp-apps</code>, so the runtime&apos;s calls to it fail. The
          runtime config and demo page are the Code tab&apos;s.
        </p>
      </Callout>

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A remote MCP server (Excalidraw) whose tools come with their own UI.
          The runtime&apos;s <code>mcpApps.servers</code> entry attaches a
          middleware that adds the server&apos;s tools to each run and, when
          the agent calls one, fetches the tool&apos;s UI resource and emits an
          activity event. The provider&apos;s built-in renderer draws it as a
          sandboxed iframe in the chat, so the frontend is a plain chat.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Draw a simple diagram: browser → Next.js runtime → Python agent → Claude."]}
            expect="As a report: an agent error in the chat (the runtime gets a 404 from the Python server, because no mcp-apps agent is mounted). As the page intends: an Excalidraw canvas in the chat, then one sentence."
            fail="A working canvas would mean something mounted an mcp-apps agent, which this route deliberately does not."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCodeGroup
          files={[
            { file: `${DIR}/mcp-apps-demo.tsx` },
            { file: `${DIR}/chat.tsx` },
          ]}
          note="Top: the Code tab's page, verbatim. Bottom: the Chat stand-in the page imports and never publishes."
        />
      </Panel>

      <Panel title="The runtime">
        <SourceCode file="frontend/src/app/api/copilotkit-mcp-apps/[[...slug]]/route.ts" />
      </Panel>

      <Panel title="The agent">
        <SourceCode file="backend/src/agents/doc_reference/mcp_apps_agent.py" />
      </Panel>

      <Panel
        title="Published but not run"
        description="The Intelligence runtime, the same-origin opt-in, and the two transport shapes."
      >
        <div className="space-y-4">
          <CodeBlock code={WITH_INTELLIGENCE} filename="MCP Apps with Intelligence" language="ts" />
          <CodeBlock code={SAME_ORIGIN} filename="allowSameOriginFallback" language="tsx" />
          <CodeBlock code={TRANSPORTS} filename="Transport types" language="ts" />
        </div>
      </Panel>

      <Callout tone="warn" title="Gaps and harness changes">
        <ul className="space-y-1.5">
          <li>
            · The Code tab&apos;s runtime builds agents with{" "}
            <code>createClaudeHttpAgent</code> from an unpublished{" "}
            <code>@/app/api/_shared/claude-http-agent</code>; this repo&apos;s
            usual <code>HttpAgent</code> wiring is used. Its extra{" "}
            <code>headless-complete</code> agent is left out (no such agent
            here).
          </li>
          <li>
            · The Code tab serves a fixed <code>route.ts</code> in{" "}
            <code>single-route</code> mode. With a relative{" "}
            <code>runtimeUrl</code> that crashes on the first message in this
            CopilotKit version (README §9.19), so the route uses this
            repo&apos;s existing catch-all, multi-route fix.
          </li>
          <li>
            · The Intelligence snippet builds a CopilotKit{" "}
            <code>BuiltInAgent</code> on an OpenAI model. This harness runs
            Claude agents only, and Intelligence needs an API key, so it is
            shown, not run. Its <code>mcpApps</code> block is the same as the
            one running above, apart from the <code>/mcp</code> URL suffix.
          </li>
          <li>· <code>Chat</code> is rendered and never defined; a minimal labelled one (a plain <code>CopilotChat</code>, as the page describes) is added.</li>
        </ul>
      </Callout>
    </>
  );
}
