import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { CodeBlock, Panel, TryIt } from "@/components/ui";

const ON_UPLOAD = `// Published on the page, not used by this demo: replace the default
// base64 reader with your own upload, and return a URL instead of bytes.
<CopilotChat
  attachments={{
    enabled: true,
    onUpload: async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const { url } = await res.json();
      return { type: "url", value: url, mimeType: file.type };
    },
  }}
/>`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/multimodal-attachments" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          One prop —{" "}
          <code>attachments=&#123;&#123; enabled: true &#125;&#125;</code> —
          turns on the paperclip and drag-and-drop. Files are read as base64 and
          become <code>InputContent</code> parts on the message, so the agent
          receives text and attachments in one array over AG-UI. The demo also
          sets an <code>accept</code> filter, a <code>maxSize</code>, and both
          error callbacks.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Drag a PNG onto the chat, then ask: what is in this image?",
              "Drop a .txt file — it should be rejected by the accept filter.",
            ]}
            expect="Images preview as thumbnails with a lightbox; Claude describes the picture. A rejected file adds an invalid-type line to the red banner."
            fail="No paperclip in the composer, or a RUN_ERROR — the latter means the model was sent a modality it cannot read."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/multimodal-attachments/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="Custom upload handler"
        description="Published on the page. Not exercised here — the default inline base64 path is what makes the demo self-contained."
      >
        <CodeBlock code={ON_UPLOAD} language="tsx" />
      </Panel>

      <Panel title="Notes">
        <ul className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            This is the one page in the set with no backend half at all, and
            correctly so — attachments ride the standard AG-UI{" "}
            <code>InputContent</code> schema, so the agent needs no changes.
            Claude reads images and PDFs; audio and video are model-dependent
            and will surface as a <code>RUN_ERROR</code> if unsupported, which
            the banner catches.
          </li>
          <li>
            The page&apos;s error snippets target a global <code>toast</code>{" "}
            and <code>console.error</code>. Both write to the on-page banner
            here so a rejection is visible without opening devtools.
          </li>
        </ul>
      </Panel>
    </>
  );
}
