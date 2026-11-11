import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/custom-look-and-feel/markdown" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Assistant text goes through the <code>markdownRenderer</code> slot on
          the assistant message, which is Streamdown by default. The slot takes
          three shapes, and the demo switches between them on one chat:
          a props object whose <code>components</code> map swaps the element
          for one HTML tag; a class string merged onto the markdown container;
          and a component that gets the raw <code>content</code> and replaces
          Streamdown entirely.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Reply with a '## Links' heading, then a markdown link to https://copilotkit.ai and a short **bold** sentence",
            ]}
            expect={
              <>
                <strong>default</strong>: a normal heading and link.{" "}
                <strong>components</strong>: the heading is uppercase with an
                orange left rule, and the link is orange with a wavy underline.
                In DevTools the <code>&lt;a&gt;</code> has{" "}
                <code>class=&quot;my-link&quot;</code>,{" "}
                <code>target=&quot;_blank&quot;</code>, and no{" "}
                <code>data-streamdown</code> or <code>node</code> attribute.{" "}
                <strong>class-string</strong>: the whole block is smaller with
                looser line height. <strong>replace</strong>: the raw markdown
                is shown as-is in a <code>&lt;pre&gt;</code>, with{" "}
                <code>##</code> and <code>[…](…)</code> visible.
              </>
            }
            fail={
              <>
                Every mode looks the same, or the <code>&lt;a&gt;</code> has a
                literal <code>node=&quot;[object Object]&quot;</code> attribute.
              </>
            }
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/custom-look-and-feel/markdown/demo-chat/page.tsx" />
      </Panel>

      <Panel title="Harness-only stylesheet">
        <Callout tone="warn" title="Not from the docs">
          The doc&apos;s <code>components</code> example sets{" "}
          <code>my-link</code> and <code>my-heading</code> but never defines
          them, so the verbatim code produces no visible change. This file adds
          those two classes so the override can be seen. It is taken from the
          google-adk harness, not the doc page. Every other line of the demo is
          copied from the doc as published. The page names no backend, so the
          demo reuses the <code>chat-slots</code> agent (the Quickstart adapter
          under another name).
        </Callout>
        <div className="mt-4">
          <SourceCode file="frontend/src/app/custom-look-and-feel/markdown/markdown.css" />
        </div>
      </Panel>

      <Panel title="Custom tags are not supported">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The doc has no runnable code for this section. It says a key such as{" "}
          <code>&quot;reference-chip&quot;</code> in <code>components</code>{" "}
          is a type error, and that the renderer sanitizes model output against
          an allowlist of standard HTML elements, so unknown tags are removed
          and their text is kept. Allowlisted tags such as{" "}
          <code>&lt;kbd&gt;</code> and <code>&lt;sup&gt;</code> are kept.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              'Repeat exactly, without a code block: Hi <reference-chip id="42">Doc 42</reference-chip>. Press <kbd>Ctrl</kbd>+<kbd>C</kbd>. E=mc<sup>2</sup>',
            ]}
            expect={
              <>
                In <strong>default</strong> mode, the text reads &quot;Hi Doc
                42.&quot; with no <code>&lt;reference-chip&gt;</code> element
                in the DOM, while <code>&lt;kbd&gt;</code> and{" "}
                <code>&lt;sup&gt;</code> render as real elements.
              </>
            }
            fail={
              <>
                A <code>&lt;reference-chip&gt;</code> element appears in the
                DOM. If the model wraps its reply in a code block, the tags are
                shown as text and the test tells you nothing. Ask again.
              </>
            }
          />
        </div>
      </Panel>
    </>
  );
}
