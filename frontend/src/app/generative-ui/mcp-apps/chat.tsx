"use client";

// NOT DOC CODE. The MCP Apps Code tab imports `Chat` from "./chat" and never
// publishes it. The page says a plain <CopilotChat /> is enough, so that is
// all this is (same stand-in as the google-adk harness). The agent comes
// from the surrounding `<CopilotKit agent="mcp-apps">`.
import { CopilotChat } from "@copilotkit/react-core/v2";

export function Chat() {
  return <CopilotChat className="h-full" />;
}
