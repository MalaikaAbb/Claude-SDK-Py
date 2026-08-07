"""Tool Call Rendering — the backend half, as published.

Source: https://docs.copilotkit.ai/claude-sdk-python/generative-ui/tool-rendering
        (block titled `src/app/demos/tool-rendering/weather_tool.snippet.py`)

Copied verbatim. Nothing imports it — see this package's docstring.

The page's frontend registers renderers for two tools, `get_weather` and
`search_flights`, but only publishes the backend definition for the first.
`search_flights`, `get_stock_price` and `roll_dice` are named by the page and
never defined anywhere, so they are not reproduced here.
"""

from typing import Any


# Anthropic tool schema — passed via the `tools` parameter on
# `client.messages.create(...)` / `.stream(...)`. Claude calls this
# tool by name; the runtime dispatches to the matching handler below.
GET_WEATHER_TOOL: dict[str, Any] = {
    "name": "get_weather",
    "description": (
        "Get the current weather for a given location. Useful on its "
        "own for weather questions, and a great companion to "
        "`search_flights` — always consider checking the weather at a "
        "destination the user is flying to."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "location": {
                "type": "string",
                "description": "The city or region to get weather for.",
            },
        },
        "required": ["location"],
    },
}


def get_weather(location: str) -> dict[str, Any]:
    """Handler invoked when Claude calls the `get_weather` tool."""
    return {
        "city": location,
        "temperature": 68,
        "humidity": 55,
        "wind_speed": 10,
        "conditions": "Sunny",
    }
