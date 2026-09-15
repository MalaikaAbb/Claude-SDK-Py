/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ADAPT THIS FILE — 2 of 3
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The DOM contract: how the recorder finds the chat surface it has to drive.
 *
 * This is the file that changes when the *frontend* changes rather than the
 * backend — a React project using CopilotKit's prebuilt components and an
 * Angular one rendering its own chat need different answers here, even though
 * both document the same features.
 *
 * These are Playwright selectors, so `:has-text()` and friends are available.
 * Keep each one as narrow as the app allows; a selector that matches a wrapping
 * container will still "work" and then position the cursor somewhere useless.
 *
 * `npm run doctor --online` checks each of these against a live demo page and
 * reports which ones match nothing, so you find out here rather than by
 * watching twenty-six videos.
 *
 * ── Why these are `data-testid`s ───────────────────────────────────────────
 * CopilotKit v2 ships stable test hooks on every part of the chat it renders —
 * `copilot-chat`, `copilot-chat-textarea`, `copilot-send-button`,
 * `copilot-assistant-message`, and two dozen more. They are the published
 * contract for exactly this job, and they are what the app's own code reaches
 * for (`voice/sample-audio-button.tsx` targets the textarea by test id).
 *
 * The class names still exist alongside them and still work, but they are the
 * weaker choice: `.copilotKitAssistantMessage` sits on the same node as
 * utility classes that churn between releases, and the loose
 * `[class*="assistant"]` fallback this file used to carry matched toolbar
 * furniture as well as messages — which inflates the message count that
 * decides whether a *new* reply has arrived.
 *
 * Verified against every demo route in this repo: 25 of 26 expose all four
 * hooks, and the twenty-sixth (`custom-look-and-feel/headless-ui`) renders no
 * CopilotKit chrome at all by design and passes its own selectors from
 * `actions/headless-ui.action.ts`.
 */

export interface SelectorContract {
  /** The prompt box. First match wins, so order matters. */
  chatInput: string;

  /**
   * Send control. Optional: when it matches nothing the recorder presses Enter.
   *
   * It does not match nothing here. CopilotKit v2's send button carries no
   * `type="submit"`, no `aria-label` and no text — which is why this used to be
   * a list of guesses that all missed and every prompt submitted via the Enter
   * fallback — but it does carry `data-testid="copilot-send-button"`. Targeting
   * it means the cursor visibly travels to Send and clicks, which is both more
   * faithful and better footage.
   *
   * Checked for the hazard ADAPT.md warns about: the simulated taskbar owns the
   * bottom 48px (y >= 1032) and swallows clicks landing there. The send button
   * sits at y 559–991 across every route in this repo, so the click always
   * reaches it.
   */
  chatSubmit: string;

  /**
   * Assistant messages, used to detect that a reply started and finished.
   * Must match *only* messages — matching a container makes every reply look
   * complete the instant it starts.
   *
   * Pages that replace the message view via a slot need their own selector;
   * pass it per-call rather than changing this default.
   */
  assistantMessage: string;

  /** Any of these appearing means the demo has rendered enough to drive. */
  chatReady: string;

  /** Doc page has painted enough to start reading. */
  docContentReady: string;

  /** Code blocks on the doc page, so the cursor can rest on one. */
  docCodeBlock: string;
}

export const SELECTORS: SelectorContract = {
  // The bare `textarea` tail keeps this working if a future surface renders a
  // composer without the test id.
  chatInput: '[data-testid="copilot-chat-textarea"], textarea',

  chatSubmit: '[data-testid="copilot-send-button"]',

  assistantMessage: '[data-testid="copilot-assistant-message"]',

  // Deliberately wider than the rest: this one gates the whole demo step, and
  // one route in this repo renders its own chat with no CopilotKit markup.
  //
  // The `:not()` pair is load-bearing, and the reason is a Playwright detail
  // worth knowing. `waitForSelector(..., { state: 'visible' })` resolves a
  // selector list in **DOM order, not list order**, then waits for *that* element
  // to become visible. The Multimodal Attachments route renders its hidden
  // `<input type="file">` before the chat root, so without these exclusions the
  // gate latches onto a permanently 0×0 element and times out — on a page that is
  // fully rendered and perfectly drivable. Ordering the list more carefully does
  // not help; excluding the element does.
  chatReady:
    '[data-testid="copilot-chat"], [data-testid="copilot-chat-textarea"], textarea, ' +
    'input:not([type="file"]):not([type="hidden"]), [contenteditable="true"]',

  docContentReady: 'h1, article, main, [class*="content"], pre',

  docCodeBlock: 'pre, div[class*="code"], code',
};
