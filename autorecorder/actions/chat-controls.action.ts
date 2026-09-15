/**
 * `/prebuilt-components/chat-controls` — open/close from your own UI, and
 * thumbs-up/down feedback.
 *
 * Two features share the page and both need driving:
 *
 *   1. `useCopilotChatConfiguration().setModalOpen` behind a button that is a
 *      *sibling* of the sidebar rather than a child of it. The label flips
 *      between "Open Sidebar" and "Close Sidebar", which makes the round trip
 *      self-evidencing: if the second click's label is not back to the first
 *      one, the two-way sync the page exists to demonstrate is broken.
 *   2. `messageView.assistantMessage.onThumbsUp`, wired to a visible log. The
 *      thumbs-up control only exists once there is a reply to rate, so the
 *      order here is fixed: prompt, wait, rate.
 *
 * The log starting at "Nothing rated yet." is what makes the rating provable —
 * a row appearing is the callback having fired, not the button having been
 * clicked.
 */

import { type Page } from 'playwright';
import { humanClick, humanGlide, sleep } from '../core/overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { sendAndWait } from './chat';

const TOGGLE = 'button:has-text("Sidebar")';
const THUMBS_UP = '[data-testid="copilot-thumbs-up-button"]';
/**
 * One row of the feedback log.
 *
 * Counted through Playwright's locator engine below rather than with an in-page
 * `querySelectorAll`, so the extended syntax would be legal here — but the rows
 * are plain `<li class="font-mono">` and saying so directly is cheaper than
 * asking the engine to text-match a section heading on every poll.
 */
const FEEDBACK_ROW = 'ul li.font-mono';
const NOTHING_RATED = 'text=Nothing rated yet.';

async function clickWithCursor(page: Page, selector: string): Promise<boolean> {
  const el = page.locator(selector).first();
  if (!(await el.isVisible({ timeout: 3000 }).catch(() => false))) return false;
  const box = await el.boundingBox();
  if (box) {
    await humanGlide(page, box.x + box.width / 2, box.y + box.height / 2, 20);
    await sleep(300);
    await humanClick(page);
  } else {
    await el.click();
  }
  return true;
}

export const runChatControlsAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  // ── 1/3: the reply to rate ───────────────────────────────────────────────
  console.log(`   [Chat Controls] 1/3: sending a prompt so there is a reply to rate...`);
  await sendAndWait(page, config.prompt, { postWaitMs: 1200, label: config.id });

  // ── 2/3: feedback ────────────────────────────────────────────────────────
  console.log(`   [Chat Controls] 2/3: rating the reply...`);
  const before = await page.locator(FEEDBACK_ROW).count();

  // The toolbar reveals on hover over the message, so glide there first.
  const thumbs = page.locator(THUMBS_UP).last();
  if (!(await thumbs.isVisible({ timeout: 8000 }).catch(() => false))) {
    throw new Error(
      'No thumbs-up control appeared on the reply, so the feedback half of this ' +
        'page cannot be exercised. The assistantMessage slot overrides may not have ' +
        'been applied.',
    );
  }
  const tBox = await thumbs.boundingBox();
  if (tBox) {
    await humanGlide(page, tBox.x + tBox.width / 2, tBox.y + tBox.height / 2, 20);
    await sleep(400);
    await humanClick(page);
  } else {
    await thumbs.click();
  }

  // Polled through the locator engine rather than `waitForFunction`: the
  // callback of the latter runs inside the page, where any Playwright-only
  // selector syntax is a silent SyntaxError rather than a match.
  let logged = false;
  for (let waited = 0; waited < 8000 && !logged; waited += 250) {
    logged = (await page.locator(FEEDBACK_ROW).count().catch(() => before)) > before;
    if (!logged) await sleep(250);
  }

  if (!logged) {
    const stillEmpty = await page.locator(NOTHING_RATED).isVisible().catch(() => false);
    throw new Error(
      `The onThumbsUp callback never fired: the feedback log did not gain a row` +
        `${stillEmpty ? ' and still reads "Nothing rated yet."' : ''}.`,
    );
  }
  console.log(`   ✅ onThumbsUp fired — the feedback log gained a row.`);

  // Rest on the log so the recording shows the row that was just written.
  await clickWithCursor(page, 'section:has-text("Feedback log")').catch(() => false);
  await sleep(1800);

  // ── 3/3: modal state from outside the sidebar ────────────────────────────
  console.log(`   [Chat Controls] 3/3: driving the sidebar from the page's own button...`);
  const label = page.locator(TOGGLE).first();
  const firstLabel = ((await label.textContent().catch(() => '')) || '').trim();

  if (await clickWithCursor(page, TOGGLE)) {
    await sleep(1500);
    const flipped = ((await label.textContent().catch(() => '')) || '').trim();
    console.log(`   ✓ "${firstLabel}" -> "${flipped}"`);

    // Put it back, so the clip ends on an open chat rather than a closed one.
    await clickWithCursor(page, TOGGLE);
    await sleep(1200);
    const restored = ((await label.textContent().catch(() => '')) || '').trim();

    if (flipped === firstLabel || restored !== firstLabel) {
      console.warn(
        `   ⚠️ The toggle label did not complete a round trip ` +
          `("${firstLabel}" -> "${flipped}" -> "${restored}"), so the provider's ` +
          `two-way modal sync may not be wired.`,
      );
    }
  } else {
    console.warn(`   ⚠️ No sidebar toggle button found; skipped the open/close half.`);
  }

  await sleep(config.waitAfterPromptMs ?? 4000);
};
