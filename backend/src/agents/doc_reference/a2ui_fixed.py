"""A2UI Fixed Schema — the backend half, as published.

Source: https://docs.copilotkit.ai/claude-sdk-python/generative-ui/a2ui/fixed-schema
        (blocks titled `src/agents/a2ui_fixed.py`)

Copied verbatim, with one deliberate omission noted below. Nothing imports it —
see this package's docstring.

Three gaps on this page beyond the missing tool bridge:

  * `flight_schema.json` is loaded but never published. Neither is its sibling
    `booked_schema.json`. The doc's module-level line

        FLIGHT_SCHEMA = _load_schema("flight_schema.json")

    is therefore the one line not reproduced here — it would raise
    `FileNotFoundError` on import, and inventing the schema would mean
    inventing the flight card this page is about. `_load_schema` itself is kept
    exactly as published.
  * `SURFACE_ID` and `CATALOG_ID` are referenced by
    `_display_flight_operations` and defined on neither the Python nor the
    TypeScript side of the page. `CATALOG_ID` is exported by the page's own
    `catalog.ts` as `"copilotkit://flight-fixed-catalog"`; `SURFACE_ID` has no
    published value at all.
  * The page's own "Action handlers" section documents the Book button as
    inert: `a2ui.render` in the Python SDK does not yet accept
    `action_handlers`.
"""

import json
from pathlib import Path
from textwrap import dedent
from typing import Any

_SCHEMAS_DIR = Path(__file__).parent / "a2ui_schemas"


def _load_schema(filename: str) -> list[dict]:
    with open(_SCHEMAS_DIR / filename, "r", encoding="utf-8") as fh:
        return json.load(fh)


# The published module-level `FLIGHT_SCHEMA = _load_schema("flight_schema.json")`
# goes here. See this module's docstring for why it is omitted.


SYSTEM_PROMPT = dedent("""
    You help users find flights. When asked about a flight, call
    `display_flight` with origin (3-letter code), destination (3-letter
    code), airline, and price (e.g. '$289'). Keep any chat reply to one
    short sentence.
""").strip()


DISPLAY_FLIGHT_TOOL = {
    "name": "display_flight",
    "description": (
        "Show a flight card for the given trip. Emits an a2ui_operations "
        "container the runtime A2UI middleware detects and forwards to the "
        "frontend renderer."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "origin": {
                "type": "string",
                "description": "Origin airport code, e.g. 'SFO'",
            },
            "destination": {
                "type": "string",
                "description": "Destination airport code, e.g. 'JFK'",
            },
            "airline": {"type": "string", "description": "Airline name, e.g. 'United'"},
            "price": {"type": "string", "description": "Price string, e.g. '$289'"},
        },
        "required": ["origin", "destination", "airline", "price"],
    },
}


def _display_flight_operations(
    origin: str, destination: str, airline: str, price: str
) -> dict[str, Any]:
    # A2UI v0.9 message shape — each operation is wrapped in a versioned
    # container keyed by the operation name (createSurface, updateComponents,
    # updateDataModel). The runtime A2UI middleware + react-core renderer
    # (packages/react-core/src/v2/a2ui/A2UIMessageRenderer.tsx) read these
    # keys directly; the legacy snake_case `{type: "create_surface", ...}`
    # shape is silently dropped, leaving the flight card unrendered.
    # Mirrors `copilotkit.a2ui.render(...)` used by langgraph-python's
    # display_flight tool (sdk-python/copilotkit/a2ui.py).
    return {
        "a2ui_operations": [
            {
                "version": "v0.9",
                "createSurface": {
                    "surfaceId": SURFACE_ID,
                    "catalogId": CATALOG_ID,
                },
            },
            {
                "version": "v0.9",
                "updateComponents": {
                    "surfaceId": SURFACE_ID,
                    "components": FLIGHT_SCHEMA,
                },
            },
            {
                "version": "v0.9",
                "updateDataModel": {
                    "surfaceId": SURFACE_ID,
                    "path": "/",
                    "value": {
                        "origin": origin,
                        "destination": destination,
                        "airline": airline,
                        "price": price,
                    },
                },
            },
        ]
    }
