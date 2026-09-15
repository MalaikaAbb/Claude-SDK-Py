/**
 * `/custom-look-and-feel/slots` — replacing chat sub-components by prop.
 *
 * Three overrides are live on one `<CopilotChat>`: `welcomeScreen` (the empty
 * state), `input.disclaimer` (the line under the composer), and
 * `messageView.assistantMessage` (every reply). They are the page, and a plain
 * prompt-and-wait would sail past all three — the chat answers identically
 * whether the slots took effect or not.
 *
 * So each is checked where it is visible, in the order the page shows them: the
 * welcome screen before the first message, the disclaimer throughout, the
 * wrapped assistant message after the reply.
 *
 * ── Why the assistant message is still found by the shared selector ────────
 * `CustomAssistantMessage` *wraps* the default rather than replacing it — it
 * renders a badge and then `<CopilotChatAssistantMessage {...props} />` inside
 * its own card. The test id therefore still exists on the inner node, so unlike
 * the headless route this page needs no message-selector override. A slot that
 * replaced the component outright would, and ADAPT.md covers that case.
 */

import { type Page } from 'playwright';
import { humanGlide, sleep } from '../core/overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { sendAndWait } from './chat';

/** The page's own override markers — each is text no default component renders. */
const WELCOME_SLOT = 'text=welcomeScreen slot';
const DISCLAIMER_SLOT = 'text=disclaimer slot';
/**
 * The badge `CustomAssistantMessage` puts *beside* the default component it
 * wraps — so it is a sibling of the test id, not a descendant of it.
 */
const MESSAGE_SLOT_BADGE =
  'div:has(> [data-testid="copilot-assistant-message"]) > span';

export const runSlotsAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  const missing: string[] = [];

  // ── welcomeScreen: only on screen until the first message exists ─────────
  const welcome = page.locator(WELCOME_SLOT).first();
  if (await welcome.isVisible({ timeout: 5000 }).catch(() => false)) {
    const box = await welcome.boundingBox();
    if (box) {
      console.log(`   [Slots] welcomeScreen override is on screen.`);
      await humanGlide(page, box.x + box.width / 2, box.y + box.height / 2, 20);
      await sleep(1600);
    }
  } else {
    missing.push('welcomeScreen');
  }

  // ── disclaimer: under the composer, before and after ─────────────────────
  const disclaimer = page.locator(DISCLAIMER_SLOT).first();
  if (await disclaimer.isVisible({ timeout: 3000 }).catch(() => false)) {
    const box = await disclaimer.boundingBox();
    if (box) {
      console.log(`   [Slots] input.disclaimer override is on screen.`);
      await humanGlide(page, box.x + box.width / 2, box.y + box.height / 2, 20);
      await sleep(1400);
    }
  } else {
    missing.push('input.disclaimer');
  }

  await sendAndWait(page, config.prompt, {
    postWaitMs: 1500,
    label: config.id,
  });

  // ── assistantMessage: the badge the wrapper adds around every reply ──────
  const badge = page.locator(MESSAGE_SLOT_BADGE).first();
  if (await badge.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log(`   [Slots] messageView.assistantMessage override wrapped the reply.`);
    const box = await badge.boundingBox();
    if (box) {
      await humanGlide(page, box.x + box.width / 2, box.y + box.height / 2, 20);
      await sleep(1500);
    }
  } else {
    missing.push('messageView.assistantMessage');
  }

  if (missing.length === 3) {
    throw new Error(
      'None of the three slot overrides rendered, so the page is showing stock ' +
        'CopilotKit chrome and demonstrates nothing.',
    );
  }
  if (missing.length > 0) {
    console.warn(
      `   ⚠️ Slot override(s) not observed: ${missing.join(', ')}. The rest of the ` +
        `page rendered, so this is a partial result rather than a dead route.`,
    );
  }

  await sleep(config.waitAfterPromptMs ?? 4000);
};
