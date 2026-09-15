/**
 * `/programmatic-control` — driving a run from code instead of from a composer.
 *
 * The page's point is that `agent.addMessage` + `copilotkit.runAgent` are all it
 * takes: its "Run agent" button appends a fixed user message and starts a run,
 * and "Stop" calls `copilotkit.stopAgent`. The chat beside it is a
 * `<CopilotSidebar>` that exists only to show what the code did.
 *
 * Typing into that sidebar would record a perfectly good chat demo of the wrong
 * thing — the composer is the one route into the agent this page is explaining
 * how to avoid. So the prompt in `pages.config` is not sent; the buttons are
 * pressed instead, and the page's own hard-coded message is what runs.
 *
 * `agent.isRunning` gates both buttons (`disabled` on Run while a run is in
 * flight, on Stop while none is), which makes their disabled state a free
 * assertion that the run really started.
 */

import { type Page } from 'playwright';
import { humanClick, humanGlide, sleep } from '../core/overlays/cursor';
import { SELECTORS } from '../config/selectors.config';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { countMessages, waitForAgentTurn } from './agent-run';

const RUN_BUTTON = 'button:has-text("Run agent")';
const STOP_BUTTON = 'button:has-text("Stop")';

export const runProgrammaticAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  const run = page.locator(RUN_BUTTON).first();
  await run.waitFor({ state: 'visible', timeout: 15000 });

  // Show the pair at rest first: Run enabled, Stop disabled because no run is
  // in flight. That contrast is what the two hooks are for.
  const stop = page.locator(STOP_BUTTON).first();
  console.log(
    `   [Programmatic Control] At rest — run enabled=${await run.isEnabled()}, ` +
      `stop enabled=${await stop.isEnabled().catch(() => false)}`,
  );

  const baseline = await countMessages(page, SELECTORS.assistantMessage);

  const box = await run.boundingBox();
  if (box) {
    await humanGlide(page, box.x + box.width / 2, box.y + box.height / 2, 20);
    await sleep(400);
    await humanClick(page);
  } else {
    await run.click();
  }
  console.log(`   ▶ Clicked "Run agent" — addMessage + runAgent, no composer involved.`);

  // The buttons swap state the instant the run starts. Catching that is quick
  // and worth logging, but it is a detail of the render, not the pass condition.
  // Asked through the locator engine, not `waitForFunction`: the button is
  // matched by its text, and `:has-text()` is Playwright syntax that an in-page
  // `querySelector` would reject outright.
  let swapped = false;
  for (let waited = 0; waited < 8000 && !swapped; waited += 250) {
    swapped = await run.isDisabled().catch(() => false);
    if (!swapped) await sleep(250);
  }
  console.log(`   ${swapped ? '✓' : 'ℹ'} Run button disabled while the run is in flight: ${swapped}`);

  await waitForAgentTurn(page, {
    baselineCount: baseline,
    postWaitMs: config.waitAfterPromptMs ?? 4000,
    label: config.id,
  });
};
