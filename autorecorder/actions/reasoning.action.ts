/**
 * `/custom-look-and-feel/reasoning-messages` and `/generative-ui/reasoning` —
 * the reasoning card, customised two different ways.
 *
 * Reasoning Messages swaps sub-slots (`header`, `contentView`) and keeps
 * CopilotKit's card; Generative UI · Reasoning hands the slot a whole component
 * and keeps none of it. Either way, the thing on screen that the page is about
 * is the reasoning block — and it only exists if Claude emitted thinking blocks
 * at all, which is why these are the only two agents given a
 * `max_thinking_tokens` budget.
 *
 * ── Why these pages get their own handler ─────────────────────────────────
 * Not for the interaction — there is none beyond a prompt — but for the
 * *timing* and the *evidence*:
 *
 *   - A thinking turn spends its first seconds emitting reasoning rather than
 *     text. Detection that waits for assistant text alone is watching the wrong
 *     channel for that whole stretch. The run flag covers this (it goes up
 *     immediately), and the extended start window here is belt and braces for a
 *     cold backend on a thinking route.
 *   - A reasoning card that never renders means the budget produced no thinking
 *     blocks, so the adapter emitted no `REASONING_MESSAGE_*` events and the
 *     page has nothing to show. The reply still arrives and still looks fine,
 *     so nothing else would catch it.
 *
 * The prompt has to earn the reasoning: a question with a single retrieval-style
 * answer gives Claude no reason to think, and the card stays away. `pages.config`
 * uses the pages' own suggestion prompts, which are multi-step by design.
 */

import { type Page } from 'playwright';
import { humanGlide, sleep } from '../core/overlays/cursor';
import { sendPrompt } from '../core/actions';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { waitForAgentTurn } from './agent-run';

/**
 * A reasoning block, however the page customised it.
 *
 * Two shapes, one per route:
 *
 *   - Reasoning Messages keeps CopilotKit's card and swaps its sub-slots, so the
 *     header is the repo's `CustomHeader` rendering the *library's* label —
 *     "Thinking…" while the thinking streams, "Thought for 4s" once it stops.
 *   - Generative UI · Reasoning replaces the card outright with `ReasoningBlock`,
 *     which carries its own `data-testid`.
 *
 * Matched narrowly on purpose. The obvious `text=/Reasoning/i` would also match
 * the DemoFrame header, whose title on both of these routes contains the word
 * "Reasoning" — so it would report success on a page where no reasoning ever
 * rendered, and park the cursor on the page title to prove it. `:has-text("Show")`
 * is out for the same reason: the error banner's "Show Details" would match it.
 */
const REASONING_BLOCK =
  '[data-testid="reasoning-block"], ' +
  'button:has-text("Thought for"), ' +
  'button:has-text("Thinking")';

export const runReasoningAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   [Reasoning] Sending a question that needs working out...`);
  const baseline = await sendPrompt(page, config.prompt);

  // The reasoning block appears before the answer does, so catching it early is
  // both the evidence and the best moment for the camera.
  const block = page.locator(REASONING_BLOCK).first();
  const appeared = await block
    .waitFor({ state: 'visible', timeout: 45000 })
    .then(() => true)
    .catch(() => false);

  if (appeared) {
    const box = await block.boundingBox().catch(() => null);
    if (box) {
      console.log(`   🧠 Reasoning block rendered — resting on it while it streams.`);
      await humanGlide(page, box.x + Math.min(box.width / 2, 260), box.y + box.height / 2, 20);
      await sleep(2200);
    }
  }

  await waitForAgentTurn(page, {
    baselineCount: baseline,
    // Thinking routes are the slowest to first token; give the cold case room.
    startTimeoutMs: 90000,
    postWaitMs: config.waitAfterPromptMs ?? 4000,
    label: config.id,
  });

  if (!appeared && !(await block.isVisible().catch(() => false))) {
    console.warn(
      `   ⚠️ The reply arrived but no reasoning block rendered. Claude emitted no ` +
        `thinking blocks for this prompt, so the adapter sent no REASONING_MESSAGE_* ` +
        `events and this page's subject never appeared. Either the prompt was too ` +
        `easy to need working out, or max_thinking_tokens is not reaching the agent.`,
    );
  }
};
