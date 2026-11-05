/**
 * "Did the agent actually take a turn, and is it finished?"
 *
 * `core/actions.ts` answers that by watching the assistant message's text stop
 * changing. That works, but it infers the run boundary from its side effects,
 * and it pays for the inference twice:
 *
 *   - **A slow first token reads as a dead agent.** The start window is 30s from
 *     submit. A route that budgets extended thinking, or the first call after a
 *     cold backend, spends that long before any text exists — and the run is
 *     failed while it is still streaming. Two routes here (`reasoning-default`,
 *     `reasoning-custom`) are thinking routes by construction.
 *   - **A hard backend error reads the same as a slow one.** When the run dies
 *     the text never arrives, so the recorder waits out its full 30s and then
 *     reports "agent never produced a response" — the one message that is true
 *     of every failure and diagnostic of none.
 *
 * CopilotKit v2 publishes the boundary directly. `<CopilotChat>` renders
 * `data-copilot-running="true|false"` on its root, and a failed run renders a
 * `copilot-error-banner` carrying the backend's own message. Watching those
 * turns both problems into an exact answer: the turn ends when the run ends, and
 * a broken agent fails in about a second with the reason on screen rather than
 * in thirty with a guess. Verified against this app — the flag flips true ~0.1s
 * after submit on every prebuilt surface.
 *
 * Text stability is kept as the closing check (the last tokens can land a beat
 * after the flag clears) and as the whole strategy on surfaces that render no
 * CopilotKit chrome, which is why `headless-ui` still works through here.
 *
 * ── Portability ────────────────────────────────────────────────────────────
 * Nothing here is Claude-, Python- or Next-specific: it reads the run flag and
 * the error banner that CopilotKit v2 renders in every integration, and falls
 * back to plain text stability where they are absent. Like `page-ready.ts` it
 * **belongs in `core/`** and lives in `actions/` only because `core/` is frozen.
 * Every repo using this suite has the same two failure modes; promote and port
 * it. See ADAPT.md.
 */

import { type Page } from 'playwright';
import { PROJECT } from '../config/project.config';
import { SELECTORS } from '../config/selectors.config';
import { humanGlide, sleep } from '../core/overlays/cursor';

/** Root of a prebuilt chat surface; carries the run flag. */
export const CHAT_ROOT = '[data-testid="copilot-chat"]';

/** Present only while a run is in flight. */
export const RUNNING = '[data-testid="copilot-chat"][data-copilot-running="true"]';

/** Rendered when a run fails; its text is the backend's error. */
export const ERROR_BANNER = '[data-testid="copilot-error-banner"]';

export interface AgentTurnOptions {
  /** Assistant-message count from before the prompt was submitted. */
  baselineCount?: number;
  /** Override for surfaces that render their own messages. */
  messageSelector?: string;
  /**
   * A surface that counts as a successful turn even with no assistant text —
   * a rendered card, a canvas, an A2UI component tree.
   */
  evidenceSelector?: string;
  /**
   * Set false when a turn legitimately produces no assistant text, and
   * `evidenceSelector` is what proves it worked.
   */
  requireText?: boolean;
  /** How long to wait for the run to *start*. Generous: cold backends are slow. */
  startTimeoutMs?: number;
  /** How long to wait for a started run to *finish*. */
  runTimeoutMs?: number;
  /** Reading pause once the turn is complete. */
  postWaitMs?: number;
  /** Log prefix. */
  label?: string;
}

/**
 * Collects uncaught exceptions from the page for the duration of a turn.
 *
 * A React error thrown while rendering a reply unmounts the subtree it happened
 * in, so the message view can simply vanish — and the turn then fails as "the run
 * completed but produced nothing", which is true, unhelpful, and points at the
 * agent rather than at the crash that actually did it. The Sub-Agents route does
 * exactly this: the agent writes a delegation whose `sub_agent` is outside the
 * component's union, `SUB_AGENT_STYLE[...]` comes back undefined, and reading
 * `.color` off it takes the whole message list down with it.
 *
 * The engine already prints page errors as they happen, but they scroll past
 * above the failure. Attaching them to the thrown message puts the cause and the
 * symptom in the same sentence.
 */
function collectPageErrors(page: Page): { errors: string[]; stop: () => void } {
  const errors: string[] = [];
  const onError = (err: Error): void => {
    const msg = err.message || String(err);
    // Next's dev overlay and hydration noise are not what broke the turn.
    if (/removeChild|Minified React error|Hydration failed|reo\.dev/.test(msg)) return;
    if (!errors.includes(msg)) errors.push(msg);
  };
  page.on('pageerror', onError);
  return { errors, stop: () => page.off('pageerror', onError) };
}

/** Appends any page crash to a failure message, so the cause travels with it. */
function withPageErrors(message: string, errors: string[]): string {
  if (errors.length === 0) return message;
  return (
    `${message}\n   The page also threw while this was happening, which is the ` +
    `likelier cause: ${errors.map((e) => `"${e}"`).join('; ')}`
  );
}

/** The backend's message from a failed run, or null when nothing failed. */
export async function readErrorBanner(page: Page): Promise<string | null> {
  const banner = page.locator(ERROR_BANNER).first();
  if (!(await banner.isVisible({ timeout: 250 }).catch(() => false))) return null;
  const raw = (await banner.textContent().catch(() => '')) || '';
  // The banner ends with its own "Show Details" / close-button glyphs.
  return raw.replace(/\s+/g, ' ').replace(/Show Details\s*x?$/i, '').trim() || 'unknown error';
}

/**
 * Compiles one of the app's runtime routes by requesting it from the page.
 *
 * `page-ready.ts` warms `PROJECT.runtimeWarmPath`, which is the runtime almost
 * every route talks to. Three routes here mount a *second* runtime of their own
 * (voice, dynamic-schema) and would otherwise pay that route's first-request
 * compile out of the prompt's own budget.
 */
export async function warmEndpoint(page: Page, path: string): Promise<void> {
  if (!path) return;
  const url = new URL(path, PROJECT.frontendUrl).toString();
  const took = await page
    .evaluate(async (target) => {
      const started = Date.now();
      try {
        await fetch(target, { method: 'GET', cache: 'no-store' });
      } catch {
        // An errored request still compiled the route, which is the point.
      }
      return Date.now() - started;
    }, url)
    .catch(() => -1);
  if (took > 3000) {
    console.log(`   ✓ ${path} compiled in ${(took / 1000).toFixed(1)}s`);
  }
}

/**
 * Rejects a message selector the browser cannot actually run.
 *
 * Message selectors are evaluated *in the page* with `querySelectorAll`, because
 * counting and reading a growing list on every poll through Playwright's locator
 * engine would be far slower. The cost is that they must be plain CSS: hand one
 * of Playwright's own pseudo-classes — `:text-is()`, `:has-text()`, `:visible`,
 * `>>` — and `querySelectorAll` throws a SyntaxError.
 *
 * That throw used to be swallowed by the surrounding `.catch()` and reported as
 * "no messages", which is the worst possible shape for a bug: the page works,
 * the agent answers, and the recorder waits out its whole window insisting
 * nothing arrived. Checking once, up front, turns it into a sentence that names
 * the real problem.
 *
 * Only `messageSelector` is constrained this way. `evidenceSelector` and
 * everything a handler passes to `page.locator()` go through Playwright and may
 * use the extended syntax freely.
 */
async function assertQueryableSelector(page: Page, selector: string): Promise<void> {
  const error = await page
    .evaluate((sel) => {
      try {
        document.querySelectorAll(sel);
        return null;
      } catch (err) {
        return err instanceof Error ? err.message : String(err);
      }
    }, selector)
    .catch(() => null);

  if (error) {
    throw new Error(
      `messageSelector "${selector}" is not valid CSS, so it can never match: ` +
        `${error}. Message selectors run inside the page via querySelectorAll — ` +
        `Playwright-only syntax (:text-is, :has-text, :visible, >>) is not ` +
        `available. Express it in plain CSS instead.`,
    );
  }
}

/** Newest non-empty text among the matched messages, with the match count. */
async function readMessages(
  page: Page,
  selector: string,
): Promise<{ count: number; text: string }> {
  return page
    .evaluate((sel) => {
      const nodes = document.querySelectorAll(sel);
      for (let i = nodes.length - 1; i >= 0; i--) {
        const t = (nodes[i].textContent || '').trim();
        if (t) return { count: nodes.length, text: t };
      }
      return { count: nodes.length, text: '' };
    }, selector)
    .catch(() => ({ count: 0, text: '' }));
}

/** Assistant-message count right now. Take this before submitting a prompt. */
export async function countMessages(
  page: Page,
  selector: string = SELECTORS.assistantMessage,
): Promise<number> {
  return page.evaluate((sel) => document.querySelectorAll(sel).length, selector).catch(() => 0);
}

/** Whether this surface exposes the run flag at all. */
async function hasRunFlag(page: Page): Promise<boolean> {
  return page
    .evaluate((sel) => document.querySelector(sel) !== null, CHAT_ROOT)
    .catch(() => false);
}

async function isRunning(page: Page): Promise<boolean> {
  return page.evaluate((sel) => document.querySelector(sel) !== null, RUNNING).catch(() => false);
}

/**
 * Waits out one agent turn and proves it happened.
 *
 * Throws when the run failed or never produced anything — an agent that does
 * not answer is the failure this suite exists to catch, and a recording of it
 * must not report PASS.
 */
export async function waitForAgentTurn(
  page: Page,
  options: AgentTurnOptions = {},
): Promise<void> {
  const {
    baselineCount = 0,
    messageSelector = SELECTORS.assistantMessage,
    evidenceSelector,
    requireText = true,
    startTimeoutMs = 75000,
    runTimeoutMs = 180000,
    postWaitMs = 4000,
    label = 'agent',
  } = options;

  await assertQueryableSelector(page, messageSelector);

  const crashes = collectPageErrors(page);
  try {
    await runTurn();
  } finally {
    crashes.stop();
  }

  async function runTurn(): Promise<void> {
  const began = Date.now();
  const flagged = await hasRunFlag(page);

  // ── Phase 1: the turn started ────────────────────────────────────────────
  // Any of three things proves it: the run flag went up, a new message grew
  // text, or the run died. The third is checked first on every tick because it
  // is the one that used to cost a full timeout to discover.
  let sawRunFlag = false;
  let started = false;

  while (Date.now() - began < startTimeoutMs) {
    const failure = await readErrorBanner(page);
    if (failure) {
      throw new Error(
        withPageErrors(
          `Agent run failed after ${((Date.now() - began) / 1000).toFixed(1)}s — the ` +
            `demo surfaced an error: "${failure}"`,
          crashes.errors,
        ),
      );
    }

    if (flagged && (await isRunning(page))) {
      sawRunFlag = true;
      started = true;
      break;
    }

    const { count, text } = await readMessages(page, messageSelector);
    if (count > baselineCount && text.length > 2) {
      started = true;
      break;
    }

    // A fast turn can finish between two polls: the flag is already back down
    // but the answer is on screen. Treat that as started, not as silence.
    if (count > baselineCount && text.length > 0) {
      started = true;
      break;
    }

    await sleep(250);
  }

  if (!started) {
    throw new Error(
      withPageErrors(
        `Agent never started a run within ${startTimeoutMs / 1000}s — no run flag, ` +
          `no new message, no error. Check the backend log and that ` +
          `selectors.config assistantMessage ("${messageSelector}") matches this page.`,
        crashes.errors,
      ),
    );
  }

  // Three ways to get here, and they are worth telling apart in the log:
  // the flag went up while we watched; the surface has no flag at all (a page
  // that renders its own chat); or the flag exists but the whole turn landed
  // between two polls, which is common on a short cached reply.
  const how = sawRunFlag
    ? ''
    : flagged
      ? ' (the run had already finished by the first poll)'
      : ' (inferred from message text — this surface renders no run flag)';
  console.log(
    `   ▶ ${label}: run started after ${((Date.now() - began) / 1000).toFixed(1)}s${how}`,
  );

  // ── Phase 2: the turn finished ───────────────────────────────────────────
  if (sawRunFlag) {
    const runBegan = Date.now();
    while (Date.now() - runBegan < runTimeoutMs) {
      const failure = await readErrorBanner(page);
      if (failure) {
        throw new Error(
          withPageErrors(`Agent run failed mid-stream: "${failure}"`, crashes.errors),
        );
      }
      if (!(await isRunning(page))) break;
      await sleep(300);
    }
    console.log(
      `   ⏹ ${label}: run finished after ${((Date.now() - began) / 1000).toFixed(1)}s`,
    );
  }

  // ── Phase 3: the last tokens land ────────────────────────────────────────
  // The flag clears a beat before the final render settles, and on a surface
  // with no flag this is the only completion signal there is.
  const stabilityWindowMs = sawRunFlag ? 1200 : 45000;
  const needed = 4;
  let previous = '';
  let stable = 0;
  const settleBegan = Date.now();

  while (Date.now() - settleBegan < stabilityWindowMs) {
    const { count, text } = await readMessages(page, messageSelector);
    const sample = `${count}:${text}`;
    if (text && sample === previous) {
      if (++stable >= needed) break;
    } else {
      stable = 0;
      previous = sample;
    }
    await sleep(300);
  }

  // ── Phase 4: prove the turn produced something ───────────────────────────
  const { count, text } = await readMessages(page, messageSelector);
  const grew = count > baselineCount && text.length > 0;
  const evidence = evidenceSelector
    ? await page.locator(evidenceSelector).first().isVisible({ timeout: 3000 }).catch(() => false)
    : false;

  if (!grew && !evidence) {
    const failure = await readErrorBanner(page);
    throw new Error(
      withPageErrors(
        failure
          ? `Agent run failed: "${failure}"`
          : `The run completed but produced nothing: no new message matched ` +
            `"${messageSelector}"${evidenceSelector ? ` and nothing matched "${evidenceSelector}"` : ''}.`,
        crashes.errors,
      ),
    );
  }

  if (requireText && !grew && evidence) {
    console.log(`   ℹ ${label}: no assistant text, but the page rendered its surface.`);
  }
  if (grew) {
    console.log(`   ✅ ${label}: reply complete (${text.length} characters).`);
  }

  // ── Camera: rest on whatever the turn produced ───────────────────────────
  const focus = evidence && evidenceSelector ? evidenceSelector : messageSelector;
  const target = page.locator(focus).last();
  if (await target.isVisible({ timeout: 2000 }).catch(() => false)) {
    const box = await target.boundingBox();
    if (box) {
      await humanGlide(
        page,
        box.x + Math.min(box.width / 2, 220),
        box.y + Math.min(box.height / 2, 60),
        20,
      );
    }
  } else {
    await humanGlide(page, 960, 500, 20);
  }

  console.log(`   📖 Reading the result (${postWaitMs / 1000}s)...`);
  await sleep(postWaitMs);
  }
}
