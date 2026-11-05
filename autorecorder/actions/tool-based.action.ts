/**
 * `/generative-ui/tool-based` — `useComponent` registering a React component as
 * a tool the agent calls to render it.
 *
 * There is no handler and no backend definition, which is the variant's whole
 * point: the runtime exposes `render_bar_chart` as a *frontend* tool, the
 * adapter forwards it to Claude on every run, and a call paints the component
 * with the arguments as props.
 *
 * As on Tool Call Rendering, the pass condition is the component, not the prose.
 * A model that describes a chart in words satisfies any text-based check while
 * demonstrating nothing. `BarChart` draws with Recharts, so an
 * `svg.recharts-surface` on the page is proof the tool call round-tripped and
 * the component mounted with real arguments.
 */

import { type Page } from 'playwright';
import { humanGlide, sleep } from '../core/overlays/cursor';
import { sendPrompt } from '../core/actions';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { waitForAgentTurn } from './agent-run';

/** Recharts' own root element — present only once the component really rendered. */
const CHART = 'svg.recharts-surface';

export const runToolBasedAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   [Components as Tools] Prompting for a chart to trigger render_bar_chart...`);
  const baseline = await sendPrompt(page, config.prompt);

  const chart = page.locator(CHART).first();
  const drawn = await chart
    .waitFor({ state: 'visible', timeout: 45000 })
    .then(() => true)
    .catch(() => false);

  if (drawn) {
    const box = await chart.boundingBox();
    if (box) {
      console.log(`   🎯 BarChart mounted — gliding across it.`);
      await humanGlide(page, box.x + box.width * 0.3, box.y + box.height / 2, 22);
      await sleep(1200);
      await humanGlide(page, box.x + box.width * 0.7, box.y + box.height / 2, 22);
      await sleep(1200);
    }
  }

  await waitForAgentTurn(page, {
    baselineCount: baseline,
    evidenceSelector: CHART,
    // A tool-call turn can end with the component and no closing sentence.
    requireText: false,
    postWaitMs: config.waitAfterPromptMs ?? 4000,
    label: config.id,
  });

  if (!(await chart.isVisible().catch(() => false))) {
    throw new Error(
      'No chart was rendered, so `render_bar_chart` was never called — the agent ' +
        'described the data instead of drawing it. Check that the frontend tool is ' +
        'reaching the adapter on the run input.',
    );
  }
};
