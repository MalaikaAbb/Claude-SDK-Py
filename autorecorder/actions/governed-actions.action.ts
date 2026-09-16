/**
 * `/human-in-the-loop/governed-actions` — side effects behind a policy gate.
 *
 * The page has two tabs, one per approval pattern in the doc, and both are
 * recorded because they fail in different ways:
 *
 *   1. **useInterrupt** (default tab). The prompt asks for mail to an outside
 *      address, which the server policy marks `require_approval`. The run ends
 *      *paused* — `RUN_FINISHED` carries an interrupt — and the card only
 *      renders after that, so the handler waits on the card, not the turn.
 *      Approving sends a `resume` run, the backend runs the side effect, and
 *      the agent confirms.
 *   2. **useHumanInTheLoop**. A 20% discount, also `require_approval`, but the
 *      card is a browser tool call and the run stays suspended until
 *      `respond` fires. The agent then calls `execute_governed_action`.
 *
 * In both, a fluent "done!" proves nothing — the agent could say that without
 * the gate. The evidence is the server audit panel: a row turning `executed`
 * is read from the backend, so each step asserts that the executed count went
 * up, not only that a reply arrived.
 */

import { type Page } from 'playwright';
import { humanClick, humanGlide, sleep } from '../core/overlays/cursor';
import { sendPrompt } from '../core/actions';
import { SELECTORS } from '../config/selectors.config';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { countMessages, waitForAgentTurn } from './agent-run';
import { waitForDomSettled } from './page-ready';
import { withTaskbarClickThrough, isUnderTaskbar } from './taskbar-passthrough';

const CARD = '[data-testid="governed-action-card"][data-verdict="require_approval"]';
const APPROVE = `${CARD} button:has-text("Approve and run")`;
const EXECUTED_ROW = '[data-testid="governance-action-row"][data-status="executed"]';
const HITL_TAB = '[data-testid="governed-tab-hitl"]';

async function glideAndClick(page: Page, selector: string): Promise<void> {
  const click = async () => {
    const target = page.locator(selector).first();
    const box = await target.boundingBox();
    if (box) {
      await humanGlide(page, box.x + box.width / 2, box.y + box.height / 2, 20);
      await sleep(400);
      await humanClick(page);
    } else {
      await target.click();
    }
  };
  if (await isUnderTaskbar(page, selector)) {
    await withTaskbarClickThrough(page, click);
  } else {
    await click();
  }
}

async function executedCount(page: Page): Promise<number> {
  return page.locator(EXECUTED_ROW).count();
}

/** Prompt → approval card → approve → the side effect runs and the agent says so. */
async function approveOne(
  page: Page,
  prompt: string,
  label: string,
  config: PageRecordConfig,
): Promise<void> {
  const executedBefore = await executedCount(page);

  console.log(`   [Governed] ${label}: asking for an action that needs approval...`);
  await sendPrompt(page, prompt);

  const card = page.locator(CARD).first();
  const appeared = await card
    .waitFor({ state: 'visible', timeout: 90000 })
    .then(() => true)
    .catch(() => false);
  if (!appeared) {
    throw new Error(
      `${label}: no approval card within 90s. Either the agent skipped the ` +
        `governance tool, the policy did not return require_approval, or the ` +
        `interrupt/tool call never reached the page.`,
    );
  }

  // The envelope — summary, reference, exact arguments — is what the user is
  // approving. Let it sit on screen before the cursor moves.
  const box = await card.boundingBox();
  if (box) await humanGlide(page, box.x + Math.min(box.width / 2, 200), box.y + 40, 20);
  await sleep(3000);

  const baseline = await countMessages(page, SELECTORS.assistantMessage);
  console.log(`   🎯 ${label}: approving`);
  await glideAndClick(page, APPROVE);

  await waitForAgentTurn(page, {
    // The paused turn's own message is already on screen; the tool path may
    // continue into that same message, so count it as not-yet-seen.
    baselineCount: Math.max(0, baseline - 1),
    evidenceSelector: EXECUTED_ROW,
    postWaitMs: 1500,
    label: `${config.id}:${label}`,
  });

  const deadline = Date.now() + 15000;
  while ((await executedCount(page)) <= executedBefore) {
    if (Date.now() > deadline) {
      throw new Error(
        `${label}: the user approved, but the server audit log shows no new ` +
          `executed action — the approval never reached the backend.`,
      );
    }
    await sleep(300);
  }
  console.log(`   ✅ ${label}: the server executed the approved action.`);

  const row = page.locator(EXECUTED_ROW).first();
  const rowBox = await row.boundingBox();
  if (rowBox) {
    await humanGlide(page, rowBox.x + rowBox.width / 2, rowBox.y + rowBox.height / 2, 20);
  }
  await sleep(config.waitAfterPromptMs ?? 4000);
}

export const runGovernedActionsAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  const [interruptPrompt, hitlPrompt] = config.prompts ?? [config.prompt, config.prompt];

  await approveOne(page, interruptPrompt, 'useInterrupt', config);

  console.log(`   [Governed] Switching to the useHumanInTheLoop tab`);
  await glideAndClick(page, HITL_TAB);
  await waitForDomSettled(page, { label: `${config.id}:hitl-tab` });

  await approveOne(page, hitlPrompt, 'useHumanInTheLoop', config);
};
