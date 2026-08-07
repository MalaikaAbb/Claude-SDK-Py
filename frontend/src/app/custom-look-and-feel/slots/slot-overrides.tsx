"use client";

import {
  CopilotChatAssistantMessage,
  CopilotChatInput,
  CopilotChatView,
} from "@copilotkit/react-core/v2";
import type { ComponentProps } from "react";

/**
 * The three slot components the page names and never defines.
 *
 * Its `slot-overrides.snippet.tsx` is a teaching extract: it opens with
 * `declare const CustomWelcomeScreen`, `CustomAssistantMessage` and
 * `CustomDisclaimer`, then shows the three casts that hand them to the slot
 * props. The casts are what the page is about, and they are reproduced on the
 * demo page. These are the bodies, kept as small as an override can be while
 * still being obviously in effect.
 *
 * Two are wrappers rather than replacements — the assistant message and the
 * disclaimer both render the default component inside their own chrome, which
 * is the pattern the page describes ("wraps the default component with a
 * tinted card and a small 'slot' badge").
 */

/**
 * The `welcomeScreen` slot is not decoration — it *is* the empty state.
 *
 * It receives `input` and `suggestionView` as ready-made elements and is
 * responsible for putting them on the page; the default implementation renders
 * the welcome message, then the input, then the suggestions. A replacement that
 * ignores those props therefore removes the composer entirely, and the chat
 * looks broken until the first message exists to switch the view over.
 *
 * The doc's teaching extract is `declare const CustomWelcomeScreen:
 * ComponentType` — a component taking no props at all — which is exactly the
 * shape that loses the input. See the route page.
 */
export function CustomWelcomeScreen({
  input,
  suggestionView,
}: ComponentProps<typeof CopilotChatView.WelcomeScreen>) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4">
      <div className="flex w-full max-w-3xl flex-col items-center">
        <div className="mb-6 w-full rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 p-8 text-white">
          <p className="text-xs uppercase tracking-[0.18em] opacity-80">
            welcomeScreen slot
          </p>
          <h2 className="mt-2 text-xl font-semibold">Ask me something</h2>
        </div>
        <div className="w-full">{input}</div>
        <div className="mt-4 flex justify-center">{suggestionView}</div>
      </div>
    </div>
  );
}

export function CustomAssistantMessage(
  props: ComponentProps<typeof CopilotChatAssistantMessage>,
) {
  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-2 dark:border-indigo-900 dark:bg-indigo-950/40">
      <span className="ml-1 rounded-full border border-indigo-300 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-indigo-700 dark:text-indigo-300">
        slot
      </span>
      <CopilotChatAssistantMessage {...props} />
    </div>
  );
}

export function CustomDisclaimer() {
  return (
    <p className="px-3 py-1.5 text-center text-xs text-indigo-600 dark:text-indigo-400">
      disclaimer slot · replies are generated and may be wrong
    </p>
  );
}

export type DisclaimerSlot = typeof CopilotChatInput.Disclaimer;
