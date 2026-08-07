"use client";

import type { ReactNode } from "react";

/**
 * The chrome half of the page's headless example.
 *
 * `UserBubble` and `AssistantBubble` are, in the page's words, "pure chrome":
 * they take pre-rendered content and drop it into a styled container, importing
 * no chat primitives. The published versions do that with shadcn `Avatar`,
 * `ReactMarkdown` + `remark-gfm`, a `cn()` helper and an `AttachmentChip` — none
 * of which the page imports or defines. These are the same two components with
 * that dependency stack removed, which is all the page's own text asks of them.
 */

export function UserBubble({ content }: { content: string }) {
  if (!content.trim()) return null;
  return (
    <div className="flex w-full flex-row-reverse items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-medium text-white">
        You
      </span>
      <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-[var(--accent)] px-4 py-2.5 text-sm leading-relaxed text-white shadow-sm">
        <p className="whitespace-pre-wrap break-words">{content}</p>
      </div>
    </div>
  );
}

export function AssistantBubble({
  content,
  children,
}: {
  content?: string;
  children?: ReactNode;
}) {
  const hasText = typeof content === "string" && content.trim().length > 0;
  const hasChildren = Boolean(children);
  if (!hasText && !hasChildren) return null;

  return (
    <div className="flex w-full items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
        AI
      </span>
      <div className="flex max-w-[calc(100%-2.75rem)] flex-1 flex-col items-start gap-2">
        {hasText && (
          <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-2.5 text-sm leading-relaxed text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100">
            <p className="whitespace-pre-wrap break-words">{content}</p>
          </div>
        )}
        {hasChildren && (
          <div className="flex w-full flex-col gap-2">{children}</div>
        )}
      </div>
    </div>
  );
}
