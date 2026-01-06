import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { useAI } from "@/contexts/ai-context";
import { useSessionStore } from "@/lib/store/use-session-store";
import { prompts } from "@/lib/ai/common/prompts";
import type { Message, MessageStatus } from "@/lib/store/session/types";
import { useAIStream } from "@/hooks/use-ai-stream";
import {
  createModelMessage,
  createUserMessage,
} from "@/lib/ai/common/message-factories";
import type { Model } from "@/lib/ai/common/types";

interface StreamState {
  content: string;
  status: MessageStatus;
}

interface ActiveSessionContextValues {
  streamingSessionId: string | null;
  messages: Message[];
  isSending: boolean;
  prompt: string;

  setPrompt: (value: string) => void;
  sendMessage: (text: string) => Promise<void>;
  abortStream: () => void;
}

const ActiveSessionContext = createContext<ActiveSessionContextValues | null>(
  null,
);

export const ActiveSessionProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { ai } = useAI();
  const { activeId, sessions, addMessage } = useSessionStore();

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeId),
    [sessions, activeId],
  );

  const [prompt, setPrompt] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [streamingSessionId, setStreamingSessionId] = useState<string | null>(
    null,
  );
  const [streamState, setStreamState] = useState<StreamState>({
    content: "",
    status: "thinking",
  });

  const { stream, abort } = useAIStream({
    ai,
    onToken: (token) => {
      setStreamState((prev) => ({
        content: prev.content + token,
        status: "streaming",
      }));
    },
    onComplete: ({ content, status, errorType }) => {
      if (!activeId) return;

      if (status === "error") {
        toast.error("Network error occurred");
      }

      addMessage(
        activeId,
        createModelMessage(
          content,
          status,
          activeSession?.preferredModel,
          errorType,
        ),
      );

      setIsSending(false);
      setStreamingSessionId(null);
    },
  });

  const abortStream = useCallback(() => {
    setStreamState((prev) => ({ ...prev, status: "aborted" }));
    abort();
    toast.info("Stream aborted");
  }, [abort]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!activeId || !ai) return;

      if (isSending) {
        toast.info("Please wait for the current stream to finish");
        return;
      }

      if (!text.trim()) {
        toast.warning("Please enter a message");
        return;
      }

      addMessage(activeId, createUserMessage(text));

      setPrompt("");
      setIsSending(true);
      setStreamingSessionId(activeId);
      setStreamState({ content: "", status: "thinking" });

      await stream({
        text,
        messages: activeSession?.messages || [],
        systemPrompt: prompts.system,
        model: activeSession?.preferredModel as Model,
      });
    },
    [activeId, ai, isSending, activeSession, addMessage, stream],
  );

  const messages = useMemo(() => {
    const base = activeSession?.messages || [];

    if (isSending && streamingSessionId === activeId) {
      return [
        ...base,
        {
          id: "streaming-response",
          role: "model",
          content: streamState.content,
          status: streamState.status,
          model: activeSession?.preferredModel,
        } as Message,
      ];
    }

    return base;
  }, [
    activeSession?.messages,
    activeSession?.preferredModel,
    isSending,
    streamState,
    activeId,
    streamingSessionId,
  ]);

  const value = useMemo(
    () => ({
      messages,
      isSending,
      prompt,
      streamingSessionId,
      setPrompt,
      sendMessage,
      abortStream,
    }),
    [messages, isSending, prompt, streamingSessionId, sendMessage, abortStream],
  );

  return (
    <ActiveSessionContext.Provider value={value}>
      {children}
    </ActiveSessionContext.Provider>
  );
};

export const useActiveSession = () => {
  const context = useContext(ActiveSessionContext);
  if (!context) {
    throw new Error(
      "useActiveSession must be used within ActiveSessionProvider",
    );
  }
  return context;
};
