import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, Panel } from "@/components/ui";

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

      <Callout tone="warn" title="Broken as published: reference only">
        <p className="leading-relaxed">
          Nothing on this route runs. The Code tab&apos;s agent
          (<code>mcp_apps_agent.py</code>) imports{" "}
          <code>normalize_claude_model</code> from an unpublished{" "}
          <code>agents.claude_agent_sdk_adapter</code>; its runtime imports an
          unpublished <code>createClaudeHttpAgent</code>; its page imports an
          unpublished <code>./chat</code>. All three files are kept verbatim
          and not wired up, and nothing is written in their place.
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
      </Panel>

      <Panel title="The Code tab's page and runtime — verbatim, not mounted">
        <SourceCodeGroup
          files={[{ file: `${DIR}/_doc/page.tsx` }, { file: `${DIR}/_doc/route.ts` }]}
          note="Type-checked only. The unpublished ./chat and createClaudeHttpAgent imports carry @ts-expect-error."
        />
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

      <Callout tone="warn" title="What the page leaves out">
        <ul className="space-y-1.5">
          <li>
            · <code>agents.claude_agent_sdk_adapter.normalize_claude_model</code>{" "}
            (agent), <code>@/app/api/_shared/claude-http-agent</code> (runtime)
            and <code>./chat</code> (page) are never published.
          </li>
          <li>
            · The Intelligence snippet builds a CopilotKit{" "}
            <code>BuiltInAgent</code> on an OpenAI model and needs an
            Intelligence API key; it is shown as text only.
          </li>
        </ul>
      </Callout>
    </>
  );
}
