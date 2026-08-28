"use client";

import { useAgent, useThreads } from "@copilotkit/react-core/v2";
import { useEffect, useRef } from "react";

/**
 * ⚠ REPO-AUTHORED — no doc page publishes this.
 *
 * Names a thread from its first user message, client-side.
 *
 * The runtime has its own naming path and it cannot work here. It clones the
 * agent and sends a *system* message carrying the "return {"title":"..."}"
 * instruction, but `ClaudeAgentAdapter` reads only `messages[-1]`
 * (`get_user_message` in ag_ui_claude_sdk/utils.py: "we only use the last
 * one"), so the instruction is discarded and the model answers
 * conversationally. Three attempts are burned and the thread lands on the
 * runtime's `Untitled` fallback — which is why `generateThreadNames` is off in
 * the runtime route. See README §9.15.
 *
 * So the title is derived here instead, and deliberately WITHOUT an LLM:
 * a second model round-trip per thread costs latency and money to restate what
 * the user already typed. `renameThread` writes to the same platform store the
 * drawer reads, so a name set from any of the three Rich Threads routes shows
 * up on all of them.
 */

/** The runtime's own fallback string. Treated as unnamed so those rows get fixed. */
const RUNTIME_FALLBACK_NAME = "Untitled";

const MAX_TITLE_WORDS = 6;
const MAX_TITLE_CHARS = 60;

function isNamed(name: string | null | undefined): boolean {
  if (typeof name !== "string") return false;
  const trimmed = name.trim();
  return trimmed.length > 0 && trimmed !== RUNTIME_FALLBACK_NAME;
}

/** Message content is a string or a multimodal part array; take the text. */
function textOf(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .map((part) =>
      part && typeof part === "object" && "text" in part
        ? String((part as { text?: unknown }).text ?? "")
        : "",
    )
    .join(" ");
}

/** First few words of the message, tidied. Returns null when there is nothing usable. */
export function toThreadTitle(content: unknown): string | null {
  const flat = textOf(content)
    .replace(/[`*_#>|~[\]()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!flat) return null;

  const words = flat.split(" ").slice(0, MAX_TITLE_WORDS);
  let title = words.join(" ");
  if (title.length > MAX_TITLE_CHARS) title = title.slice(0, MAX_TITLE_CHARS).trim();
  title = title.replace(/[.,;:!?]+$/, "").trim();
  if (!title) return null;

  return title.charAt(0).toUpperCase() + title.slice(1);
}

export function useAutoThreadName(agentId: string): void {
  const { agent } = useAgent({ agentId });
  const { threads, renameThread } = useThreads({ agentId });

  // One attempt per thread per mount. Without this, every message in a
  // conversation would re-fire the rename now that the row has a name we
  // ourselves consider "named" only after the platform round-trip lands.
  const attempted = useRef<Set<string>>(new Set());

  const threadId = agent.threadId;
  const messages = agent.messages;

  useEffect(() => {
    if (!threadId || attempted.current.has(threadId)) return;

    // Wait for the platform to have the row — renaming an id it has not
    // persisted yet just errors.
    const thread = threads.find((t) => t.id === threadId);
    if (!thread) return;

    if (isNamed(thread.name)) {
      attempted.current.add(threadId);
      return;
    }

    const firstUserMessage = messages.find((m) => m.role === "user");
    if (!firstUserMessage) return;

    const title = toThreadTitle(firstUserMessage.content);
    if (!title) return;

    attempted.current.add(threadId);
    void renameThread(threadId, title).catch((err) => {
      // Let it be retried on the next mount rather than silently never naming.
      attempted.current.delete(threadId);
      console.error("[claude-sdk-python:auto-thread-name] rename failed", err);
    });
  }, [threadId, threads, messages, renameThread]);
}
