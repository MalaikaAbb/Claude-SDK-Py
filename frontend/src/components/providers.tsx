"use client";

import { CopilotKitProvider } from "@copilotkit/react-core/v2";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { rootInspectorSetting } from "@/lib/inspector";

/**
 * One provider for the whole app, so a conversation survives navigation
 * between test routes.
 *
 * Three routes mount a second, nested `<CopilotKit>` of their own rather than
 * using this one — Voice (its own runtime, because `transcriptionService` only
 * exists on the v2 runtime handler) and the two A2UI routes (each needs its
 * own catalog on the provider, and the doc pages pass it there). Those are the
 * cases where the doc page is specifically about the provider, so an isolated
 * instance is the honest thing to show.
 *
 * On the inspector prop name, which is genuinely confusing: the doc page says
 * `enableInspector`, and that prop exists — but only on `<CopilotKit>`, the v1
 * compatibility wrapper. All it does there is forward to this provider's
 * `showDevConsole`. On `CopilotKitProvider` there is no `enableInspector` at
 * all, and `showDevConsole` is the only switch. See README §9.
 *
 * `headers` carries the identity the runtime's `identifyUser` reads back.
 * Threads are scoped per user, so without it every visitor of a deployed copy
 * would share one history. A real app derives this from a verified session —
 * the Thread & History Lifecycle page shows that shape. A local harness has no
 * session, so it sends a fixed demo identity you can override with
 * NEXT_PUBLIC_DEMO_USER_ID to watch two thread lists diverge.
 *
 * `useSingleEndpoint` is deliberately absent. Omitted, it means `auto`: the
 * client probes `GET /api/copilotkit/info` and matches whichever transport the
 * runtime serves. Pinning it to `true` would 404 against the multi-route
 * handler while `/info` still returned 200 — so the app would look connected
 * and every thread call would fail.
 */

const RUNTIME_URL = "/api/copilotkit";

const DEMO_USER_ID = process.env.NEXT_PUBLIC_DEMO_USER_ID ?? "harness-local";
const DEMO_USER_NAME = process.env.NEXT_PUBLIC_DEMO_USER_NAME ?? "Harness User";

export function Providers({ children }: { children: ReactNode }) {
  // The inspector can only watch the core it is attached to, and two of them
  // on one page is fatal — so on routes that bring their own provider, this
  // one yields. `lib/inspector.ts` owns that decision.
  const pathname = usePathname();

  return (
    <CopilotKitProvider
      runtimeUrl={RUNTIME_URL}
      headers={{
        "x-user-id": DEMO_USER_ID,
        "x-user-name": DEMO_USER_NAME,
      }}
      showDevConsole={rootInspectorSetting(pathname)}
      // Bottom-left, because the prebuilt Popup and Sidebar launchers both
      // live bottom-right and would sit under the inspector button.
      inspectorDefaultAnchor={{ horizontal: "left", vertical: "bottom" }}
      onError={(event) => {
        console.error(`[CopilotKit ${event.code}]`, event.error);
      }}
    >
      {children}
    </CopilotKitProvider>
  );
}
