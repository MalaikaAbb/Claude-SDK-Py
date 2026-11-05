"""Markdown mode — the "build your own prompt" backend fragment, as published.

Source: https://docs.copilotkit.ai/claude-sdk-python/generative-ui/components/markdown-mode

Copied verbatim. Nothing imports it. It is the backend half of the page's
`sendContext: false` option: the provider stops sending the fence guideline
as context, and the agent is expected to read the catalog out of
`forwarded_props["copilotkit"]["ui"]` and write its own system prompt.

`/generative-ui/components/markdown-mode` runs the default (`sendContext`
left on) instead, because this fragment has nowhere to live: `ClaudeAgentAdapter`
filters `forwarded_props` through its `ALLOWED_FORWARDED_PROPS` whitelist
before a run starts — the same wall the Agent Config route hits — and the
page shows no adapter hook for rewriting the system prompt per run. `input`,
`MY_PROMPT` and `json` are bound by an enclosing run function the page does
not publish.
"""


def _published_fragment() -> None:  # pragma: no cover - reference only
    import json  # noqa: F401 - the page uses it unimported

    input = ...  # noqa: A001 - bound by the enclosing run function
    MY_PROMPT = ...  # noqa: N806 - undefined on the page

    ui = input.forwarded_props["copilotkit"]["ui"]
    catalog = ui["v1.0"]["inlineCatalogs"][0]
    system = f"{MY_PROMPT}\n\n{catalog['instructions']}\n\nComponents:\n{json.dumps(catalog['components'])}"  # noqa: F841
