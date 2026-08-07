"use client";

/**
 * The doc's escape hatch for driving the voice route without a microphone.
 *
 * Useful for screenshots, for Playwright, and — specific to this repo — for
 * anyone who has an Anthropic key but no OpenAI one, since transcription is
 * the single part of this app that is not Claude. It skips the /transcribe
 * endpoint entirely and puts text straight into the composer.
 *
 * The composer is a controlled React textarea, so assigning `.value` directly
 * would be silently reverted on the next render. The native value setter plus
 * a dispatched `input` event is what React's synthetic event system actually
 * listens for.
 */
export function SampleAudioButton({ sampleText }: { sampleText: string }) {
  const insert = () => {
    const textarea = document.querySelector<HTMLTextAreaElement>(
      '[data-testid="copilot-chat-textarea"]',
    );
    if (!textarea) {
      console.warn("[voice] composer textarea not found");
      return;
    }

    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value",
    )?.set;
    setter?.call(textarea, sampleText);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    textarea.focus();
  };

  return (
    <button
      type="button"
      data-testid="voice-sample-audio-button"
      onClick={insert}
      title={`Inserts: "${sampleText}"`}
      className="inline-flex w-fit items-center gap-2 rounded-md border border-black/10 bg-white px-3 py-1.5 text-xs font-medium hover:bg-black/5 dark:border-white/10 dark:bg-black/30 dark:hover:bg-white/10"
    >
      <span aria-hidden>🎙</span>
      <span>Try a sample audio</span>
    </button>
  );
}
