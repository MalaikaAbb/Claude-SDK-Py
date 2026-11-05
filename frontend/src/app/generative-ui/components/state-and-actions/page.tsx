import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/components/state-and-actions" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Generated components can be wired to the app, not just drawn. The
          app publishes state that <code>bind</code> selectors turn into props;
          it implements named functions that component events call; an event
          with no matching function goes to the agent as a message; and a{" "}
          <code>writable</code> prop gets a setter so user input stays in the
          surface&apos;s data model.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Show ProductCards for the lamp, the chair and the mug.",
              "Show three PlanButtons: starter, team, enterprise.",
              "Show a CheckoutForm so I can enter my email.",
            ]}
            expect="Each card shows 'in cart: 0'. Clicking Add to cart logs addToCart(…, 1) on the left, adds the item to the real cart, and the card's count goes to 1 — so does clicking a '+' button on the left. Clicking a PlanButton sends a new turn to the agent about that plan. Typing in the CheckoutForm keeps its value."
            fail="'in cart' never changes: bind or useGenerativeUIState is not reaching the surface. Add to cart with no log line: the event did not match the addToCart function. A PlanButton click with no new turn: the event was dropped instead of forwarded."
          />
        </div>
      </Panel>

      <Panel title="The catalog" description="The page's two shopUI versions plus its permission, event and writable snippets, merged into one.">
        <SourceCode file="frontend/src/app/generative-ui/components/state-and-actions/catalog.tsx" />
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/generative-ui/components/state-and-actions/demo-chat/page.tsx" />
      </Panel>

      <Panel title="Notes">
        <ul className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            The page uses a <code>Cart</code> with <code>items</code> and{" "}
            <code>addItem</code> without defining it; a minimal store is
            supplied. <code>PlanButton</code> is supplied too — the page gives
            the <code>onChoose</code> event but no component to carry it.
          </li>
          <li>
            The page says the agent cannot call renderer functions in this
            version, and a <code>callRendererFunction</code> operation is
            rejected. So <code>reload</code>, which is <code>agentOnly</code>,
            has a handler but should never fire.
          </li>
          <li>
            Function values (<code>@call</code> with <code>formatCurrency</code>
            , <code>calc</code>, …) are written by the agent inside its
            operations, not registered by the app. The fourth suggestion asks
            for one.
          </li>
          <li>
            Where an event goes to the agent, the page says it rides{" "}
            <code>forwardedProps.copilotkit.ui.metadata.extensions.copilotkit_action</code>.{" "}
            <code>ClaudeAgentAdapter</code> filters forwarded props through a
            whitelist (see Agent Config), so whether the agent sees the
            action&apos;s context or just the user message is part of what this
            route tests.
          </li>
        </ul>
      </Panel>
    </>
  );
}
