"""Sub-Agents — the backend half, as published.

Source: https://docs.copilotkit.ai/claude-sdk-python/multi-agent/subagents
        (blocks titled `subagents_agent.py - supervisor tool schemas` and
        `src/agents/subagents_agent.py`)

Copied verbatim. Nothing imports it — see this package's docstring.

Two extra gaps on this page beyond the missing tool bridge:

  * `_invoke_sub_agent` imports `normalize_claude_model` from
    `agents.claude_agent_sdk_adapter`. That module is named on the Quickstart
    but its contents are never published, so the import below cannot resolve.
    This file would raise `ImportError` on import, which is one more reason it
    is not imported.
  * The page describes the run loop that dispatches a delegation tool, records
    it into a `delegations` state slot and returns the sub-agent's text as a
    `tool_result` — the "subagents-delegation-flow region". That region is
    never published either, so the piece that makes the live log grow does not
    exist in the docs.
"""

import os
from typing import Any

import anthropic

from agents.claude_agent_sdk_adapter import normalize_claude_model  # not published

DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-6"


# Each sub-agent is defined by its own system prompt; `_invoke_sub_agent`
# (below) issues a single-shot Anthropic call as that sub-agent. They
# don't share memory or tools with the supervisor — the supervisor only
# ever sees what the sub-agent returns as a tool result.
SUB_AGENT_PROMPTS: dict[str, str] = {
    "research_agent": (
        "You are a research sub-agent. Given a topic, produce a concise "
        "bulleted list of 3-5 key facts. No preamble, no closing."
    ),
    "writing_agent": (
        "You are a writing sub-agent. Given a brief and optional source "
        "facts, produce a polished 1-paragraph draft. Be clear and "
        "concrete. No preamble."
    ),
    "critique_agent": (
        "You are an editorial critique sub-agent. Given a draft, give "
        "2-3 crisp, actionable critiques. No preamble."
    ),
}


SUPERVISOR_SYSTEM_PROMPT = (
    "You are a supervisor agent that coordinates three specialized "
    "sub-agents to produce high-quality deliverables.\n\n"
    "Available sub-agents (call them as tools):\n"
    "  - research_agent: gathers facts on a topic.\n"
    "  - writing_agent: turns facts + a brief into a polished draft.\n"
    "  - critique_agent: reviews a draft and suggests improvements.\n\n"
    "For most non-trivial user requests, delegate in sequence: "
    "research -> write -> critique. Pass the relevant facts/draft "
    "through the `task` argument of each tool. Keep your own messages "
    "short — explain the plan once, delegate, then return a concise "
    "summary once done. The UI shows the user a live log of every "
    "sub-agent delegation, including the in-flight 'running' state."
)


# The supervisor delegates by calling tools. Each entry in
# `SUPERVISOR_TOOLS` is an Anthropic tool schema that the supervisor LLM
# "calls" to delegate work; the run loop in `run_subagents_agent` (see
# the subagents-delegation-flow region) runs the matching sub-agent
# synchronously, records the delegation into shared agent state, and
# returns the sub-agent's output as a tool_result the supervisor can
# read on its next step.
def _delegation_tool_schema(name: str, description: str) -> dict[str, Any]:
    return {
        "name": name,
        "description": description,
        "input_schema": {
            "type": "object",
            "properties": {
                "task": {
                    "type": "string",
                    "description": (
                        "The full task description to hand to the "
                        "sub-agent. Pass relevant prior facts/drafts "
                        "verbatim — the sub-agent has no shared memory "
                        "with the supervisor."
                    ),
                }
            },
            "required": ["task"],
        },
    }


SUPERVISOR_TOOLS: list[dict[str, Any]] = [
    _delegation_tool_schema(
        "research_agent",
        "Delegate a research task. Returns a bulleted list of key facts.",
    ),
    _delegation_tool_schema(
        "writing_agent",
        (
            "Delegate a drafting task. Pass relevant facts in `task`. "
            "Returns a polished paragraph."
        ),
    ),
    _delegation_tool_schema(
        "critique_agent",
        "Delegate a critique task. Returns 2-3 actionable critiques.",
    ),
]


async def _invoke_sub_agent(
    client: anthropic.AsyncAnthropic,
    sub_agent: str,
    task: str,
) -> str:
    """Issue a single-shot Anthropic call as the named sub-agent.

    Returns the concatenated text content of the response. Raises any
    SDK exception so the caller can mark the delegation as ``failed``.
    """
    response = await client.messages.create(
        model=normalize_claude_model(
            os.getenv("ANTHROPIC_SUBAGENT_MODEL", DEFAULT_ANTHROPIC_MODEL)
        ),
        max_tokens=1024,
        system=SUB_AGENT_PROMPTS[sub_agent],
        messages=[{"role": "user", "content": task}],
    )
    parts: list[str] = []
    for block in response.content:
        if getattr(block, "type", None) == "text":
            parts.append(getattr(block, "text", ""))
    text = "".join(parts).strip()
    if not text:
        raise RuntimeError("sub-agent returned empty response")
    return text
