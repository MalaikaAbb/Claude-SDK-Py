import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

const DIR = "frontend/src/app/webmcp/_demo";

export default function Page() {
  return (
    <>
      <RouteHeader path="/webmcp" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A frontend tool with <code>webmcp</code> set is also published to{" "}
          <code>document.modelContext</code>, so a WebMCP-aware browser agent
          can discover and call the same handler the CopilotKit agent uses. The
          second snippet registers the tool on a bare{" "}
          <code>CopilotKitCore</code>, with no provider, runtime or agent.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "(Chrome 149+, WebMCP flag) Call searchOrders with status \"open\" from the Model Context Tool Inspector.",
            ]}
            expect="The inspector lists searchOrders with its schema and readOnlyHint. Calling it is expected to fail today (see the gap below)."
            fail="The inspector shows no tool: the browser does not expose document.modelContext, or the webmcp option did not reach the registry."
          />
        </div>
      </Panel>

      <Panel title="The code — as published">
        <SourceCodeGroup
          files={[{ file: `${DIR}/OrderSearch.tsx` }, { file: `${DIR}/webmcp.ts` }]}
          note="Each file is the page's snippet, verbatim, with a @ts-expect-error on the undefined searchOrders call."
        />
      </Panel>

      <Panel title="Harness around it">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/webmcp/demo-chat/page.tsx" },
            { file: "frontend/src/app/webmcp/demo-chat/core-only/page.tsx" },
          ]}
        />
      </Panel>

      <Callout tone="warn" title="Broken as published">
        <ul className="space-y-1.5">
          <li>
            · Doc gap: <code>searchOrders(status)</code> is called by both
            snippets and defined by neither. It is not stubbed, so calling the
            tool throws <code>ReferenceError: searchOrders is not defined</code>.
          </li>
          <li>
            · The page prints no backend agent, so there is no chat on this
            route; the tool only registers with the provider and with{" "}
            <code>document.modelContext</code>.
          </li>
          <li>
            · Route layout and the two demo pages are ported from the
            aws-strands-py harness; the two snippet files are this page&apos;s,
            which is identical there.
          </li>
          <li>
            · <code>@copilotkit/core</code> is imported by the core-only
            snippet but is not a direct dependency in{" "}
            <code>package.json</code>; it resolves because{" "}
            <code>@copilotkit/react-core</code> installs it.
          </li>
          <li>
            · The core-only snippet is loaded on its own page so its{" "}
            <code>CopilotKitCore</code> does not register a second{" "}
            <code>searchOrders</code> beside the provider&apos;s.
          </li>
        </ul>
      </Callout>
    </>
  );
}
