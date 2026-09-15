/**
 * `/shared-state/streaming` and `/generative-ui/state-rendering` — agent state
 * rendered outside the chat.
 *
 * Both routes are the same demo cell with different framing: a `useAgent`
 * subscription driving a `DocumentCanvas` beside the chat, with a LIVE badge
 * bound to `agent.isRunning`.
 *
 * The canvas is the thing under test, so the recording rests on it rather than
 * on the reply, and the pass condition is that the canvas gained text it did not
 * have before. Waiting only on the chat would pass a run in which the
 * subscription never fired at all — the reply would arrive, the canvas would sit
 * on its empty-state paragraph, and nothing this page is about would have
 * happened.
 *
 * ── What this page will and will not show ──────────────────────────────────
 * `nav-config.ts` marks both routes `broken`, and precisely: the subscription
 * and the badge are real, the *streaming* is not. `write_document` is a backend
 * tool with no registration path, and the doc's `stream_document_state` needs a
 * raw Anthropic stream `ClaudeAgentAdapter` never hands out — so the document
 * arrives in one write at the end of the turn instead of growing token by token.
 *
 * A filled canvas is therefore the pass condition, and the sampler below reports
 * *how* it filled. If it ever fills gradually, the documented gap has closed and
 * the status in `nav-config.ts` is out of date — which is worth knowing from a
 * run rather than from a re-read of the docs.
 */

import { type Page } from 'playwright';
import { humanGlide, sleep } from '../core/overlays/cursor';
import { sendPrompt } from '../core/actions';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { waitForAgentTurn } from './agent-run';

/** The document pane, keyed on its own heading rather than on grid position. */
const CANVAS = 'div:has(> header h2:text-is("agent.state.document"))';

/** The pane's body — the empty-state paragraph, or the document. */
const CANVAS_BODY = `${CANVAS} > div`;

async function canvasText(page: Page): Promise<string> {
  return ((await page.locator(CANVAS_BODY).first().textContent().catch(() => '')) || '').trim();
}

export const runStateRenderingAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  const before = await canvasText(page);
  console.log(`   [State Rendering] Canvas holds ${before.length} characters before the run.`);

  const baseline = await sendPrompt(page, config.prompt);

  // Park the cursor on the canvas: for these two pages the document is the
  // subject and the chat is the remote control.
  const box = await page.locator(CANVAS).first().boundingBox().catch(() => null);
  if (box) {
    await humanGlide(page, box.x + Math.min(box.width / 2, 320), box.y + 160, 22);
  }

  // Sample the canvas *while* the turn runs, to tell a single end-of-turn write
  // apart from real token-level streaming. Stops as soon as the turn does.
  let stopped = false;
  let growthSteps = 0;
  let samples = 0;
  let seenLength = before.length;
  const sampler = (async () => {
    while (!stopped) {
      const len = (await canvasText(page).catch(() => '')).length;
      if (len > seenLength) {
        growthSteps++;
        seenLength = len;
      }
      samples++;
      await sleep(500);
    }
  })();

  try {
    await waitForAgentTurn(page, {
      baselineCount: baseline,
      postWaitMs: 1500,
      label: config.id,
    });
  } finally {
    stopped = true;
    await sampler.catch(() => {});
  }

  const after = await canvasText(page);
  if (after.length <= before.length) {
    throw new Error(
      'The canvas never received the document: agent state did not reach the ' +
        '`useAgent` subscription, so nothing this page demonstrates happened ' +
        `(canvas stayed at ${before.length} characters across ${samples} samples).`,
    );
  }

  console.log(
    `   ✅ Canvas filled: ${before.length} -> ${after.length} characters` +
      (growthSteps > 1
        ? ` across ${growthSteps} visible steps — token-level streaming looks live, ` +
          `which nav-config.ts still marks broken. Worth re-checking that status.`
        : ` in a single write, exactly as documented (no token-level streaming here).`),
  );

  await sleep(config.waitAfterPromptMs ?? 4000);
};
