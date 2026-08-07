"use client";

import {
  CopilotPopup,
  useAgentContext,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";
import { useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

import { ACTIVITIES, DemoLayout } from "../demo-layout";

const AGENT_ID = "readonly-state-agent-context";

/**
 * `useAgentContext` — props for the agent.
 *
 * Three calls, one per value. Each registers a dynamic context entry that
 * refreshes when the value changes and unregisters on unmount. There is no
 * setter and no tool, so a confused model has no way to "update" any of them.
 *
 * The three calls and the two `useState` seeds are the page's, verbatim.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/shared-state/agent-readonly"
      subtitle={`agent: ${AGENT_ID}`}
    >
      <DemoContent />
      <CopilotPopup
        agentId={AGENT_ID}
        defaultOpen={true}
        labels={{ chatInputPlaceholder: "Ask about your context..." }}
      />
    </DemoFrame>
  );
}

function DemoContent() {
  const [userName, setUserName] = useState("Atai");
  const [userTimezone, setUserTimezone] = useState("America/Los_Angeles");
  const [recentActivity, setRecentActivity] = useState<string[]>([
    ACTIVITIES[0],
    ACTIVITIES[2],
  ]);

  useConfigureSuggestions({
    suggestions: [
      {
        title: "Who am I?",
        message: "What's my name and what timezone am I in?",
      },
      {
        title: "What have I been doing?",
        message: "Summarise my recent activity and suggest what to do next.",
      },
    ],
    available: "always",
  });

  useAgentContext({
    description: "The currently logged-in user's display name",
    value: userName,
  });
  useAgentContext({
    description: "The user's IANA timezone (used when mentioning times)",
    value: userTimezone,
  });
  useAgentContext({
    description: "The user's recent activity in the app, newest first",
    value: recentActivity,
  });

  return (
    <DemoLayout
      userName={userName}
      setUserName={setUserName}
      userTimezone={userTimezone}
      setUserTimezone={setUserTimezone}
      recentActivity={recentActivity}
      setRecentActivity={setRecentActivity}
    />
  );
}
