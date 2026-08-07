"use client";


import { DemoFrame } from "@/components/demo-frame";

const AGENT_ID = "programmatic-control";

/** Called by every published snippet, defined by none. */
const createMessageId = () => crypto.randomUUID();

type LogLine = { at: string; event: string };

/**

PARTIAL CODE IS PROVIDED AND IMPORTS ARE MISSING - MARK AS ERROR

**/
export default function Page() {
  return (
    <DemoFrame parentPath="/programmatic-control" subtitle={`agent: ${AGENT_ID}`}>
      <Demo />
    </DemoFrame>
  );
}

function Demo() {
  const { agent } = useAgent({ agentId: AGENT_ID });
  const { copilotkit } = useCopilotKit();

  const {
    attachments,
    fileInputRef,
    containerRef,
    handleFileUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    dragOver,
    removeAttachment,
    consumeAttachments,
  } = useAttachmentsConfig();

  const [input, setInput] = useState("");
  const messages = agent.messages;
  const { listRef, bottomRef, stickRef } = useAutoScroll(
    messages,
    agent.isRunning,
  );

  // Send pipeline: consume any ready attachments at submit time, build
  // the multimodal `content` array if needed, then dispatch the run.
  const sendText = useCallback(
    (text: string): boolean => {
      const trimmed = text.trim();
      if (agent.isRunning) return false;
      // Consume queued uploads first so they get sent even if the user
      // didn't type any text alongside them.
      const ready = consumeAttachments();
      if (!trimmed && ready.length === 0) return false;

      stickRef.current = true;

      const content = buildContent(trimmed, ready);
      agent.addMessage({
        id: createMessageId(),
        role: "user",
        content,
      });
      void copilotkit
        .runAgent({ agent })
        .catch((err) =>
          console.error("[headless-complete] runAgent failed", err),
        );
      return true;
    },
    [agent, copilotkit, consumeAttachments],
  );

  const handleSend = useCallback(() => {
    if (sendText(input)) {
      setInput("");
    }
  }, [input, sendText]);

  const handleSuggestion = useCallback(
    (text: string) => {
      sendText(text);
    },
    [sendText],
  );

  const handleReset = useCallback(() => {
    if (agent.isRunning) {
      try {
        agent.abortRun();
      } catch {
        // no-op: some transports don't support abort
      }
    }
    agent.setMessages([]);
    setInput("");
    stickRef.current = true;
  }, [agent]);

  return (<></>)
}
