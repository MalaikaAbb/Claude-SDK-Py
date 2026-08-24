"use client";

import {
  CopilotSidebar,
  UseAgentUpdate,
  useAgent,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";
import { useEffect } from "react";
import { DemoFrame } from "@/components/demo-frame";

import { NotesCard } from "../../notes-card";

const AGENT_ID = "shared-state-read-write";

type CanvasState = {
  title: string;
  items: { id: string; label: string; done: boolean }[];
};

export default function Page() {
  return (
    <DemoFrame
      parentPath="/shared-state/rendering-in-app"
      subtitle={`agent: ${AGENT_ID}`}
    >
      <Layout />
    </DemoFrame>
  );
}

function Layout() {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "Give the canvas something",
        message:
          "Remember that I ship on Fridays and that the Q3 review is on the 14th.",
      },
    ],
    available: "always",
  });

  return (
    <div className="h-full overflow-hidden">
      <Canvas />
      <CopilotSidebar agentId={AGENT_ID} defaultOpen />
    </div>
  );
}

function Canvas() {
  // No chat component in this subtree at all — just a subscription.
  
const INITIAL_CANVAS_STATE: CanvasState = {
  title: "Project launch",
  items: [
    { id: "research", label: "Research user needs", done: true },
    { id: "prototype", label: "Build a prototype", done: false },
  ],
};
  const { agent, isReady } = useAgent({
    agentId: AGENT_ID,
  });

    const state = (agent.state ?? {}) as Partial<CanvasState>;

   useEffect(() => {
    if (!isReady) return;
 
    const current = (agent.state ?? {}) as Partial<CanvasState>;
    const updates: Partial<CanvasState> = {};
 
    if (current.title === undefined) {
      updates.title = INITIAL_CANVAS_STATE.title;
    }
    if (current.items === undefined) {
      updates.items = INITIAL_CANVAS_STATE.items;
    }
 
    if (Object.keys(updates).length > 0) {
      agent.setState({ ...(agent.state ?? {}), ...updates });
    }
  }, [agent, isReady, state.title, state.items]); 


// function toggleItem(id: string) {
//   agent.setState({
//     ...agent.state,
//     items: (agent.state?.items ?? []).map((it) =>
//       it.id === id ? { ...it, done: !it.done } : it,
//     ),
//   });
// }

  //const state = (agent.state ?? {}) as Partial<CanvasState>;
  return (
    <main className="canvas">
      <h1>{state.title ?? "Untitled"}</h1>
      <ul>
        {(state.items ?? []).map((item) => (
          <li key={item.id} data-done={item.done}>
            {item.label}
          </li>
        ))}
      </ul>
    </main>
  );
}
