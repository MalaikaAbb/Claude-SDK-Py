import { AGENT_URL } from "@/lib/agents";

/**
 * Same-origin proxy for the agent server's governance audit log, so the
 * Governed Actions demo can read it without CORS on the Python side.
 */
export async function GET() {
  try {
    const res = await fetch(`${AGENT_URL}/governance/audit`, { cache: "no-store" });
    return new Response(await res.text(), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return Response.json(
      { error: `agent server unreachable at ${AGENT_URL}: ${String(error)}` },
      { status: 502 },
    );
  }
}
