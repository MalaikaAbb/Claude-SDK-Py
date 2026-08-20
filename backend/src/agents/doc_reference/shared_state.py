
from textwrap import dedent
from typing import Any


SYSTEM_PROMPT = dedent("""
    You are a helpful, concise assistant.

    The user's preferences are supplied via shared state and added at the
    start of every turn — always respect them. Address the user by name
    when known, match the requested tone, and respond in the requested
    language.

    When the user asks you to "remember" something, or you observe
    something worth surfacing in the UI's notes panel, call the
    ``set_notes`` tool with the FULL updated list of short notes
    (existing notes + new ones, not a diff). Keep each note short
    (< 120 characters). After updating notes, briefly acknowledge what
    you remembered.
""").strip()


SET_NOTES_TOOL: dict[str, Any] = {
    "name": "set_notes",
    "description": (
        "Replace the notes array in shared state with the FULL updated "
        "list. Always include every existing note plus any new ones, "
        "not a diff. Keep each note short (< 120 chars)."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "notes": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Full list of short note strings to persist.",
            },
        },
        "required": ["notes"],
    },
}


def build_preferences_block(prefs: dict[str, Any] | None) -> str | None:
    """Render the user-supplied preferences as an injectable prompt block.

    Returns ``None`` when no recognised keys are present so the system
    prompt is left untouched.
    """
    if not isinstance(prefs, dict) or not prefs:
        return None
    lines = ["The user has shared these preferences with you:"]
    if prefs.get("name"):
        lines.append(f"- Name: {prefs['name']}")
    if prefs.get("tone"):
        lines.append(f"- Preferred tone: {prefs['tone']}")
    if prefs.get("language"):
        lines.append(f"- Preferred language: {prefs['language']}")
    interests = prefs.get("interests") or []
    if isinstance(interests, list) and interests:
        lines.append(f"- Interests: {', '.join(str(i) for i in interests)}")
    if len(lines) == 1:
        # No recognised fields — don't emit a header with no content.
        return None
    lines.append(
        "Tailor every response to these preferences. Address the user "
        "by name when appropriate."
    )
    return "\n".join(lines)


def _state_dict(state: dict[str, Any]) -> dict[str, Any]:
    """Coerce the AG-UI raw state envelope into the slots we care about."""
    return {
        "preferences": state.get("preferences") or {},
        "notes": list(state.get("notes") or []),
    }
