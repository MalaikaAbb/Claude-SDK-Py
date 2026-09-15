/**
 * `/generative-ui/a2ui/*` — a surface the agent describes and the catalog draws.
 *
 * Both A2UI routes need two things the shared defaults do not give them:
 *
 *   1. **Their own runtime warmed.** Dynamic Schema mounts
 *      `<CopilotKit runtimeUrl="/api/copilotkit-declarative-gen-ui">`, because
 *      the catalog on the provider is what auto-injects `generate_a2ui` and the
 *      app-wide runtime turns injection off for the fixed-schema agent. That
 *      endpoint is not `PROJECT.runtimeWarmPath`, so without this the prompt
 *      pays its first-request compile.
 *   2. **A reply that is not an assistant message.** A2UI arrives as an
 *      activity message and is painted by the catalog's renderers, so a turn can
 *      legitimately end with a component tree on screen and no
 *      `copilot-assistant-message` at all. `requireText: false` plus an
 *      evidence selector is the shape ADAPT.md prescribes for that.
 *
 * ── Known failure on this integration ──────────────────────────────────────
 * Both routes currently fail at the backend before any surface is drawn: the
 * Claude Agent SDK's session worker dies with "Claude Code not found at
 * …/_bundled/claude.exe" — a path that does exist and runs fine when invoked
 * directly, so the message is a spawn failure being misreported. The runs that
 * succeed on every other route make this specific to these two agents.
 *
 * That is a real finding, not something to paper over here. The handler fails
 * with the banner's own text (in about a second, via `waitForAgentTurn`) rather
 * than timing out vaguely, which is what makes it diagnosable.
 */

import { type Page } from 'playwright';
import { sendPrompt } from '../core/actions';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { waitForAgentTurn, warmEndpoint } from './agent-run';

/** Runtime per route id. Fixed schema rides the app-wide one. */
const RUNTIME_BY_PAGE: Record<string, string> = {
  'generative-ui-a2ui-dynamic-schema': '/api/copilotkit-declarative-gen-ui',
};

/**
 * Anything the catalog paints lands inside the message list as a rendered
 * component rather than text, so the evidence is "the list gained an element
 * that is not the user's own message".
 */
const A2UI_SURFACE =
  '[data-testid="copilot-message-list"] [data-a2ui-surface], ' +
  '[data-testid="copilot-message-list"] [class*="a2ui"], ' +
  '[data-testid="copilot-assistant-message"]';

export const runA2uiAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  const runtime = RUNTIME_BY_PAGE[config.id];
  if (runtime) await warmEndpoint(page, runtime);

  console.log(`   [A2UI] Prompting for a surface the catalog can draw...`);
  const baseline = await sendPrompt(page, config.prompt);

  await waitForAgentTurn(page, {
    baselineCount: baseline,
    evidenceSelector: A2UI_SURFACE,
    // The agent's job here is to emit operations, not necessarily to speak.
    requireText: false,
    postWaitMs: config.waitAfterPromptMs ?? 4000,
    label: config.id,
  });
};
