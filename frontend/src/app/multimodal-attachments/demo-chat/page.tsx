"use client";

import { CopilotChat, useConfigureSuggestions } from "@copilotkit/react-core/v2";
import { useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

const AGENT_ID = "multimodal";

type UploadError = { reason: string; message: string };

/**
 * The page's quick start plus its two configuration blocks on one surface:
 * `enabled`, an `accept` filter, a `maxSize`, and both error callbacks.
 *
 * `onUploadFailed` and `onError` are published pointed at a `toast` and a
 * `console.error`. They write to the visible log here instead, so a rejected
 * file is something you can see on the page.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/multimodal-attachments" subtitle={`agent: ${AGENT_ID}`}>
      <Demo />
    </DemoFrame>
  );
}

function Demo() {
  const [errors, setErrors] = useState<UploadError[]>([]);

  useConfigureSuggestions({
    suggestions: [
      {
        title: "Describe an image",
        message: "What is in the image I attached?",
      },
      {
        title: "Summarise a PDF",
        message: "Summarise the attached document in three bullets.",
      },
    ],
    available: "always",
  });

  return (
    <div className="flex h-full flex-col">
      {errors.length > 0 && (
        <ul className="shrink-0 space-y-1 border-b border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {errors.map((e, i) => (
            <li key={i}>
              <span className="font-mono">{e.reason}</span> — {e.message}
            </li>
          ))}
        </ul>
      )}
      <div className="min-h-0 flex-1">
        <CopilotChat
          agentId={AGENT_ID}
          className="h-full"
          attachments={{
            enabled: true,
            // Omit `accept` to allow all file types (default: "*/*").
            // Restrict with a MIME filter if needed:
            accept: "image/*,audio/*,video/*,application/pdf",
            maxSize: 10 * 1024 * 1024, // 10MB limit (default: 20MB)
            onUploadFailed: (error) => {
              // error.reason: "file-too-large" | "invalid-type" | "upload-failed"
              setErrors((prev) => [
                { reason: error.reason, message: error.message },
                ...prev,
              ]);
            },
          }}
          onError={(event) => {
            // `onError` on CopilotChat is overloaded: the component spreads
            // div props, so this also matches React's DOM error handler and
            // the parameter arrives as a union. The doc's snippet reads
            // `event.code` straight off it, which does not compile. Narrowing
            // on `code` picks the CopilotKit variant. See README §9.
            if (!("code" in event)) return;
            setErrors((prev) => [
              { reason: event.code, message: event.error.message },
              ...prev,
            ]);
          }}
        />
      </div>
    </div>
  );
}
