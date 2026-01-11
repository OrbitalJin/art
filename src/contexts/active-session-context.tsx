import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { useLLM } from "@/contexts/llm-context";
import { useSessionStore } from "@/lib/store/use-session-store";
import { prompts } from "@/lib/llm/common/prompts";
import type { Message, MessageStatus } from "@/lib/store/session/types";
import { useLLMStream } from "@/hooks/use-llm-stream";
import {
  createModelMessage,
  createUserMessage,
} from "@/lib/llm/common/message-factories";
import type { Model } from "@/lib/llm/common/types";
import { useConversationContext } from "@/hooks/use-conversation-context";

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
  const { llm } = useLLM();
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

  const context = useConversationContext(activeSession);

  const { stream, abort } = useLLMStream({
    llm,
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
      if (!activeId || !llm) return;

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
        context: context,
        model: activeSession?.preferredModel as Model,
      });
    },
    [activeId, llm, isSending, activeSession, addMessage, stream, context],
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
