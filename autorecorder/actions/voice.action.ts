/**
 * `/voice` — the composer grows a mic because *this route's runtime* carries a
 * TranscriptionService.
 *
 * Two things make this page different from every other chat route, and both are
 * handled here rather than in the shared defaults:
 *
 *   1. **It runs on a second runtime.** The page mounts its own `<CopilotKit
 *      runtimeUrl="/api/copilotkit-voice">`, so `PROJECT.runtimeWarmPath` —
 *      which warms `/api/copilotkit` — warms the wrong endpoint. The prompt
 *      would then be the first request this route's runtime ever sees and would
 *      pay its compile out of its own answer budget. Warmed explicitly below.
 *   2. **Recording a microphone is not possible here.** The page ships the
 *      doc's own escape hatch for exactly this — a button that writes sample
 *      text straight into the composer through the native value setter,
 *      skipping `/transcribe`. That is the honest thing to drive: it exercises
 *      the real composer and needs no OPENAI_API_KEY, which the mic does.
 *
 * The mic button's *presence* is still checked, because that is the page's
 * actual claim: the component takes no voice props at all and grows the control
 * purely because the runtime advertises `audioFileTranscriptionEnabled`.
 */

import { type Page } from 'playwright';
import { humanClick, humanGlide, sleep } from '../core/overlays/cursor';
import { SELECTORS } from '../config/selectors.config';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { countMessages, waitForAgentTurn, warmEndpoint } from './agent-run';
import { waitForDomSettled } from './page-ready';

/** This route's own runtime — not the app-wide one. */
const VOICE_RUNTIME = '/api/copilotkit-voice';

const SAMPLE_BUTTON = '[data-testid="voice-sample-audio-button"]';
const MIC_BUTTON = '[data-testid="copilot-start-transcribe-button"]';

export const runVoiceAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  await warmEndpoint(page, VOICE_RUNTIME);
  await waitForDomSettled(page, { settleMs: 600 });

  // The mic is the evidence that the voice runtime is attached at all.
  const micPresent = await page.locator(MIC_BUTTON).first().isVisible({ timeout: 5000 }).catch(() => false);
  if (micPresent) {
    const mBox = await page.locator(MIC_BUTTON).first().boundingBox();
    if (mBox) {
      console.log(`   [Voice] Mic control is present — the runtime advertises transcription.`);
      await humanGlide(page, mBox.x + mBox.width / 2, mBox.y + mBox.height / 2, 20);
      await sleep(1500);
    }
  } else {
    console.warn(
      `   ⚠️ No mic control on the composer. This route's runtime is not advertising ` +
        `transcription, which is the one thing the page is about.`,
    );
  }

  // Drive the doc's no-microphone path: the button fills the composer for us.
  const sample = page.locator(SAMPLE_BUTTON).first();
  if (!(await sample.isVisible({ timeout: 5000 }).catch(() => false))) {
    throw new Error(
      'The "Try a sample audio" button is missing, so this route cannot be driven ' +
        'without a real microphone.',
    );
  }

  const sBox = await sample.boundingBox();
  if (sBox) {
    await humanGlide(page, sBox.x + sBox.width / 2, sBox.y + sBox.height / 2, 20);
    await sleep(400);
    await humanClick(page);
  } else {
    await sample.click();
  }

  // It writes through the native value setter and dispatches `input`, so React
  // has the text; confirm before submitting rather than assuming.
  const composer = page.locator('[data-testid="copilot-chat-textarea"]').first();
  const filled = await page
    .waitForFunction(
      (sel) => {
        const el = document.querySelector(sel) as HTMLTextAreaElement | null;
        return !!el && el.value.trim().length > 0;
      },
      '[data-testid="copilot-chat-textarea"]',
      { timeout: 6000 },
    )
    .then(() => true)
    .catch(() => false);

  if (!filled) {
    throw new Error(
      'The sample-audio button did not populate the composer, so nothing would be sent.',
    );
  }
  console.log(`   ✓ Composer filled from the sample: "${(await composer.inputValue()).slice(0, 60)}"`);
  await sleep(1200);

  const baseline = await countMessages(page, SELECTORS.assistantMessage);
  const send = page.locator(SELECTORS.chatSubmit).first();
  const sendBox = await send.boundingBox().catch(() => null);
  if (sendBox) {
    await humanGlide(page, sendBox.x + sendBox.width / 2, sendBox.y + sendBox.height / 2, 18);
    await humanClick(page);
  } else {
    await composer.press('Enter');
  }

  await waitForAgentTurn(page, {
    baselineCount: baseline,
    postWaitMs: config.waitAfterPromptMs ?? 4000,
    label: config.id,
  });
};
