/**
 * `/generative-ui/tool-rendering` — a named renderer standing in for a tool call.
 *
 * `useRenderTool({ name: "get_weather" })` registers a *renderer*, not a tool.
 * It waits for a `get_weather` call to arrive from the agent, which on this
 * integration comes from a repo-authored MCP bridge
 * (`backend/src/agents/weather_mcp_server.py`) because the docs publish no way
 * to register a backend tool against `ClaudeAgentAdapter` — README §9.1.
 *
 * What that means for the recording: the pass condition is the *card*, not the
 * prose. The agent can answer "it's sunny in Tokyo" perfectly well from memory,
 * and if it does, the page under test did nothing. `WeatherCard` renders a
 * Humidity/Wind definition list that no plain reply produces, so that is the
 * evidence checked here.
 *
 * The card appears while the reply is still streaming, so it is waited for as a
 * cue for the camera and then the turn is waited out properly — ending the clip
 * on the card alone would cut the answer off mid-sentence.
 */

import { type Page } from 'playwright';
import { humanGlide, sleep } from '../core/overlays/cursor';
import { sendPrompt } from '../core/actions';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { waitForAgentTurn } from './agent-run';

/** The WeatherCard's readings — a plain-prose answer renders none of these. */
const WEATHER_CARD = 'dt:text-is("Humidity")';

export const runToolRenderingAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   [Tool Rendering] Asking for weather to trigger the get_weather renderer...`);
  const baseline = await sendPrompt(page, config.prompt);

  const card = page.locator(WEATHER_CARD).first();
  const rendered = await card
    .waitFor({ state: 'visible', timeout: 45000 })
    .then(() => true)
    .catch(() => false);

  if (rendered) {
    const box = await card.boundingBox();
    if (box) {
      console.log(`   🎯 WeatherCard rendered — gliding onto it.`);
      await humanGlide(page, box.x + Math.min(box.width, 240), box.y + box.height / 2, 22);
      await sleep(2000);
    }
  }

  await waitForAgentTurn(page, {
    baselineCount: baseline,
    evidenceSelector: WEATHER_CARD,
    postWaitMs: config.waitAfterPromptMs ?? 4000,
    label: config.id,
  });

  if (!rendered && !(await card.isVisible().catch(() => false))) {
    throw new Error(
      'The agent replied but no WeatherCard rendered, so get_weather was never ' +
        'called — the reply came from the model rather than the tool. Check that the ' +
        'weather MCP bridge is registered on the `tool-rendering` agent.',
    );
  }
};
