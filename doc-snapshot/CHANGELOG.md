# Doc drift changelog

What the CopilotKit docs changed under this repo, written by the sync on
`/doc-sync`. Only pages that actually moved are recorded — a sync that finds
everything unchanged writes nothing here at all.

Holds the 3 most recent dated entries. When a change lands on a fourth
date, the oldest entry is dropped. Entries are counted, not aged, so a gap of
weeks between changes does not expire anything.

## 2026-08-17

### 17:33 UTC — 4 pages, highest severity high

**High — CSS Customization** · _local snapshot edit, not an upstream change_

`/claude-sdk-python/custom-look-and-feel/css` · route `/custom-look-and-feel/css` · under “Reference”

6 code lines, 4 prose lines changed.

````diff
+ (`@copilotkit/react-ui`). The newer **v2** components
+ (`@copilotkit/react-core/v2`) are Tailwind + shadcn-based and use a
+ separate set of design tokens. See [v2 design
+ tokens](#v2-design-tokens-shadcn) below.
+ /* Dark mode is keyed off a `.dark` ancestor */
+ .dark [data-copilotkit] {
+ --background: oklch(0.145 0 0);
+ --foreground: oklch(0.985 0 0);
````

**High — Multimodal Attachments** · _local snapshot edit, not an upstream change_

`/claude-sdk-python/multimodal-attachments` · route `/multimodal-attachments` · under “Custom upload handler” · in a `tsx` block

14 code lines changed.

````diff
- 
+ <CopilotChat
+ attachments={{
+ enabled: true,
+ onUpload: async (file) => {
+ const buffer = await file.arrayBuffer();
+ const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
+ return {
````

**Low — Frontend Tools** · _local snapshot edit, not an upstream change_

`/claude-sdk-python/frontend-tools` · route `/frontend-tools` · under “When should I use this?”

1 prose line changed.

````diff
+ - Read or modify React component state
````

**Low — Quickstart** · _local snapshot edit, not an upstream change_

`/claude-sdk-python/quickstart` · route `/quickstart` · under “Quickstart”

1 prose line changed.

````diff
+ - **Start from scratch** to scaffold the full Claude Agent SDK Python showcase.
````

### 17:05 UTC — 3 pages, highest severity high

**High — Programmatic Control** · _local snapshot edit, not an upstream change_

`/claude-sdk-python/programmatic-control` · route `/programmatic-control` · under “Run Claude through an AG-UI endpoint” · in a `typescript` block

1 code line changed.

````diff
+ const [input, setInput] = useState("");
````

**Low — A2UI · Dynamic Schema** · _local snapshot edit, not an upstream change_

`/claude-sdk-python/generative-ui/a2ui/dynamic-schema` · route `/generative-ui/a2ui/dynamic-schema` · under “The 3-file split”

3 prose lines changed.

````diff
- | `renderers.tsx` | React implementations keyed by the same names. TypeScript enforces that every
+ | `renderers.tsx` | React implementations keyed by the same names. TypeScript enforces that every definition has a renderer. |
+ | `catalog.ts` | `createCatalog(definitions, renderers, { includeBasicCatalog: true })`: merges your custom components with CopilotKit's built-in primitives. |
````

**Low — Voice** · _local snapshot edit, not an upstream change_

`/claude-sdk-python/voice` · route `/voice` · under “Voice”

1 prose line changed.

````diff
+ You have a working chat surface and you want users to be able to speak instead of type. By the end of this guide, the chat composer will sprout a mic button, recorded audio will be transcribed by the runtime, and the transcript will auto-send to the agent like any other message.
````

### 13:07 UTC — 1 page, highest severity low

**Low — Multimodal Attachments** · _local snapshot edit, not an upstream change_

`/claude-sdk-python/multimodal-attachments` · route `/multimodal-attachments` · under “Supported file types”

1 prose line changed.

````diff
+ | **Image** | `image/*` | Thumbnail with lightbox | Supported by most vision-capable models (GPT-4o, Claude, etc.) |
````
