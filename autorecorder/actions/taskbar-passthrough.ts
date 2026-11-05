/**
 * Letting a click reach a control the simulated taskbar is sitting on top of.
 *
 * `core/overlays/taskbar.ts` paints a Windows 11 taskbar across the bottom 48px
 * of the viewport with `pointer-events: auto` and a handler that swallows every
 * event, so the bar itself never leaks clicks into the page. ADAPT.md documents
 * the consequence as a minor annoyance: a send button that happens to sit down
 * there never receives its click, and the prompt submits via the Enter fallback
 * instead.
 *
 * On one page in this repo it is not minor. `/custom-look-and-feel/headless-ui`
 * pins its own composer to the bottom of a full-height flex column, so at
 * 1920×1080 the **input** lands at y≈1045 as well as the button — both inside
 * the bar. The click that should focus the composer is swallowed, the keystrokes
 * go to whatever had focus instead, the Enter fallback has nothing to submit,
 * and the run never starts. The page then fails as "agent never started a run",
 * which reads like a broken demo and is nothing of the sort: driven without the
 * overlay the same page answers in about five seconds.
 *
 * ── What this does ─────────────────────────────────────────────────────────
 * Turns the bar's pointer events off for the duration of one interaction and
 * back on afterwards. The bar stays on screen — this changes what it intercepts,
 * not what it looks like — so the recording is unaffected apart from the cursor
 * visibly passing behind it, which is the honest picture of a page whose
 * composer really is underneath.
 *
 * ── Where this belongs ─────────────────────────────────────────────────────
 * In `core/`, beside the overlay that creates the problem — ideally as an option
 * on `ensureOverlays`, or a `withTaskbarClickThrough` helper exported from
 * `overlays/taskbar.ts`. It is here only because `core/` is frozen. Any repo
 * whose app pins a control to the bottom edge hits this, and right now each one
 * has to rediscover it by watching a page fail for a reason that is not its own.
 * See ADAPT.md.
 */

import { type Page } from 'playwright';

const TASKBAR_ID = 'win11-taskbar-overlay';

/** Whether the taskbar overlay is currently on the page. */
async function taskbarPresent(page: Page): Promise<boolean> {
  return page
    .evaluate((id) => document.getElementById(id) !== null, TASKBAR_ID)
    .catch(() => false);
}

async function setClickThrough(page: Page, enabled: boolean): Promise<void> {
  await page
    .evaluate(
      ({ id, on }) => {
        const bar = document.getElementById(id);
        if (bar) bar.style.pointerEvents = on ? 'none' : 'auto';
      },
      { id: TASKBAR_ID, on: enabled },
    )
    .catch(() => {});
}

/**
 * True when the element is far enough down the viewport to be under the bar.
 *
 * Worth calling before reaching for this helper: the passthrough is only needed
 * where it is needed, and a page whose controls are clear of the bar should not
 * pay for a workaround it does not use.
 */
export async function isUnderTaskbar(page: Page, selector: string): Promise<boolean> {
  const box = await page.locator(selector).first().boundingBox().catch(() => null);
  if (!box) return false;
  const viewport = page.viewportSize();
  if (!viewport) return false;
  const barTop = viewport.height - 48;
  return box.y + box.height / 2 >= barTop;
}

/**
 * Runs `fn` with the taskbar not intercepting pointer events.
 *
 * Restores the bar in a `finally`, so a handler that throws mid-interaction
 * cannot leave a later page clicking through a bar it should not.
 */
export async function withTaskbarClickThrough<T>(
  page: Page,
  fn: () => Promise<T>,
): Promise<T> {
  const present = await taskbarPresent(page);
  if (present) {
    await setClickThrough(page, true);
    console.log(`   ⇣ Taskbar set to click-through: this page has controls beneath it.`);
  }
  try {
    return await fn();
  } finally {
    if (present) await setClickThrough(page, false);
  }
}
