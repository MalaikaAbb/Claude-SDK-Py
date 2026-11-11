// From the Code tab of
// https://docs.copilotkit.ai/claude-sdk-python/generative-ui/mcp-apps
// (src/app/api/copilotkit-mcp-apps/route.ts). The `CopilotRuntime` block is
// verbatim, including its comments and `@ts-ignore`. Harness changes are
// marked `HARNESS:`.
//
// CopilotKit runtime for the MCP Apps cell (Claude Agent SDK Python backend).
//
// The runtime's `mcpApps` config auto-applies the MCP Apps middleware to the
// agent: when the agent calls a tool backed by an MCP UI resource, the
// middleware fetches the resource and emits the activity event that the
// built-in `MCPAppsActivityRenderer` (registered by CopilotKit internally)
// renders in the chat as a sandboxed iframe.

import { HttpAgent, type AbstractAgent } from "@ag-ui/client";
import {
  CopilotRuntime,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";

import { AGENT_URL } from "@/lib/agents";

// HARNESS: the Code tab builds each agent with `createClaudeHttpAgent` from
// `@/app/api/_shared/claude-http-agent`, which is never published. This repo
// reaches its Python agents with a plain `HttpAgent` on every runtime route,
// so that is used here. Nothing is mounted at `${AGENT_URL}/mcp-apps`: the
// Code tab's agent module cannot run (unpublished import) and is not
// replaced, so runs on this route fail with a 404 from the agent server.
// HARNESS: the Code tab also registers a `headless-complete` agent here for a
// different cell. This repo has no `headless-complete` agent (README §8), so
// that line is left out.
const agents: Record<string, AbstractAgent> = {
  "mcp-apps": new HttpAgent({ url: `${AGENT_URL}/mcp-apps` }),
};

// The `mcpApps.servers` config is all you need server-side. The runtime
// auto-applies the MCP Apps middleware to every registered agent: on each
// MCP tool call it fetches the associated UI resource and emits an
// `activity` event that the built-in `MCPAppsActivityRenderer` renders
// inline in the chat.
const runtime = new CopilotRuntime({
  // @ts-ignore -- Published CopilotRuntime agents type wraps Record in MaybePromise<NonEmptyRecord<...>> which rejects plain Records; fixed in source, pending release
  agents,
  mcpApps: {
    servers: [
      {
        type: "http",
        url: process.env.MCP_SERVER_URL || "https://mcp.excalidraw.com",
        // Always pin a stable `serverId`. Without it CopilotKit hashes the
        // URL, and a URL change silently breaks restoration of persisted
        // MCP Apps in prior conversation threads.
        serverId: "excalidraw",
      },
    ],
  },
});

// HARNESS: the Code tab serves this at a fixed `route.ts` with
// `mode: "single-route"` inside a POST-only try/catch. With the page's
// relative `runtimeUrl`, a single-route endpoint throws `Invalid URL` on the
// first message in this CopilotKit version (README §9.19). This repo's
// existing fix for that is applied here too: a `[[...slug]]` catch-all on the
// default multi-route mode. The Code tab's error wrapper only logs and
// returns a 500, so it is left out.
const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit-mcp-apps",
});

export { handler as GET, handler as POST, handler as PATCH, handler as DELETE };
