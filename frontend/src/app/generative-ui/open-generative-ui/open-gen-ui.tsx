"use client";

import { CopilotKit } from "@copilotkit/react-core/v2";

import { Chat } from "./chat";

/**
 * "Drop <CopilotChat /> into the page". The published block starts mid-function
 * at its comment and `return (`, so the function wrapper and imports are
 * harness-authored.
 *
 * One line is commented out, not removed:
 *   openGenerativeUI={{ designSkill: VISUALIZATION_DESIGN_SKILL }}
 * `VISUALIZATION_DESIGN_SKILL` is never defined or imported on the page, so
 * the default design skill applies instead.
 */
export default function OpenGenUiDemo() {
  // #region minimal — verbatim except the line noted above
  // Minimal Open Generative UI frontend: the built-in activity renderer is
  // registered by CopilotKitProvider, so a plain <CopilotChat /> is enough —
  // no custom tool renderers, no activity-renderer registration.
  // We DO pass `openGenerativeUI.designSkill` to swap in visualisation-tuned
  // guidance in place of the default shadcn design skill.
  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit-ogui"
      agent="open-gen-ui"
      // HARNESS: VISUALIZATION_DESIGN_SKILL is unpublished.
      // openGenerativeUI={{ designSkill: VISUALIZATION_DESIGN_SKILL }}
    >
      <div className="flex justify-center items-center h-screen w-full">
        <div className="h-full w-full max-w-4xl flex flex-col p-3">
          <Chat />
        </div>
      </div>
    </CopilotKit>
  );
  // #endregion
}
