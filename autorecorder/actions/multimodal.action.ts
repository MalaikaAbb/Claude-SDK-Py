/**
 * `/multimodal-attachments` — files sent to the agent as AG-UI content parts.
 *
 * The page configures `attachments` with an `accept` filter, a `maxSize` and
 * both error callbacks, wired to a visible error log. Its suggestions ("What is
 * in the image I attached?") only mean anything once something is attached, so a
 * recording that just sends a prompt shows the agent politely explaining that it
 * cannot see any attachment — a passing run that demonstrates the opposite of
 * the feature.
 *
 * So this handler attaches a real file. The composer's file input is hidden
 * behind the add-menu button, which is normal for a styled uploader and no
 * obstacle: `setInputFiles` drives the input directly, exactly as a user's file
 * picker would, without needing the menu open.
 *
 * The image is generated here rather than committed: a tiny PNG of a solid
 * colour, written to a temp file. That keeps the repo free of binary fixtures
 * and makes the expected answer checkable — the agent should be able to say what
 * colour it is.
 */

import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { type Page } from 'playwright';
import { humanGlide, sleep } from '../core/overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { sendAndWait } from './chat';

const FILE_INPUT = 'input[type="file"]';
const ATTACHMENT_QUEUE = '[data-testid="copilot-attachment-queue"]';
const ERROR_LOG = 'li:has(span.font-mono)';

/**
 * A 1x1 solid-red PNG, base64. Small enough to be inline, real enough to pass
 * the page's `image/*` filter and its 10MB ceiling.
 */
const RED_PIXEL_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

function writeSampleImage(): string {
  const dir = mkdtempSync(join(tmpdir(), 'autorecord-attach-'));
  const path = join(dir, 'sample-red.png');
  writeFileSync(path, Buffer.from(RED_PIXEL_PNG_BASE64, 'base64'));
  return path;
}

export const runMultimodalAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  const file = writeSampleImage();
  console.log(`   [Multimodal] Attaching ${file}`);

  const input = page.locator(FILE_INPUT).first();
  if ((await input.count()) === 0) {
    throw new Error(
      'The composer exposes no file input, so `attachments.enabled` is not in ' +
        'effect and nothing can be attached.',
    );
  }
  await input.setInputFiles(file);

  // The queue chip is the page acknowledging the file passed `accept` and
  // `maxSize`; a rejected file goes to the error log instead.
  const queued = await page
    .locator(ATTACHMENT_QUEUE)
    .first()
    .waitFor({ state: 'visible', timeout: 10000 })
    .then(() => true)
    .catch(() => false);

  if (!queued) {
    const rejected = ((await page.locator(ERROR_LOG).first().textContent().catch(() => '')) || '').trim();
    throw new Error(
      rejected
        ? `The attachment was rejected: "${rejected.replace(/\s+/g, ' ')}"`
        : 'The attachment never appeared in the composer queue, so it was not accepted.',
    );
  }

  const qBox = await page.locator(ATTACHMENT_QUEUE).first().boundingBox().catch(() => null);
  if (qBox) {
    console.log(`   ✓ File queued on the composer.`);
    await humanGlide(page, qBox.x + Math.min(qBox.width / 2, 120), qBox.y + qBox.height / 2, 20);
    await sleep(1500);
  }

  await sendAndWait(page, config.prompt, {
    postWaitMs: config.waitAfterPromptMs ?? 4000,
    label: config.id,
  });
};
