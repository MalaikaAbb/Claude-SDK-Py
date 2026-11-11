"use client";

import { CopilotChat } from "@copilotkit/react-core/v2";

/**
 * NOT DOC CODE. Both of the page's snippets render `<Chat />` and neither
 * defines it (the Code tab's page files are not served either). The minimal
 * snippet's own comment says a plain `<CopilotChat />` is enough, so that is
 * all this is; the agent comes from the surrounding `<CopilotKit agent=…>`.
 * Same stand-in as the google-adk harness.
 */
export function Chat() {
  return <CopilotChat className="h-full" />;
}
