"use client";

import {
  CopilotChat,
  useConfigureSuggestions,
  useHumanInTheLoop,
} from "@copilotkit/react-core/v2";
import { useMemo } from "react";
import { z } from "zod";

import { DemoFrame } from "@/components/demo-frame";

import { TimePickerCard, type TimeSlot } from "../time-picker-card";

const AGENT_ID = "hitl-in-chat";

/** The page's slot builders, verbatim. */
function buildDefaultSlots(now = new Date()): TimeSlot[] {
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const monday = new Date(now);
  const daysUntilMonday = (8 - monday.getDay()) % 7 || 7;
  monday.setDate(monday.getDate() + daysUntilMonday);

  return [
    buildSlot(tomorrow, "Tomorrow", 10, 0),
    buildSlot(tomorrow, "Tomorrow", 14, 0),
    buildSlot(monday, "Monday", 9, 0),
    buildSlot(monday, "Monday", 15, 30),
  ];
}

function buildSlot(
  date: Date,
  labelPrefix: string,
  hour: number,
  minute: number,
): TimeSlot {
  const slotDate = new Date(date);
  slotDate.setHours(hour, minute, 0, 0);
  return {
    label: `${labelPrefix} ${formatTime(slotDate)}`,
    iso: slotDate.toISOString(),
  };
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * The page's `hitl-in-chat` cell, verbatim.
 *
 * `useHumanInTheLoop` registers a frontend tool whose handler is a Promise the
 * UI resolves. The LLM calls `book_call`, CopilotKit routes the call to
 * `render`, the card appears in the chat, and the run stays suspended until
 * `respond` is called with the user's pick.
 *
 * One addition to the doc's call: the explicit generic. Without it the hook
 * falls back to `Record<string, unknown>` and `args.topic` is `unknown` — it
 * does not infer from `parameters` the way `useRenderTool` does, which is why
 * the published snippet has to annotate its render callback `any`.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/human-in-the-loop" subtitle={`agent: ${AGENT_ID}`}>
      <Chat />
    </DemoFrame>
  );
}

function Chat() {
  const slots = useMemo(() => buildDefaultSlots(), []);

  useConfigureSuggestions({
    suggestions: [
      {
        title: "Book a call with sales",
        message:
          "Please book an intro call with the sales team to discuss pricing.",
      },
      {
        title: "Schedule a 1:1 with Alice",
        message: "Schedule a 1:1 with Alice next week to review Q2 goals.",
      },
    ],
    available: "always",
  });

  useHumanInTheLoop<{ topic: string; attendee: string }>({
    agentId: AGENT_ID,
    name: "book_call",
    description:
      "Ask the user to pick a time slot for a call. The picker UI presents fixed candidate slots; the user's choice is returned to the agent.",
    parameters: z.object({
      topic: z
        .string()
        .describe("What the call is about (e.g. 'Intro with sales')"),
      attendee: z
        .string()
        .describe("Who the call is with (e.g. 'Alice from Sales')"),
    }),
    render: ({ args, status, respond }) => (
      <TimePickerCard
        topic={args?.topic ?? "a call"}
        attendee={args?.attendee}
        slots={slots}
        status={status}
        onSubmit={(result) => respond?.(result)}
      />
    ),
  });

  return <CopilotChat agentId={AGENT_ID} className="h-full" />;
}
