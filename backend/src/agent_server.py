"""The Claude Agent SDK agent server.

One FastAPI app, one AG-UI endpoint per registered agent.

The Quickstart's `main.py` mounts a single adapter at `/` with a hand-written
`@app.post("/")` handler. That handler is reproduced below, unchanged, inside
`_mount` — including its graceful RUN_ERROR path, which is the part worth
keeping: a malformed body or a mid-stream failure reaches the browser as an
AG-UI error event instead of a dead SSE connection, and the traceback stays
server-side.

The only thing widened is the number of mounts. This harness needs one
conversation per doc route, so every agent in `agents/registry.py` gets the
Quickstart's handler at its own path. That is also what
`add_claude_fastapi_endpoint(app, adapter, path=...)` from `ag_ui_claude_sdk`
does, but the docs never mention that function, so the published handler is
used instead.

Run with:  uv run --directory backend python src/agent_server.py
"""

from __future__ import annotations

import logging
import os
from collections.abc import AsyncIterator

import uvicorn
from ag_ui.core import EventType, RunAgentInput, RunErrorEvent
from ag_ui.encoder import EventEncoder
from ag_ui_claude_sdk import ClaudeAgentAdapter
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse

from agents.registry import REGISTRY

load_dotenv()

logging.basicConfig(level=os.environ.get("LOG_LEVEL", "INFO"))
logger = logging.getLogger("claude_agent")

HOST = os.environ.get("AGENT_HOST", "localhost")
PORT = int(os.environ.get("AGENT_PORT", "8000"))

app = FastAPI(
    title="CopilotKit + Claude Agent SDK (Python) test suite — agent server",
    description="One AG-UI endpoint per doc route.",
)


#region mount
def _mount(agent_id: str, adapter: ClaudeAgentAdapter) -> None:
    """Give one adapter the Quickstart's endpoint at `/{agent_id}`."""

    @app.post(f"/{agent_id}", name=f"run_{agent_id}")
    async def run_agent(request: Request) -> StreamingResponse:
        encoder = EventEncoder()

        input_data = RunAgentInput(**(await request.json()))
        
        async def event_stream() -> AsyncIterator[str]:
            try:
                async for event in adapter.run(input_data):
                    yield encoder.encode(event)
            except Exception as error:
                # Every failure — malformed request body or streaming —
                # becomes a graceful RUN_ERROR, and the full detail is
                # logged server-side rather than only sent to the client.
                logger.exception("Claude agent run failed: %s", agent_id)
                yield encoder.encode(
                    RunErrorEvent(
                        type=EventType.RUN_ERROR,
                        message=str(error),
                    )
                )

        return StreamingResponse(
            event_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
            },
        )


for _agent_id, _registered in REGISTRY.items():
    _mount(_agent_id, _registered.adapter)
#endregion


@app.get("/health")
async def health() -> dict:
    """Lets the README's smoke test confirm every agent mounted."""
    return {
        "status": "ok",
        "agents": sorted(REGISTRY),
        "count": len(REGISTRY),
    }


if __name__ == "__main__":
    if not os.getenv("ANTHROPIC_API_KEY"):
        logger.warning(
            "ANTHROPIC_API_KEY is not set — every run will fail with an "
            "authentication error. Put it in backend/.env."
        )
    logger.info("Mounted %d agents: %s", len(REGISTRY), ", ".join(sorted(REGISTRY)))
    uvicorn.run(app, host=HOST, port=PORT)
