"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

/**
 * "WebMCP only, with no agent": loads the page's `webmcp.ts` module, whose
 * module-level `CopilotKitCore` registers `searchOrders` with no runtime and
 * no agent. Loaded on demand so the core instance exists only on this page.
 */
export default function Page() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    import("../../_demo/webmcp").then(() => setLoaded(true));
  }, []);

  return (
    <DemoFrame parentPath="/webmcp" subtitle="CopilotKitCore · no agent">
      <div className="space-y-3 p-4 text-sm">
        <p>
          Core instance {loaded ? "created" : "loading…"}.{" "}
          <Link href="/webmcp/demo-chat" className="text-[var(--accent)] underline underline-offset-4">
            ← Back to the React frontend tool
          </Link>
        </p>
      </div>
    </DemoFrame>
  );
}
