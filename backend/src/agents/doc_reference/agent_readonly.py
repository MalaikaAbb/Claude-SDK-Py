"""Agent Read-Only Context — the backend half, as published.

Source: https://docs.copilotkit.ai/claude-sdk-python/shared-state/agent-readonly
        (block titled `agent.py`)

Copied verbatim. Nothing imports it, and — as with `frontend_tools.py` — that
is because the adapter already does it, not because it is broken. The
`/shared-state/agent-readonly` route works.

`build_state_context_addendum` in `ag_ui_claude_sdk/utils.py` walks
`input_data.context` and appends one `- {description}: {value}` line per entry
under a `## Context from the application` heading, then appends the same for
`input_data.state`. That is the loop below, done for you, and it is why the
route needs no custom backend.

Kept here so the manual form can be read next to the doc link.
"""

# The published block is a fragment lifted out of a larger run function — it
# opens mid-body at `context_entries = ...` and rebinds a `system` variable
# defined above it. Reproduced at its published indentation.


def _published_fragment() -> None:  # pragma: no cover - reference only
    input_data = ...  # noqa: F841 - bound by the enclosing run function
    system = ...  # noqa: F841 - bound by the enclosing run function

    context_entries = getattr(input_data, "context", None) or []
    if context_entries:
        context_lines: list[str] = []
        for entry in context_entries:
            if isinstance(entry, dict):
                description = entry.get("description")
                value = entry.get("value")
            else:
                description = getattr(entry, "description", None)
                value = getattr(entry, "value", None)
            if description:
                context_lines.append(f"{description}: {value}")
        if context_lines:
            system = f"{system}\n\nContext:\n" + "\n".join(context_lines)
