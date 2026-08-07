import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/custom-look-and-feel/headless-ui" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The chat with all CopilotKit chrome removed. Three hooks do the work:{" "}
          <code>useAgent</code> for the conversation and run state,{" "}
          <code>useCopilotKit</code> for the <code>runAgent</code> entry point,
          and <code>useRenderToolCall</code> to paint any registered tool call
          inline. Everything visible is this repo&apos;s markup.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Give me three ideas for a weekend project."]}
            expect="Right-aligned user bubble, a 'Thinking…' line, then the reply streaming into the assistant bubble."
            fail="The message appears but nothing streams back — the run went out but the subscription is not re-rendering."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/custom-look-and-feel/headless-ui/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The two bubbles"
        description="Pure chrome, in the page's phrase — they import no chat primitives and only style what they are handed."
      >
        <SourceCode file="frontend/src/app/custom-look-and-feel/headless-ui/message-bubbles.tsx" />
      </Panel>

      <Panel title="Doc-vs-implementation notes">
        <ul className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            The page covers two cells, <code>headless-simple</code> and{" "}
            <code>headless-complete</code>, and publishes neither in full. This
            route is <code>headless-simple</code>: its <code>send</code>{" "}
            function and its message <code>.map()</code> are the doc&apos;s
            verbatim, and the tool-call indexing is the block the page shows for{" "}
            <code>headless-complete</code>, which is the only place the
            composition appears.
          </li>
          <li>
            <code>createMessageId()</code> is called by every published snippet
            and defined by none. It is a <code>crypto.randomUUID()</code> call
            here.
          </li>
          <li>
            The published <code>AssistantBubble</code> and{" "}
            <code>UserBubble</code> reference <code>Avatar</code>,{" "}
            <code>AvatarFallback</code>, <code>Bot</code>, <code>User</code>,{" "}
            <code>cn</code>, <code>ReactMarkdown</code>, <code>remarkGfm</code>,{" "}
            <code>AttachmentChip</code>, <code>MultimodalPart</code> and{" "}
            <code>Attachment</code> without importing or defining any of them.
            The versions here keep the structure and drop the stack.
          </li>
          <li>
            <code>useRenderActivityMessage</code> and{" "}
            <code>useRenderCustomMessages</code> are named as the other two
            hooks behind <code>headless-complete</code>. Neither has a published
            usage beyond a one-line mention, so this route does not attempt
            them; A2UI activity messages are covered on the two A2UI routes
            instead.
          </li>
        </ul>
      </Panel>
    </>
  );
}
