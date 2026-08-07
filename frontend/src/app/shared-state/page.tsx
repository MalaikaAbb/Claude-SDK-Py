import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/shared-state" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          One object both sides can touch. The UI subscribes with{" "}
          <code>useAgent</code> and re-renders whenever the agent writes; the UI
          writes back with <code>agent.setState</code>, and the agent reads that
          at the top of its next turn. Neither direction goes through the chat
          thread.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Set your name and tone in the left panel, then ask: what do you know about me?",
              "Remember that I prefer morning meetings and hate slide decks.",
            ]}
            expect="Half of it passes today. The agent addresses you by name and matches the tone you picked — UI to agent works. The Agent Scratch pad stays empty no matter how you ask, which is the failure this route reports."
            fail="If the agent also ignores your preferences, the UI-to-agent half has regressed too and state is not reaching the prompt at all."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/shared-state/demo-chat/page.tsx" />
      </Panel>

      <Panel title="Why this route is Broken">
        <Callout tone="warn" title="The agent cannot write state back">
          <p className="leading-relaxed">
            Only one of the two directions works. <strong>UI to agent</strong>{" "}
            is fine: <code>agent.setState</code> puts preferences into{" "}
            <code>input_data.state</code>, the adapter appends them to the
            system prompt, and the reply visibly obeys them.{" "}
            <strong>Agent to UI</strong> does not arrive — the scratch pad stays
            empty however the request is phrased.
          </p>
          <p className="mt-2 leading-relaxed">
            The root cause is the one shared with four other routes. The page
            gives the agent a <code>set_notes</code> tool and instructs the model
            to call it with the full updated list; <code>set_notes</code> is a{" "}
            <strong>backend</strong> tool, and no page shows how to register one
            against <code>ClaudeAgentAdapter</code>. Pointing the prompt at it
            would only produce a hallucinated call and a stuck turn.
          </p>
          <p className="mt-2 leading-relaxed">
            This route therefore substitutes the adapter&apos;s own{" "}
            <code>ag_ui_update_state</code> — registered whenever{" "}
            <code>input_data.state</code> is present, and emitting a{" "}
            <code>StateSnapshotEvent</code> when called. That substitution is
            not sufficient in practice, which is why the status is Broken rather
            than Partial: the page is about a two-way channel, and only one
            direction carries.
          </p>
          <p className="mt-2 leading-relaxed">
            One mechanism worth checking first if you pick this up: the adapter
            gates the tool on <code>input_data.state is not None</code>, and{" "}
            <code>build_state_context_addendum</code> gates the prompt block on a
            plain truthiness test. On a fresh thread — before any preference has
            been edited — state is absent, so neither the tool nor the state
            block exists on that turn and the model has nothing to write
            through. That is a reading of the adapter source, not something
            confirmed against a live run.
          </p>
        </Callout>
        <div className="mt-4">
          <SourceCodeGroup
            files={[
              { file: "backend/src/agents/prompts.py" },
              { file: "backend/src/agents/doc_reference/shared_state.py" },
            ]}
            note="The first is what runs; the second is what the page publishes."
          />
        </div>
      </Panel>

      <Panel
        title="The two cards"
        description="NotesCard is published in full and reproduced with its shadcn imports flattened. PreferencesCard is named by handlePreferencesChange and published nowhere."
      >
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/shared-state/notes-card.tsx" },
            { file: "frontend/src/app/shared-state/preferences-card.tsx" },
          ]}
        />
      </Panel>

      <Panel title="Notes">
        <ul className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            The page&apos;s write snippet mentions a{" "}
            <code>PreferencesInjectorMiddleware</code> that reads preferences
            back out of state and adds them to the system prompt. No such class
            appears anywhere in the docs; the adapter&apos;s{" "}
            <code>build_state_context_addendum</code> does that job here.
          </li>
          <li>
            <code>latestNotesRef</code> is used but not explained by the page,
            and it matters: <code>setState</code> replaces the state object
            rather than merging, so writing preferences without carrying the
            notes forward would silently wipe them.
          </li>
          <li>
            The three follow-on pages —{" "}
            <Link
              href="/shared-state/rendering-in-app"
              className="text-[var(--accent)] underline underline-offset-4"
            >
              rendering in app
            </Link>
            ,{" "}
            <Link
              href="/shared-state/streaming"
              className="text-[var(--accent)] underline underline-offset-4"
            >
              streaming
            </Link>{" "}
            and{" "}
            <Link
              href="/shared-state/agent-readonly"
              className="text-[var(--accent)] underline underline-offset-4"
            >
              agent-readonly
            </Link>{" "}
            — each narrow this pattern. Only streaming is blocked.
          </li>
        </ul>
      </Panel>
    </>
  );
}
