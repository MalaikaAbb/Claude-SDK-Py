"use client";

import { CopilotKitProvider } from "@copilotkit/react-core/v2";
import type { GenerativeUIConfig } from "@copilotkit/react-core/v2/generative-ui";
import type { ReactNode } from "react";

import { nestedInspectorSetting } from "@/lib/inspector";

/**
 * The provider every Components and surfaces demo mounts.
 *
 * `generativeUI` is a provider prop and each page passes a different one — a
 * different catalog, a theme, a transport — so these demos cannot share the
 * app-wide provider. This wrapper only adds the runtime URL and the inspector
 * hand-off; the `generativeUI` value is always the page's own, passed through
 * untouched.
 */
export const COMPONENTS_RUNTIME_URL = "/api/copilotkit-components";

export function ComponentsProvider({
  generativeUI,
  children,
}: {
  generativeUI: GenerativeUIConfig;
  children: ReactNode;
}) {
  return (
    <CopilotKitProvider
      runtimeUrl={COMPONENTS_RUNTIME_URL}
      generativeUI={generativeUI}
      // Owns the inspector on these routes — see `lib/inspector.ts`.
      showDevConsole={nestedInspectorSetting === false ? false : "auto"}
    >
      {children}
    </CopilotKitProvider>
  );
}
