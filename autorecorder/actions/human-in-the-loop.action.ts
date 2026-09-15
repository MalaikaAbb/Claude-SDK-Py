/**
 * `/human-in-the-loop` — a run that suspends until a person answers.
 *
 * `useHumanInTheLoop` registers `book_call` as a frontend tool whose handler is
 * a Promise the UI resolves. When the model calls it, CopilotKit routes the call
 * to `render`, the time picker appears inside the assistant message, and the run
 * stays suspended until `respond` fires with the user's pick.
 *
 * The click is therefore not decoration. Nothing further streams until it
 * happens, and the ISO string the button sends becomes the tool result the model
 * reads next — so a recording that only sends the prompt shows a stalled run and
 * calls it a reply.
 *
 * The slot labels are built from the current date (`Tomorrow 10:00`,
 * `Monday 15:30`), so they are matched by their shape rather than their text.
 * The card's own confirmation — "Booked for …" replacing the grid — is what
 * proves `respond` actually fired.
 */

import { type Page } from 'playwright';
import { humanClick, humanGlide, sleep } from '../core/overlays/cursor';
import { sendPrompt } from '../core/actions';
import { SELECTORS } from '../config/selectors.config';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { countMessages, waitForAgentTurn } from './agent-run';

/** A candidate slot button: the card's labels all open with a day word. */
const SLOT = 'button:text-matches("^(Tomorrow|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday) ")';

/** The card's post-pick state. */
const BOOKED = 'text=/Booked for/';

export const runHumanInTheLoopAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   [HITL] Prompting to trigger the book_call interrupt...`);
  const baseline = await sendPrompt(page, config.prompt);

  // The card renders inside the assistant message while the run is suspended,
  // so wait on the card itself rather than on the turn — the turn cannot end
  // until we answer.
  const slot = page.locator(SLOT).first();
  const appeared = await slot
    .waitFor({ state: 'visible', timeout: 60000 })
    .then(() => true)
    .catch(() => false);

  if (!appeared) {
    throw new Error(
      'The time picker never rendered: no slot button appeared within 60s. Either ' +
        'the agent answered in prose instead of calling book_call, or the tool was ' +
        'not forwarded on the AG-UI run input.',
    );
  }

  // Let the proposed topic and the options sit on screen long enough to read
  // before the cursor moves — this is the moment the page is about.
  await sleep(2500);

  const box = await slot.boundingBox();
  if (box) {
    console.log(`   🎯 Picking the first offered slot to resume the run`);
    await humanGlide(page, box.x + box.width / 2, box.y + box.height / 2, 20);
    await sleep(500);
    await humanClick(page);
  } else {
    await slot.click();
  }

  const confirmed = await page
    .locator(BOOKED)
    .first()
    .waitFor({ state: 'visible', timeout: 10000 })
    .then(() => true)
    .catch(() => false);

  if (!confirmed) {
    throw new Error(
      'The picker was clicked but never confirmed: no "Booked for …" state ' +
        'appeared, so `respond` did not resolve and the run is still suspended.',
    );
  }
  console.log(`   ✅ respond() fired — the run is resumed.`);

  // Only now does the model get the tool result, so this is the reply that
  // matters. The suspended message is already in the DOM, hence the fresh
  // baseline rather than the pre-prompt one.
  await waitForAgentTurn(page, {
    baselineCount: Math.max(baseline, (await countMessages(page, SELECTORS.assistantMessage)) - 1),
    postWaitMs: config.waitAfterPromptMs ?? 4000,
    label: config.id,
  });
};
