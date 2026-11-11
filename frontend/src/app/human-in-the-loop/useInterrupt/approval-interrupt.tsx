"use client";

// "Approve / Cancel example" from
// https://docs.copilotkit.ai/claude-sdk-python/human-in-the-loop/useInterrupt,
// verbatim between the region markers. Only the imports and `export` are
// added; the page prints the component without them.
import { useInterrupt } from "@copilotkit/react-core/v2";

// #region approval-interrupt
export function ApprovalInterrupt() {
  useInterrupt({
    render: ({ interrupt, resolve, cancel }) => (
      <div className="p-3 border rounded">
        <p>{interrupt?.message ?? "Approve this action?"}</p>
        <div className="mt-2 flex gap-2">
          <button onClick={() => resolve({ approved: true })}>Approve</button>
          <button onClick={() => cancel()}>Cancel</button>
        </div>
      </div>
    ),
  });
  return null;
}
// #endregion
