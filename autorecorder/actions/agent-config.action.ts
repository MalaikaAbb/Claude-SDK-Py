/**
 * `/agent-config` — a typed config object the UI owns, republished to the agent
 * as context on every turn.
 *
 * The page's claim is that the config is *not* a chat message: nothing about it
 * is typed, it travels on `input_data.context`, and the adapter folds it into
 * the system prompt each turn. A recording that just sends a prompt shows none
 * of that — the settings panel sits at its defaults and the answer could have
 * come from anywhere.
 *
 * So the config is changed first. Flipping tone and expertise before asking
 * makes three things visible at once: the pills reflecting the new selection,
 * the JSON readout below them updating, and then an answer shaped by values the
 * user never mentioned in the prompt.
 */

import { type Page } from 'playwright';
import { humanClick, humanGlide, sleep } from '../core/overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { sendAndWait } from './chat';

/** The live JSON view of the config object. */
const CONFIG_READOUT = 'main pre';

/** Axis values to select, in order. Each is a pill button labelled exactly this. */
const SELECTIONS = ['enthusiastic', 'beginner', 'detailed'];

export const runAgentConfigAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  const readout = page.locator(CONFIG_READOUT).first();
  const before = ((await readout.textContent().catch(() => '')) || '').replace(/\s+/g, ' ');
  console.log(`   [Agent Config] Starting config: ${before}`);

  for (const value of SELECTIONS) {
    const pill = page.locator(`button:text-is("${value}")`).first();
    if (!(await pill.isVisible({ timeout: 3000 }).catch(() => false))) {
      console.warn(`   ⚠️ No "${value}" option on this page; skipping it.`);
      continue;
    }
    const box = await pill.boundingBox();
    if (box) {
      await humanGlide(page, box.x + box.width / 2, box.y + box.height / 2, 18);
      await sleep(250);
      await humanClick(page);
    } else {
      await pill.click();
    }
    await sleep(600);
  }

  const after = ((await readout.textContent().catch(() => '')) || '').replace(/\s+/g, ' ');
  if (after === before) {
    throw new Error(
      'The config panel did not change: the JSON readout still reads ' +
        `${before}. The axis buttons are not wired to state, so nothing new can ` +
        'reach the agent.',
    );
  }
  console.log(`   ✅ Config is now: ${after}`);

  // Let the new JSON sit on screen before the question, so the viewer sees what
  // the agent is about to be told.
  const box = await readout.boundingBox().catch(() => null);
  if (box) {
    await humanGlide(page, box.x + Math.min(box.width / 2, 200), box.y + box.height / 2, 20);
  }
  await sleep(1800);

  await sendAndWait(page, config.prompt, {
    postWaitMs: config.waitAfterPromptMs ?? 4000,
    label: config.id,
  });
};
