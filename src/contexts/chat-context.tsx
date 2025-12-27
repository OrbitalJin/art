import React, { createContext, useContext } from "react";
import { useCallback, useMemo, useState } from "react";
import { AIError, DefaultModel, type Model } from "@/lib/ai/common/types";
import { useAI } from "@/contexts/ai-context";
import { toast } from "sonner";
import type { Message, MessageStatus, Session } from "@/lib/ai/store/types";
import { useSessionStore } from "@/lib/ai/store/use-session-store";
import { prompts } from "@/lib/ai/common/prompts";

interface Incoming {
  content: string;
  status: MessageStatus;
}

interface ChatContextValues {
  messages: Message[];
  isSending: boolean;
  prompt: string;
  model: Model;
  session: Session | undefined;

  setPrompt: (value: string) => void;
  sendMessage: (text: string) => Promise<void>;
  abortStream: () => void;
  setSessionModel: (id: string, model: Model) => void;
}

const ChatContext = createContext<ChatContextValues | null>(null);

export const ChatContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const activeId = useSessionStore((state) => state.activeId);
  const sessions = useSessionStore((state) => state.sessions);
  const addMessage = useSessionStore((state) => state.addMessage);
  const setSessionModel = useSessionStore((state) => state.setSessionModel);
  const activeSession = sessions.find((s) => s.id === activeId);

  const [prompt, setPrompt] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [incoming, setIncoming] = useState<Incoming>({
    content: "",
    status: "thinking",
  });

  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  const { ai } = useAI();

  const sendMessage = async (text: string) => {
    if (!activeId || !ai) return;

    addMessage(activeId, {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      status: "complete",
    });

    setPrompt("");
    setIsSending(true);

    const controller = new AbortController();
    setAbortController(controller);

    let fullResponse = "";
    let status: MessageStatus = "streaming";
    let error: AIError | undefined;

    try {
      const stream = ai.stream(
        text,
        activeSession?.messages || [],
        prompts.system,
        activeSession?.preferredModel,
        controller.signal,
      );

      for await (const chunk of stream) {
        if (chunk.error) {
          if (chunk.error.type === "aborted") {
            status = "aborted";
            setIncoming((prev) => ({
              content: prev.content,
              status: "aborted",
            }));
          } else if (chunk.error.type === "network") {
            status = "error";
            setIncoming((prev) => ({
              content: prev.content,
              status: "error",
            }));
            toast.error("Network error occurred");
          }
          error = chunk.error;
        }

        if (chunk.token) {
          fullResponse += chunk.token;
          setIncoming((prev) => ({
            content: prev.content + chunk.token,
            status: "streaming",
          }));
        }

        if (chunk.isFinal) {
          if (status === "streaming") {
            status = "complete";
          }
          setIncoming((prev) => ({
            content: prev.content,
            status: status,
          }));
        }
      }
    } finally {
      if (status !== "error" || fullResponse.trim()) {
        addMessage(activeId, {
          id: crypto.randomUUID(),
          role: "model",
          content: fullResponse.trim(),
          status: status,
          model: activeSession?.preferredModel,
          error: error,
        });
      } else {
        addMessage(activeId, {
          id: crypto.randomUUID(),
          role: "model",
          content: "",
          status: status,
          model: activeSession?.preferredModel,
          error: error,
        });
      }

      setIsSending(false);
      setAbortController(null);
      setIncoming({ content: "", status: "complete" });
    }
  };

  const abortStream = useCallback(() => {
    if (abortController) {
      setIncoming((prev) => ({
        content: prev.content,
        status: "aborted",
      }));
      abortController.abort();
      toast.info("Stream Aborted");
    }
  }, [abortController]);

  const messages = useMemo(() => {
    const base = activeSession?.messages || [];

    if (isSending) {
      return [
        ...base,
        {
          id: "streaming-response",
          role: "model",
          content: incoming.content,
          status: incoming.status,
          model: activeSession?.preferredModel,
        } as Message,
      ];
    }
    return base;
  }, [
    activeSession?.messages,
    activeSession?.preferredModel,
    isSending,
    incoming,
  ]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        isSending,
        prompt,
        setPrompt,
        sendMessage,
        abortStream,
        setSessionModel,
        model: activeSession?.preferredModel || DefaultModel,
        session: activeSession,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatContextProvider");
  }
  return context;
};
