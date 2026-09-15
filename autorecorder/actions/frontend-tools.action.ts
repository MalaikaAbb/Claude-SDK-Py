/**
 * `/frontend-tools` — a tool the agent calls that runs in the *browser*.
 *
 * The page registers `change_background` with `useFrontendTool`. The handler is
 * ordinary React: it closes over `setBackground`, so a successful call repaints
 * the page and prints the new CSS value into the `<code>` block beside it.
 *
 * ── Why this page needs more than a prompt ─────────────────────────────────
 * The thing being demonstrated is *where the handler ran*, and a plain reply
 * cannot tell you. "I've changed the background to a sunset gradient" is what
 * the page looks like when the tool fired, and it is also exactly what the
 * model says when it decides to answer in prose instead — the run completes,
 * an assistant message arrives, and the shared detector is satisfied by a page
 * on which nothing happened.
 *
 * So the proof is the page's own state: read the printed CSS value before the
 * prompt and after it. If it did not move, the browser-side handler never ran,
 * and that is a failure however fluent the reply was.
 */

import { type Page } from 'playwright';
import { humanGlide, sleep } from '../core/overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { sendAndWait } from './chat';

/** Where the handler prints the value it applied. */
const BACKGROUND_READOUT = 'main code';

async function readBackground(page: Page): Promise<string> {
  return (
    (await page.locator(BACKGROUND_READOUT).first().textContent().catch(() => '')) || ''
  ).trim();
}

export const runFrontendToolsAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  const before = await readBackground(page);
  console.log(`   [Frontend Tools] Background before the run: ${before.slice(0, 60) || '(unread)'}`);

  await sendAndWait(page, config.prompt, {
    postWaitMs: 1500,
    label: config.id,
  });

  // The repaint is a 500ms CSS transition, and the reply can land first.
  const changed = await page
    .waitForFunction(
      ({ sel, previous }) => {
        const el = document.querySelector(sel);
        return !!el && (el.textContent || '').trim() !== previous;
      },
      { sel: BACKGROUND_READOUT, previous: before },
      { timeout: 10000 },
    )
    .then(() => true)
    .catch(() => false);

  if (!changed) {
    throw new Error(
      'The change_background handler never ran: the value printed on the page is ' +
        `still "${before.slice(0, 80)}". The agent answered in prose instead of ` +
        'calling the tool, or the tool was not forwarded on the AG-UI run input.',
    );
  }

  const after = await readBackground(page);
  console.log(`   ✅ Browser-side handler ran — background is now: ${after.slice(0, 60)}`);

  // Rest on the readout so the recording shows the value the handler wrote,
  // then pull back to take in the repainted page as a whole.
  const readout = page.locator(BACKGROUND_READOUT).first();
  const box = await readout.boundingBox().catch(() => null);
  if (box) {
    await humanGlide(page, box.x + Math.min(box.width / 2, 260), box.y + box.height / 2, 20);
    await sleep(2000);
  }
  await humanGlide(page, 700, 400, 22);
  await sleep(config.waitAfterPromptMs ?? 4000);
};
