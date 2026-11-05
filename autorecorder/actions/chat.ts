/**
 * The one move almost every page makes: type a prompt, send it, wait the turn
 * out, prove it answered.
 *
 * `core/actions.ts` already owns the typing half (`sendPrompt` — the cursor
 * glide, the key-by-key typing, the swallowed-submit retry), and that half is
 * good. What this adds is the waiting half from `agent-run.ts`, plus the
 * baseline bookkeeping the two halves have to agree on: the message count is
 * read *before* submitting, or a second turn mistakes the first turn's reply for
 * its own.
 *
 * Handlers should reach for `sendAndWait` first and drop to the primitives only
 * when the page needs something in between — an approval to click, a tab to
 * switch, a control to set.
 */

import { type Page } from 'playwright';
import { sendPrompt, type SendPromptOptions } from '../core/actions';
import { SELECTORS } from '../config/selectors.config';
import { waitForAgentTurn, type AgentTurnOptions } from './agent-run';
import { type PageRecordConfig } from '../core/types';

export interface SendAndWaitOptions extends AgentTurnOptions {
  /** Where to type, when the page hand-rolls its own composer. */
  inputSelector?: string;
  /** What to click to submit, when it is not the prebuilt send button. */
  submitSelector?: string;
  /** Clear the box before typing, for composers that arrive pre-filled. */
  clearFirst?: boolean;
  /** How long to wait for the composer to appear. */
  inputTimeoutMs?: number;
}

/**
 * Sends one prompt and waits for the reply to finish.
 *
 * @returns The assistant-message count observed before submitting, so a
 *   multi-turn handler can pass it forward as the next turn's baseline.
 */
export async function sendAndWait(
  page: Page,
  prompt: string,
  options: SendAndWaitOptions = {},
): Promise<number> {
  const {
    inputSelector,
    submitSelector,
    clearFirst,
    inputTimeoutMs = 15000,
    messageSelector = SELECTORS.assistantMessage,
    ...turn
  } = options;

  const sendOpts: SendPromptOptions = {
    timeoutMs: inputTimeoutMs,
    messageSelector,
    ...(inputSelector ? { inputSelector } : {}),
    ...(submitSelector ? { submitSelector } : {}),
    ...(clearFirst ? { clearFirst } : {}),
  };

  const baseline = await sendPrompt(page, prompt, sendOpts);
  await waitForAgentTurn(page, { ...turn, messageSelector, baselineCount: baseline });
  return baseline;
}

/**
 * The default for a page that needs nothing but a prompt.
 *
 * Replaces `core/actions.ts → runStandardAction` as the fallback in
 * `index.ts`. Same shape and same contract; the difference is entirely in how
 * the turn is detected — see the header of `agent-run.ts`.
 */
export async function runChatAction(page: Page, config: PageRecordConfig): Promise<void> {
  await sendAndWait(page, config.prompt, {
    postWaitMs: config.waitAfterPromptMs ?? 4000,
    label: config.id,
  });
}

/** A page's prompts in order, falling back to its single `prompt`. */
export function promptList(config: PageRecordConfig): string[] {
  return config.prompts?.length ? config.prompts : [config.prompt];
}
