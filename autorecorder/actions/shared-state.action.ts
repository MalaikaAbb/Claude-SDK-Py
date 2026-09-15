/**
 * `/shared-state` — the two-way channel between the UI and the agent.
 *
 * The page has two directions and they fail independently, so the recording
 * drives both:
 *
 *   **UI → agent** (`agent.setState` from the preferences editor). Typing a name
 *   into the panel puts it into agent state; the adapter serialises that into
 *   the system prompt on the next turn. Asking the agent to use it is what
 *   proves the write arrived — and unlike the other direction, this one works.
 *
 *   **agent → UI** (`ag_ui_update_state` writing into the notes panel). This is
 *   the direction `nav-config.ts` marks `broken`: `set_notes` is a backend tool
 *   with no registration path, and the adapter's substitute does not carry notes
 *   back to the panel in practice.
 *
 * Because the second direction is a known gap rather than a regression, an empty
 * notes panel is reported and not thrown on — failing here every run would train
 * everyone to ignore this page's result, and the run would stop telling you when
 * the *first* direction breaks. A note appearing is logged loudly, because that
 * would mean the documented gap has closed.
 */

import { type Page } from 'playwright';
import { humanClick, humanGlide, sleep } from '../core/overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { promptList, sendAndWait } from './chat';

const NAME_FIELD = 'input[placeholder="What should the agent call you?"]';
const NOTES_CARD = '[data-testid="notes-card"]';
const NOTE_ITEM = '[data-testid="note-item"]';

/** The name written into the preferences panel before the first prompt. */
const PREFERRED_NAME = 'Sam';

export const runSharedStateAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  // ── UI → agent ───────────────────────────────────────────────────────────
  const field = page.locator(NAME_FIELD).first();
  if (await field.isVisible({ timeout: 5000 }).catch(() => false)) {
    const box = await field.boundingBox();
    if (box) {
      await humanGlide(page, box.x + 60, box.y + box.height / 2, 20);
      await humanClick(page);
    } else {
      await field.click();
    }
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type(PREFERRED_NAME, { delay: 60 });
    // setState fires per keystroke; let the last one land before prompting.
    await sleep(900);
    console.log(`   [Shared State] Wrote preferences.name = "${PREFERRED_NAME}" through setState.`);
  } else {
    console.warn(`   ⚠️ No preferences name field found; skipping the UI→agent write.`);
  }

  const notesBefore = await page.locator(NOTE_ITEM).count();

  const prompts = promptList(config);
  for (const [i, prompt] of prompts.entries()) {
    console.log(`   [Shared State] Turn ${i + 1}/${prompts.length}: ${prompt}`);
    await sendAndWait(page, prompt, {
      postWaitMs: i === prompts.length - 1 ? (config.waitAfterPromptMs ?? 4000) : 1500,
      label: config.id,
    });
  }

  // ── agent → UI ───────────────────────────────────────────────────────────
  const notesAfter = await page.locator(NOTE_ITEM).count();
  if (notesAfter > notesBefore) {
    console.log(
      `   ✅ The agent wrote ${notesAfter - notesBefore} note(s) back into the panel — ` +
        `the agent→UI direction is working, which nav-config still marks broken.`,
    );
    const card = page.locator(NOTES_CARD).first();
    const box = await card.boundingBox().catch(() => null);
    if (box) {
      await humanGlide(page, box.x + Math.min(box.width / 2, 180), box.y + box.height / 2, 20);
      await sleep(2000);
    }
  } else {
    console.warn(
      `   ⚠️ Notes panel is still empty: the agent→UI direction did not write. ` +
        `This is the documented gap (set_notes has no registration path against ` +
        `ClaudeAgentAdapter), not a recorder fault — see nav-config.ts.`,
    );
  }
};
