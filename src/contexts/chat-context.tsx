import React, { createContext, useContext } from "react";
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import type { Model } from "@/lib/llm/common/types";
import type { Message } from "@/lib/llm/common/memory/types";
import type { MessageIDs } from "@/lib/llm/common/types";
import { useLLM } from "@/contexts/llm-context";
import { toast } from "sonner";
import { useSessions } from "@/contexts/sessions-context";

interface ChatContextValues {
  messages: readonly Message[];
  isSending: boolean;
  prompt: string;
  model: Model;
  usage: string;

  sendMessage: (text: string) => void;
  setPrompt: (value: string) => void;
  setModel: (model: Model) => void;
  abortStream: () => void;
  send: () => void;
}

const ChatContext = createContext<ChatContextValues | null>(null);

export const ChatContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [optimisticUser, setOptimisticUser] = useState<Message | null>(null);
  const [draftAssistant, setDraftAssistant] = useState<Message | null>(null);
  const [abortCtrler, setAbortCtrler] = useState<AbortController | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [prompt, setPrompt] = useState("");

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

  const send = async () => {
    const text = prompt.trim();
    if (!text) return;
    await sendMessage(text);
  };

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
    setPrompt("");

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

  return (
    <ChatContext.Provider
      value={{
        prompt,
        messages,
        isSending,
        model,
        setPrompt,
        abortStream,
        send,
        sendMessage,
        setModel,
        usage: usage as string,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextValues => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be called within a ChatContextProvider");
  }
  return context;
};
