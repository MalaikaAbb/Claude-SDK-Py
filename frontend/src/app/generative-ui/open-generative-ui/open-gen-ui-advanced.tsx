"use client";

/**
 * "Register sandbox functions on the provider", as published, with three
 * harness changes:
 *
 * - `import { openGenUiSuggestions } from "./suggestions";` is commented
 *   out. The page never prints `./suggestions` and the snippet never uses
 *   the value (suggestion chips are a showcase extra).
 * - `Chat` is imported from `./chat`. The page renders it without defining it.
 * - The closing `);` and `}` are added. The published block stops after
 *   `</CopilotKit>`.
 *
 * `./sandbox-functions` is the Code tab's file, verbatim.
 */

import { Chat } from "./chat";

// #region advanced — verbatim except the changes listed above
import React from "react";
import {
  CopilotKit,
  CopilotChat,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";
import { openGenUiSandboxFunctions } from "./sandbox-functions";
// HARNESS: unpublished module, see above.
// import { openGenUiSuggestions } from "./suggestions";

export default function OpenGenUiAdvancedDemo() {
  return (
    // Pass the sandbox-function array on the `openGenerativeUI` provider prop.
    // The built-in `OpenGenerativeUIActivityRenderer` wires these as callable
    // remotes inside the agent-authored iframe.
    <CopilotKit
      runtimeUrl="/api/copilotkit-ogui"
      agent="open-gen-ui-advanced"
      openGenerativeUI={{ sandboxFunctions: openGenUiSandboxFunctions }}
    >
      <div className="flex justify-center items-center h-screen w-full">
        <div className="h-full w-full max-w-4xl">
          <Chat />
        </div>
      </div>
    </CopilotKit>
  );
}
// #endregion
