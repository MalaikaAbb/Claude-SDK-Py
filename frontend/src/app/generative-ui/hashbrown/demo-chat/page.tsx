"use client";

import { CopilotKit } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";
import { nestedInspectorSetting } from "@/lib/inspector";

import { Chat } from "../chat";
import { HashBrownDashboard } from "../hashbrown-renderer";

const AGENT_ID = "declarative-hashbrown-demo";

/**
 * The page's `page.tsx`, as published, inside this repo's demo frame. The
 * frame already shows a title, so the page's own header is kept but
 * `h-screen` became `h-full`.
 *
 * `HashBrownDashboard` builds the UI kit once; `chat.tsx` puts
 * `HashBrownRenderMessage` in the assistant-message slot, which feeds the
 * streaming reply to `useJsonParser` and renders whatever part of the `ui`
 * array has parsed so far.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/generative-ui/hashbrown" subtitle={`agent: ${AGENT_ID}`}>
      <CopilotKit
        runtimeUrl="/api/copilotkit-declarative-hashbrown"
        agent={AGENT_ID}
        // Owns the inspector on this route — see `lib/inspector.ts`.
        enableInspector={nestedInspectorSetting}
      >
        <HashBrownDashboard>
          <div className="flex h-full flex-col gap-3 p-6">
            <header>
              <h1 className="text-lg font-semibold">Declarative UI: Hashbrown</h1>
              <p className="text-sm text-[var(--muted-foreground)]">
                Streaming structured output via <code>@hashbrownai/react</code>.
                The agent emits a catalog-constrained UI envelope that renders
                progressively as data streams.
              </p>
            </header>
            <div className="flex-1 overflow-hidden rounded-md border border-[var(--border)]">
              <Chat />
            </div>
          </div>
        </HashBrownDashboard>
      </CopilotKit>
    </DemoFrame>
  );
}
