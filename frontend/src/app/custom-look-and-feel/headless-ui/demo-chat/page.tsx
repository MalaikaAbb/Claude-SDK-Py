"use client";

import type { ToolMessage } from "@ag-ui/core";
import {
  useAgent,
  useCopilotKit,
  useRenderToolCall,
} from "@copilotkit/react-core/v2";
import { useEffect, useMemo, useRef, useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

import { AssistantBubble, UserBubble } from "../message-bubbles";

const AGENT_ID = "headless-simple";

/** The page's own id helper, which it calls but never defines. */
const createMessageId = () => crypto.randomUUID();

/**
 * The page's `headless-simple` cell: a chat with no CopilotKit chrome at all.
 *
 * `send` below is the doc's, verbatim — `agent.addMessage` then
 * `copilotkit.runAgent({ agent })`, with the error deliberately logged rather
 * than swallowed. The message list is the doc's `.map()` over `agent.messages`,
 * extended with the tool-call composition the page describes for its
 * `headless-complete` sibling: index tool results by `toolCallId`, then hand
 * each `toolCall` and its matching result to `renderToolCall`.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/custom-look-and-feel/headless-ui"
      subtitle={`agent: ${AGENT_ID}`}
    >
      <Chat />
    </DemoFrame>
  );
}

function Chat() {
  const { agent } = useAgent({ agentId: AGENT_ID });
  const { copilotkit } = useCopilotKit();
  const renderToolCall = useRenderToolCall();
  const [input, setInput] = useState("");

  const messages = agent.messages;
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, agent.isRunning]);

  // Index tool results by their originating tool-call id so each tool-call
  // card can hand the matching ToolMessage to `useRenderToolCall`.
  // Without this the renderer can't see a result and the card stays in the
  // "in-progress" state forever.
  // `ToolMessage` rather than the `agent.messages` element type: the latter is
  // the union of every role, and `renderToolCall` only accepts the tool
  // variant. The doc's version types this `Map<string, ToolResult>`, a name
  // @ag-ui/core does not export.
  const toolMessagesByCallId = useMemo(() => {
    const map = new Map<string, ToolMessage>();
    for (const m of messages) {
      if (m.role === "tool" && "toolCallId" in m && m.toolCallId) {
        map.set(m.toolCallId, m);
      }
    }
    return map;
  }, [messages]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || agent.isRunning) return;
    agent.addMessage({
      id: createMessageId(),
      role: "user",
      content: trimmed,
    });
    setInput("");
    void copilotkit.runAgent({ agent }).catch((err) => {
      // The Headless Simple demo is the canonical "two hooks, your
      // design system" example users copy-paste as a starting point.
      // Silently swallowing errors here would model broken practice;
      // log so a network failure / runtime error / transport disconnect
      // surfaces in the console for the developer.
      console.error("[claude-sdk-python:headless-simple] runAgent failed", err);
    });
  };

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
        {messages.length === 0 && (
          <p className="pt-10 text-center text-sm text-slate-500">
            No chrome, no <code>&lt;CopilotChat&gt;</code>. Two hooks and your
            own components.
          </p>
        )}
        {messages.map((m) => {
          if (m.role === "user") {
            return (
              <UserBubble
                key={m.id}
                content={typeof m.content === "string" ? m.content : ""}
              />
            );
          }
          if (m.role === "assistant") {
            const toolCalls =
              "toolCalls" in m && Array.isArray(m.toolCalls) ? m.toolCalls : [];
            return (
              <AssistantBubble
                key={m.id}
                content={typeof m.content === "string" ? m.content : undefined}
              >
                {toolCalls.map((tc) => {
                  const toolMessage = toolMessagesByCallId.get(tc.id);
                  const node = renderToolCall({ toolCall: tc, toolMessage });
                  return node ? <div key={tc.id}>{node}</div> : null;
                })}
              </AssistantBubble>
            );
          }
          return null;
        })}
        {agent.isRunning && (
          <p className="animate-pulse pl-11 text-sm text-slate-500">Thinking…</p>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex shrink-0 gap-2 border-t border-slate-200 p-4 dark:border-slate-800"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
        <button
          type="submit"
          disabled={agent.isRunning || !input.trim()}
          className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}
