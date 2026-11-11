"use client";

// Doc snippet "Tool calls" from
// https://docs.copilotkit.ai/claude-sdk-python/custom-look-and-feel/slots,
// copied verbatim below the marker. It is type-checked with the rest of the
// app but not mounted: the `chat-slots` agent has no tools, so a tool-call
// container would never render on the slots demo. See the route page.

// #region doc-tool-calls
import {
  CopilotChat,
  CopilotChatToolCallsView,
  type CopilotChatToolCallsViewProps,
} from "@copilotkit/react-core/v2";

const CustomToolCallsView = (props: CopilotChatToolCallsViewProps) => (
  <div className="rounded-lg border border-dashed p-2">
    <CopilotChatToolCallsView {...props} />
  </div>
);

export function Chat() {
  return (
    <CopilotChat
      messageView={{
        assistantMessage: { toolCallsView: CustomToolCallsView },
      }}
    />
  );
}
// #endregion doc-tool-calls
