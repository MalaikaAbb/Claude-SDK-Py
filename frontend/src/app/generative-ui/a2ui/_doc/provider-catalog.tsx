// Byte-exact copy of a snippet on https://docs.copilotkit.ai/claude-sdk-python/generative-ui/a2ui
// ("Pass a catalog on the provider", title app/page.tsx). Type-checked, never served or rendered: `_doc` is a private folder and
// nothing imports it. Undefined names on the page are suppressed, not filled in.
import { CopilotKit } from "@copilotkit/react-core/v2";

// @ts-expect-error verbatim doc code: `myCatalog` is never defined on the page (TS2304)
<CopilotKit runtimeUrl="/api/copilotkit" a2ui={{ catalog: myCatalog }}>
  {/* @ts-expect-error verbatim doc code: `children` is never defined on the page (TS2304) */}
  {children}
</CopilotKit>;
