/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ADAPT THIS DIRECTORY
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * What the recorder *does* on each demo page once it is open.
 *
 * The registry lives here rather than in `core/` on purpose: adding or removing
 * a page must never mean editing frozen code. A page with no entry falls back
 * to the default handler — type the prompt, submit, wait for the reply — which
 * is right for every page whose feature *is* the reply.
 *
 * ── When a page earns a handler ────────────────────────────────────────────
 * When the reply is not the evidence. That is the whole rule, and it divides
 * this repo's routes cleanly:
 *
 *   - Prebuilt surfaces, CSS, sidebar, popup, sub-agents: the reply arriving in
 *     the right chrome *is* the demonstration. No handler.
 *   - A tool call rendering a card, a browser-side handler repainting the page,
 *     a run suspended on an approval, state landing on a canvas, a config the
 *     user never typed: the page can answer fluently while demonstrating
 *     nothing. Those get a handler, and the handler asserts the thing the page
 *     is actually about.
 *
 * Written the other way round — wiring a handler because a page looks like it
 * might need one — a handler pointed at DOM that is not there fails the run, so
 * every entry below was checked against this app's live markup before it was
 * added.
 *
 * ── The default handler is this folder's, not core's ───────────────────────
 * `runChatAction` replaces `core/actions.ts → runStandardAction` as the
 * fallback. Same contract; what differs is how the turn is detected. Core infers
 * the run boundary from the reply text settling, which mistakes a slow first
 * token for a dead agent (fatal on the two thinking routes) and takes a full 30s
 * to report a hard backend error as "agent never produced a response".
 * `agent-run.ts` reads CopilotKit v2's own `data-copilot-running` flag and its
 * error banner instead, so a turn ends when the run ends and a broken agent
 * fails in about a second with the backend's own message.
 *
 * `agent-run.ts` and `page-ready.ts` both belong in `core/` and sit here only
 * because `core/` is frozen — see their headers and ADAPT.md.
 *
 * Handlers build on:
 *
 *   sendAndWait(page, prompt, opts)        type, submit, wait the turn out
 *   waitForAgentTurn(page, opts)           wait only — for handlers that submit
 *                                          some other way (a button, a picker)
 *   countMessages(page, selector)          baseline before a turn
 *   warmEndpoint(page, path)               compile a second runtime up front
 *
 * Pass the pre-submit count as `baselineCount` on multi-turn pages, or the
 * previous turn's reply is mistaken for this one's.
 */

import { type Page } from 'playwright';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { SELECTORS } from '../config/selectors.config';

import { runChatAction } from './chat';
import { waitForPageReady } from './page-ready';

import { runA2uiAction } from './a2ui.action';
import { runAgentConfigAction } from './agent-config.action';
import { runChatControlsAction } from './chat-controls.action';
import { runFrontendToolsAction } from './frontend-tools.action';
import { runGovernedActionsAction } from './governed-actions.action';
import { runHeadlessUiAction } from './headless-ui.action';
import { runHumanInTheLoopAction } from './human-in-the-loop.action';
import { runMultimodalAction } from './multimodal.action';
import { runProgrammaticAction } from './programmatic.action';
import { runReasoningAction } from './reasoning.action';
import { runSharedStateAction } from './shared-state.action';
import { runSlotsAction } from './slots.action';
import { runStateRenderingAction } from './state-rendering.action';
import { runToolBasedAction } from './tool-based.action';
import { runToolRenderingAction } from './tool-rendering.action';
import { runVoiceAction } from './voice.action';

/** Keys are page ids from `config/pages.config.ts`. Doctor flags any orphans. */
export const ACTION_MAP: Record<string, PageActionHandler> = {
  // Custom look and feel — the overrides are the subject, not the reply.
  'custom-look-and-feel-slots': runSlotsAction,
  'custom-look-and-feel-headless-ui': runHeadlessUiAction,
  'custom-look-and-feel-reasoning-messages': runReasoningAction,

  // Prebuilt components — this one alone has controls of its own.
  'prebuilt-components-chat-controls': runChatControlsAction,

  // Input modalities — both need something put into the composer first.
  'multimodal-attachments': runMultimodalAction,
  voice: runVoiceAction,

  // Generative UI — the rendered component is the evidence.
  'generative-ui-reasoning': runReasoningAction,
  'generative-ui-tool-based': runToolBasedAction,
  'generative-ui-tool-rendering': runToolRenderingAction,
  'generative-ui-state-rendering': runStateRenderingAction,
  'generative-ui-a2ui-dynamic-schema': runA2uiAction,
  'generative-ui-a2ui-fixed-schema': runA2uiAction,

  // App control — each drives the page rather than the chat.
  'frontend-tools': runFrontendToolsAction,
  'human-in-the-loop': runHumanInTheLoopAction,
  'human-in-the-loop-governed-actions': runGovernedActionsAction,
  'programmatic-control': runProgrammaticAction,

  // Shared state — the panel beside the chat is what has to change.
  'shared-state': runSharedStateAction,
  'shared-state-streaming': runStateRenderingAction,

  // Agent config — the config must be changed before it can be demonstrated.
  'agent-config': runAgentConfigAction,
};

/**
 * Composers that are not the shared `chatInput`.
 *
 * `waitForPageReady` gates on "the control we are about to type into is really
 * interactive". On a page that hand-rolls its chat, the shared selector matches
 * nothing and the gate degrades to a warning — so the page is driven before it
 * is ready, which is the exact failure `page-ready.ts` exists to prevent.
 */
const PAGE_INPUT_SELECTOR: Record<string, string> = {
  'custom-look-and-feel-headless-ui': 'input[placeholder="Type a message…"]',
};

export async function executePageAction(
  page: Page,
  config: PageRecordConfig,
  rootPath: string,
): Promise<void> {
  // One gate for every page, including the ones that fall through to the
  // default handler. The engine waits for the route to respond and for
  // `chatReady` to be visible, but a dev server compiles client chunks lazily,
  // so markup can be on screen before anything is wired to it -- and a prompt
  // typed into an unhydrated input goes nowhere. Handlers that remount a chat
  // mid-run call waitForDomSettled again themselves.
  await waitForPageReady(page, {
    label: config.id,
    inputSelector: PAGE_INPUT_SELECTOR[config.id] ?? SELECTORS.chatInput,
  });

  const handler = ACTION_MAP[config.id] ?? runChatAction;
  await handler(page, config, rootPath);
}
