# Components as Tools

> Let your agent render rich React components directly in the chat by calling them as tools.


<!-- interactive demo: gen-ui-tool-based -->


## What is this?

Tool-based Generative UI is the simplest form of Generative UI: you register
a React component with `useComponent`, and CopilotKit exposes it to the
agent as a tool. When the agent calls the tool, CopilotKit renders your
component inline in the chat, passing the tool's arguments straight through
as typed props.

Unlike [tool rendering](/claude-sdk-python/generative-ui/tool-rendering), which wraps a
real backend tool in a custom UI, tool-based GenUI is the component. There
is no handler, no user interaction, no server-side execution. The agent
decides when to show it, populates the data, and CopilotKit paints it.

## When should I use this?

Use `useComponent` when you want to:

- Display rich UI (cards, charts, tables, dashboards) inline in the chat
- Show structured data the agent has derived from its reasoning
- Render previews, status indicators, or visual summaries
- Let the agent present information beyond plain text

For components that need user interaction, see
[Human-in-the-loop](/claude-sdk-python/human-in-the-loop). For operational transparency
around a real backend tool, see [Tool rendering](/claude-sdk-python/generative-ui/tool-rendering).

## How it works in code

<Steps>
  <Step>
    ### Forward browser tools to Claude

    Frontend tools registered with `useFrontendTool` arrive in the AG-UI run
    input. This demo's server calls the Anthropic Messages API directly for
    runs that carry frontend tools, so it converts each AG-UI tool definition
    into a Messages API tool schema first.

    The published `ClaudeAgentAdapter` from `ag_ui_claude_sdk` needs no such
    conversion. It registers each frontend tool on its own in-process MCP tool
    server as `mcp__ag_ui__<name>`, allows it, and ends the run when Claude
    calls it so the browser can execute the tool. Pass the run input to the
    adapter and frontend tools work with no extra wiring.

    
~~~~python title="agent.py"
def _build_frontend_tools(input_data: RunAgentInput) -> list[dict[str, Any]]:
    """Extract frontend-defined tools from the AG-UI request.

    The CopilotKit runtime forwards frontend tool definitions (registered
    via ``useFrontendTool``, ``useHumanInTheLoop``, etc.) in
    ``input_data.tools``. We convert them to the Anthropic ``tools``
    schema so the LLM can call them. The runtime intercepts the resulting
    tool-call events and routes them to the frontend for resolution.
    """
    out: list[dict[str, Any]] = []
    for t in input_data.tools or []:
        name = getattr(t, "name", None) or (
            t.get("name") if isinstance(t, dict) else None
        )
        description = getattr(t, "description", None) or (
            t.get("description", "") if isinstance(t, dict) else ""
        )
        parameters = getattr(t, "parameters", None) or (
            t.get("parameters", {}) if isinstance(t, dict) else {}
        )
        if not name:
            continue
# [!code highlight:7]
        out.append(
            {
                "name": name,
                "description": description or "",
                "input_schema": parameters or {"type": "object", "properties": {}},
            }
        )
    return out


~~~~

  </Step>
</Steps>

Import the React hook and Zod in the component that registers the tool. This also
applies to the built-in agent, which needs no backend tool-registration step.

```tsx
import { useComponent } from "@copilotkit/react-core/v2";
import { z } from "zod";
```

`useComponent` takes a name, a Zod schema for its props, and the component
to render. The runtime registers it as a frontend tool so the agent can
discover it, and the schema becomes that tool's parameter definition — it is
what tells the model which arguments to send.

<Callout type="warn">
  `parameters` is optional, but leaving it out advertises the tool with an
  empty parameter schema (`{ "type": "object", "properties": {} }`). The model
  then has nothing to fill in, so it calls the tool with no arguments and your
  component renders with no props. Pass a schema for any component that needs
  data.
</Callout>

```typescript
// src/app/demos/gen-ui-tool-based/page.tsx
  useComponent({
    name: "render_bar_chart",
    description: "Display a bar chart with labeled numeric values.",
    parameters: barChartPropsSchema,
    render: BarChart,
  });
```

The component itself is ordinary React: it reads only its props and can
stream in as the agent fills the payload. The example above uses
[Recharts](https://recharts.org) for the bar chart; it doesn't know
anything about CopilotKit.

<Callout type="info">
  The `name` you pass to `useComponent` is what the agent sees as the tool
  name. Make it a verb like `render_bar_chart` or `show_weather` so the LLM
  reliably picks it when the user asks for that visualization.
</Callout>

## Rendering in a headless chat

CopilotKit's built-in chat components paint registered components for you. A
headless or custom chat renders the message list itself, so nothing paints a
tool call unless you render it — the component is registered and the agent
calls it, but the chat stays empty.

Render the tool calls on each assistant message with
`CopilotChatToolCallsView`:

```tsx
import { CopilotChatToolCallsView } from "@copilotkit/react-core/v2";

<CopilotChatToolCallsView message={assistantMessage} messages={allMessages} />;
```

It looks up the sibling `tool`-role message for each tool call and hands both
to the registered renderer. For finer placement, call `useRenderToolCall()` and
paint each tool call yourself — see
[Headless UI](/claude-sdk-python/custom-look-and-feel/headless-ui).

<IntegrationGrid path="generative-ui/tool-based" />
