
"use client";

import { useCallback, useEffect, useState } from "react";

import { DemoFrame } from "@/components/demo-frame";
import { CopilotSidebar, useAgent, useCopilotKit } from "@copilotkit/react-core/v2";

/**
PARTIAL CODE - AND IMPORTS ARE MISSING. 
 */
const AGENT_ID = "programmatic-control";


export default function Page() {
  return (
    <DemoFrame
      parentPath="/programmatic-control"
      subtitle="agent: ${AGENT_ID}"
    >
      <Chat />
    </DemoFrame>
  );
}

const createMessageId = () => crypto.randomUUID();

type LogLine = { at: number; text: string };

function Chat() {
    const { agent } = useAgent({ agentId: AGENT_ID });
  const { copilotkit } = useCopilotKit();
  const run = async () => {
    if (agent.isRunning) return;
    agent.addMessage({
      id: crypto.randomUUID(),
      role: "user",
      content: "Summarize the latest sales data",
    });
    try {
      await copilotkit.runAgent({ agent });
    } catch (error) {
      console.error("CopilotKit runAgent failed:", error);
    }
  };
  return (
    <>

    <CopilotSidebar agentId={AGENT_ID} />
      <button onClick={run} disabled={agent.isRunning}>
        Run agent
      </button>
      <button
        onClick={() => copilotkit.stopAgent({ agent })}
        disabled={!agent.isRunning}
      >
        Stop
      </button>
    </>
  );
}