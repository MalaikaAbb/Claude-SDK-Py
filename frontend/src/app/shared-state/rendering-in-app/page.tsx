import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/shared-state/rendering-in-app" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          That there is nothing chat-specific about reading agent state.{" "}
          <code>useAgent</code> works in any component under the provider, so
          the canvas here is the primary content and the chat is docked beside
          it. Both are consumers of the same agent and the same state object;
          remove the sidebar and the canvas still updates.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Set the canvas title to 'My Canvas'.",
            ]}
            expect="The canvas title updates to 'My Canvas'."
            fail="The canvas title does not update."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/shared-state/rendering-in-app/demo-chat/page.tsx" />
      </Panel>

     
    </>
  );
}
