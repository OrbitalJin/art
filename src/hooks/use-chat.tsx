import { useCallback, useEffect, useMemo, useState } from "react";
import type { Message } from "@/lib/llm/common/memory/types";
import { useLLM } from "@/contexts/llm-context";
import type { MessageIDs } from "@/lib/llm/common/types";

export interface ChatError {
  message: string;
  error: string;
}

export const useChat = () => {
  const { llm, model, setModel } = useLLM();

  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [baseMessages, setBaseMessages] = useState<readonly Message[]>([]);
  const [optimisticUser, setOptimisticUser] = useState<Message | null>(null);
  const [draftAssistant, setDraftAssistant] = useState<Message | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [usage, setUsage] = useState<string>("");

  const sendMessage = async (text: string) => {
    if (!llm) throw new Error("LLM not initialized");

    abortController?.abort();

    const controller = new AbortController();
    setAbortController(controller);

    const userId = crypto.randomUUID();
    const assistantId = crypto.randomUUID();
    const ids: MessageIDs = {
      userId: userId,
      assistantId: assistantId,
    };

    setOptimisticUser({
      id: userId,
      role: "user",
      content: text,
    });

    setDraftAssistant({
      id: assistantId,
      role: "assistant",
      content: "",
      model,
    });

    setIsSending(true);

    try {
      const stream = llm.stream(text, ids, controller.signal);
      for await (const chunk of stream) {
        if (chunk.token) {
          setDraftAssistant((prev) =>
            prev ? { ...prev, content: prev.content + chunk.token } : prev,
          );
        }
        if (chunk.isFinal) {
          setDraftAssistant(null);
        }
      }
    } catch (error: unknown) {
      if (error?.name === "AbortError") {
        console.log("Stream Aborted");
      }
    } finally {
      setAbortController(null);
      setOptimisticUser(null);
      setIsSending(false);
    }
  };

  const abortStream = useCallback(() => {
    abortController?.abort();
    setDraftAssistant(null);
  }, [abortController]);

  // Fetch usage
  useEffect(() => {
    if (!llm) return;
    llm.usage().then(setUsage);
  }, [llm]);

  // Subscribe to memory
  useEffect(() => {
    if (!llm) return;
    return llm.memory.subscribe(setBaseMessages);
  }, [llm]);

  // project memory opmistically
  const messages = useMemo(() => {
    const result: Message[] = [...baseMessages];

    if (optimisticUser) result.push(optimisticUser);
    if (draftAssistant) result.push(draftAssistant);

    return result;
  }, [baseMessages, optimisticUser, draftAssistant]);

  return {
    messages,
    isSending,
    sendMessage,
    model,
    setModel,
    usage,
    abortStream,
  };
};
