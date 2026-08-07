"use client";

import {
  CopilotChat,
  UseAgentUpdate,
  useAgent,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";
import { DemoFrame } from "@/components/demo-frame";

import { NotesCard } from "../notes-card";
import { PreferencesCard, type Preferences } from "../preferences-card";

const AGENT_ID = "shared-state-read-write";

type RWAgentState = {
  preferences: Preferences;
  notes: string[];
};

/**
 * The two-way channel, both directions live.
 *
 * READ: `useAgent` with `OnStateChanged` re-renders whenever the agent mutates
 * state, so the notes panel reflects the agent's writes.
 *
 * WRITE: `agent.setState` from the preferences editor. On the agent's next turn
 * the adapter serialises that state into the system prompt, so the UI's writes
 * visibly steer the model.
 *
 * The one deviation from the page: the agent writes notes with the adapter's
 * built-in `ag_ui_update_state` tool rather than the page's `set_notes`, which
 * is a backend tool with no registration path. Same channel, different tool
 * name — see the notes page.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/shared-state" subtitle={`agent: ${AGENT_ID}`}>
      <Demo />
    </DemoFrame>
  );
}

function Demo() {
  // Subscribe the component to agent state changes. Any time the agent
  // mutates its state this hook fires, we re-render, and the panels
  // reflect the new values.
  const { agent } = useAgent({
    agentId: AGENT_ID,
    updates: [UseAgentUpdate.OnStateChanged],
  });

  useConfigureSuggestions({
    suggestions: [
      {
        title: "Ask it to remember something",
        message: "Remember that I prefer morning meetings and hate slide decks.",
      },
      {
        title: "Check it read your preferences",
        message: "What do you know about me so far?",
      },
    ],
    available: "always",
  });

  const state = (agent.state ?? {}) as Partial<RWAgentState>;
  const notes = state.notes ?? [];
  const preferences = state.preferences ?? {};

  // WRITE: every edit in the sidebar goes straight into agent state.
  // On the agent's next turn the adapter reads this back out of state and
  // adds it to the system prompt — so the UI's writes visibly steer the model.
  //
  // The doc's line here is `notes: latestNotesRef.current`, a ref it names and
  // never defines. Carrying the notes forward is the part that matters —
  // `setState` replaces the state object rather than merging, so writing
  // preferences alone would wipe them. A ref is not how to do it: this handler
  // is rebuilt each render and already closes over the current `notes`, and
  // assigning to a ref during render is a React rules violation.
  const handlePreferencesChange = (next: Preferences) => {
    agent.setState({
      preferences: next,
      notes, // preserve what the agent has written
    } as RWAgentState);
  };

  const handleClearNotes = () => {
    agent.setState({ preferences, notes: [] } as RWAgentState);
  };

  return (
    <div className="grid h-full grid-cols-1 gap-4 overflow-y-auto p-4 lg:grid-cols-[380px_1fr]">
      <div className="space-y-4">
        <PreferencesCard
          preferences={preferences}
          onChange={handlePreferencesChange}
        />
        <NotesCard notes={notes} onClear={handleClearNotes} />
      </div>
      <div className="min-h-[32rem] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
        <CopilotChat agentId={AGENT_ID} className="h-full" />
      </div>
    </div>
  );
}
