import { useCallback, useEffect, useMemo, useState } from "react";
import type { Message } from "@/lib/llm/common/memory/types";
import type { MessageIDs } from "@/lib/llm/common/types";
import { useLLM } from "@/contexts/llm-context";
import { toast } from "sonner";
import type { Session } from "@/lib/llm/common/session/type";

export interface ChatError {
  message: string;
  error: string;
}

export const useChat = (session: Session) => {
  const { llm, model, setModel } = useLLM();
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [baseMessages, setBaseMessages] = useState<readonly Message[]>([]);
  const [optimisticUser, setOptimisticUser] = useState<Message | null>(null);
  const [draftAssistant, setDraftAssistant] = useState<Message | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [usage, setUsage] = useState<string>("");

  const sendMessage = async (text: string) => {
    if (!session.memory) throw new Error("Memory not initialized");
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
      status: "thinking",
      content: "",
      model: model,
    });

    setIsSending(true);

    try {
      const stream = llm.stream(text, ids, session, controller.signal);
      for await (const chunk of stream) {
        if (chunk.token) {
          setDraftAssistant((prev) => {
            if (!prev) return prev;

            return {
              ...prev,
              content: prev.content + chunk.token,
              status: prev.status === "thinking" ? "streaming" : prev.status,
            };
          });
        }

        if (chunk.error) {
          setDraftAssistant((prev) =>
            prev ? { ...prev, status: "error", error: chunk.error } : prev,
          );
        }

        if (chunk.isFinal) {
          setDraftAssistant(null);
        }
      }
    } catch (err) {
      // Handle any unexpected errors that might escape the stream
      console.error("Unexpected error in stream:", err);
    } finally {
      setAbortController(null);
      setOptimisticUser(null);
      setIsSending(false);
    }
  };

  const abortStream = useCallback(() => {
    abortController?.abort();
    setDraftAssistant(null);
    toast.info("Stream Aborted");
  }, [abortController]);

  // Fetch usage
  useEffect(() => {
    if (!llm) return;
    llm.usage(session).then(setUsage);
  }, [llm, session]);

  // Subscribe to memory
  useEffect(() => {
    if (!session) return;
    return session.memory.subscribe(setBaseMessages);
  }, [session]);

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
