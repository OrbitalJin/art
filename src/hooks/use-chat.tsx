import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import type { Message } from "@/lib/llm/common/memory/types";
import type { MessageIDs } from "@/lib/llm/common/types";
import { useLLM } from "@/contexts/llm-context";
import { toast } from "sonner";
import { useSessions } from "@/contexts/sessions-context";

export interface ChatError {
  message: string;
  error: string;
}

export const useChat = () => {
  const [optimisticUser, setOptimisticUser] = useState<Message | null>(null);
  const [draftAssistant, setDraftAssistant] = useState<Message | null>(null);
  const [abortCtrler, setAbortCtrler] = useState<AbortController | null>(null);
  const [isSending, setIsSending] = useState(false);
  const { active: session } = useSessions();
  const { llm, model, setModel } = useLLM();

  const baseMessages: readonly Message[] = useSyncExternalStore(
    (callback) => (session ? session.memory.subscribe(callback) : () => {}),
    () => (session ? session.memory.getSnapshot() : []),
    () => [],
  );

  const usage = useSyncExternalStore(
    (callback) => (session ? session.memory.subscribe(callback) : () => {}),
    () => (session ? llm?.usage(session) : 0),
  );

  const sendMessage = async (text: string) => {
    if (!session) throw new Error("No session selected");
    if (!llm) throw new Error("LLM not initialized");

    abortCtrler?.abort();

    const controller = new AbortController();
    setAbortCtrler(controller);

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
      console.error("Unexpected error in stream:", err);
    } finally {
      setAbortCtrler(null);
      setOptimisticUser(null);
      setIsSending(false);
    }
  };

  const abortStream = useCallback(() => {
    abortCtrler?.abort();
    toast.info("Stream Aborted");
  }, [abortCtrler]);

  // Project memory optimistically
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
    abortStream,
    usage: usage as string,
  };
};
