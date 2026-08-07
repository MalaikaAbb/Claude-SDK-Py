/**
 * The agent ids this app can address.
 *
 * Mirrors the keys of `REGISTRY` in `backend/src/agents/registry.py`, which is
 * also where each agent is mounted: id `tool-rendering` is served at
 * `${AGENT_URL}/tool-rendering`. Keeping the list here rather than fetching it
 * means the runtime route can be built synchronously at module load.
 *
 * The Quickstart registers exactly one agent (`claude_agent`) at the server
 * root. This harness needs one conversation per doc route, so the Python
 * server mounts each agent at its own path with
 * `add_claude_fastapi_endpoint(app, adapter, path=f"/{agent_id}")` and each
 * gets its own `HttpAgent`.
 */

export const AGENT_IDS = [
  "claude_agent",
  "agentic_chat",
  "prebuilt-sidebar",
  "prebuilt-popup",
  "chat-controls",
  "chat-customization-css",
  "chat-slots",
  "headless-simple",
  "reasoning-default",
  "reasoning-custom",
  "multimodal",
  "voice",
  "tool-rendering",
  "gen-ui-tool-based",
  "a2ui-fixed-schema",
  "declarative-gen-ui",
  "frontend_tools",
  "hitl-in-chat",
  "programmatic-control",
  "shared-state-read-write",
  "shared-state-streaming",
  "readonly-state-agent-context",
  "subagents",
  "agent-config",
] as const;

export type AgentId = (typeof AGENT_IDS)[number];

/** Where the Python agent server is listening. */
export const AGENT_URL = process.env.AGENT_URL ?? "http://localhost:8000";

/** The one agent the A2UI fixed-schema route scopes its runtime middleware to. */
export const A2UI_FIXED_AGENT_ID = "a2ui-fixed-schema";
