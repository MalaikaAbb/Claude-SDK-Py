# Frontend Tools

> Let your agent interact with and update your application's UI.



<!-- interactive demo: frontend-tools -->


<Callout type="info" title="See this in Inspector">
  Open Inspector on localhost. Go to **Agents**, then **Frontend Tools**.
  Your tool and its schema are listed.

  More detail: [Inspector](/claude-sdk-python/inspector).
</Callout>


## What is this?

Frontend tools let your agent define and invoke client-side functions that run entirely in the user's browser. Because the handler executes on the frontend, it has direct access to component state, browser APIs, and any third-party UI library the page already uses. That's how an agent can "reach into" the app: update React state, trigger animations, read `localStorage`, pop a toast, or steer the user's view.

This page covers the "agent drives the UI" shape of frontend tools. The same primitive also powers Generative UI and Human-in-the-loop; see those pages for interaction patterns.

## When should I use this?

Use frontend tools when your agent needs to:

- Read or modify React component state
- Access browser APIs like `localStorage`, `sessionStorage`, or cookies
- Trigger UI updates, animations, or transitions
- Show alerts, toasts, or notifications
- Interact with third-party frontend libraries
- Perform anything that requires the user's immediate browser context

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

Register a frontend tool with `useFrontendTool`. Give it a name, a Zod schema for parameters, and a handler. The agent can then call it like any other tool and your frontend runs it in the browser.

```typescript
// src/app/demos/frontend-tools/page.tsx
import React, { useState } from "react";
import {
  CopilotKit,
  CopilotSidebar,
  useFrontendTool,
} from "@copilotkit/react-core/v2";
import { z } from "zod";
import { Background, DEFAULT_BACKGROUND } from "./background";
import { useFrontendToolsSuggestions } from "./suggestions";

function Chat() {
  const [background, setBackground] = useState<string>(DEFAULT_BACKGROUND);

  useFrontendTool({
    name: "change_background",
    description:
      "Change the page background. Accepts any valid CSS background value — colors, linear or radial gradients, etc.",
    parameters: z.object({
      background: z
        .string()
        .describe("The CSS background value. Prefer gradients."),
    }),
    handler: async ({ background }) => {
      setBackground(background);
      return { status: "success" };
    },
  });
```

The handler receives the parsed, type-safe parameters and can do anything
the browser can: update state, call an API, touch the DOM. Its return value
is sent back to the agent as the tool result so the model can reason about
what happened.

```typescript
// src/app/demos/frontend-tools/page.tsx
    handler: async ({ background }) => {
      setBackground(background);
      return { status: "success" };
    },
```

## Registering a list of tools

`useFrontendTool` registers one tool per call, so it cannot be called in a loop
over a list whose length changes between renders. When the set of tools comes
from state, from props, or from a backend response, use
[`useFrontendTools`](/reference/hooks/useFrontendTools) instead. It takes an
array and runs a single effect over it, so the array can be empty on one render
and hold twenty entries on the next.

```tsx
useFrontendTools(
  reports.map((report) => ({
    name: `open_${report.id}`,
    description: `Open the ${report.title} report`,
    handler: async () => navigate(`/reports/${report.id}`),
  })),
  [navigate],
);
```

Tools that leave the array are unregistered, tools that join it are registered,
and a re-render that produces an equal list does not re-register anything. A
description built from your data stays current on its own. The second argument
is for values a handler closes over, such as `navigate` above.

<IntegrationGrid path="frontend-tools" />
