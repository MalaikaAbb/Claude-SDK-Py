/**
 * `/custom-look-and-feel/headless-ui` — a chat built from `useAgent`,
 * `useCopilotKit` and `useRenderToolCall`, with no CopilotKit chrome at all.
 *
 * That is the whole point of the page, and it is also why every shared default
 * misses it. The composer is a bare `<input>` with no `type` attribute, so the
 * global `chatInput` does not match it; there is no `copilot-chat` root, so
 * there is no run flag; and the replies are the repo's own `AssistantBubble`,
 * so `copilot-assistant-message` matches nothing either. Driven with the
 * defaults the page fails at the first step with "input never became visible",
 * which reads like a broken demo and is not one.
 *
 * All three overrides are therefore passed per-call, exactly as ADAPT.md
 * prescribes for a page that replaces the message view, rather than widening
 * the global contract for one route's sake.
 *
 * ── The bubble selector has to be plain CSS ───────────────────────────────
 * The obvious selector here is `div:has(> span:text-is("AI"))` — the assistant
 * bubble opens with an "AI" avatar span, the user's with a "You" one. It is also
 * a trap: `:text-is()` is Playwright's own pseudo-class, and message selectors
 * are evaluated *inside the page* with `querySelectorAll`, which rejects it as a
 * syntax error. The throw is swallowed as "no messages", so the page answers
 * normally and the recorder waits out its full window insisting nothing ever
 * arrived.
 *
 * So the bubbles are told apart by the one class that differs: both use
 * `flex w-full items-start gap-3`, and `UserBubble` adds `flex-row-reverse` to
 * put the avatar on the right. Negating that leaves the assistant's, in CSS the
 * browser will accept.
 *
 * ── The fourth thing this page does differently ────────────────────────────
 * It pins its composer to the bottom edge, which at 1920×1080 puts both the
 * input and the Send button *under* the simulated taskbar (y≈1045, and the bar
 * owns everything from 1032 down). The bar swallows pointer events, so without
 * the passthrough below the click that should focus the composer never lands,
 * the typing goes nowhere, and the page fails as "agent never started a run" —
 * having never been asked anything. See `taskbar-passthrough.ts`.
 */

import { type Page } from 'playwright';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { sendAndWait } from './chat';
import { isUnderTaskbar, withTaskbarClickThrough } from './taskbar-passthrough';

/** The page's own composer and submit control. */
const INPUT = 'input[placeholder="Type a message…"]';
const SUBMIT = 'button[type="submit"]';

/** One assistant bubble. Plain CSS — see the note above. */
export const HEADLESS_ASSISTANT = 'div.w-full.items-start.gap-3:not(.flex-row-reverse)';

export const runHeadlessUiAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   [Headless UI] Driving the page's own composer — no CopilotKit chrome here.`);

  const drive = () =>
    sendAndWait(page, config.prompt, {
      inputSelector: INPUT,
      submitSelector: SUBMIT,
      messageSelector: HEADLESS_ASSISTANT,
      // No run flag on this surface, so completion is decided by text stability
      // alone and the turn is given room to finish.
      postWaitMs: config.waitAfterPromptMs ?? 4000,
      label: config.id,
    });

  // Only pay for the workaround if this layout actually collides with the bar.
  if (await isUnderTaskbar(page, INPUT)) {
    await withTaskbarClickThrough(page, drive);
  } else {
    await drive();
  }
};
