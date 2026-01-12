 import React, {
   createContext,
   useCallback,
   useContext,
   useMemo,
 } from "react";
 import { toast } from "sonner";
 import { useSessionStore } from "@/lib/store/use-session-store";
 import type { Message } from "@/lib/store/session/types";
 import { createUserMessage } from "@/lib/llm/common/message-factories";
 import { useSessionState } from "@/hooks/use-session-state";
 import { useLLMSession } from "@/hooks/use-llm-session";



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
  const { activeId, sessions, addMessage } = useSessionStore();
  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeId),
    [sessions, activeId],
  );

  const [state, dispatch] = useSessionState();

  const { send, abort } = useLLMSession({
    activeId,
    activeSession,
    onToken: (token: string) => dispatch({ type: "STREAM_TOKEN", payload: token }),
    onComplete: () => dispatch({ type: "COMPLETE_STREAM" }),
  });

  const sendMessage = useCallback(
    async (text: string) => {
      if (!activeId) return;

      if (state.isSending) {
        toast.info("Please wait for the current stream to finish");
        return;
      }

      if (!text.trim()) {
        toast.warning("Please enter a message");
        return;
      }

      addMessage(activeId, createUserMessage(text));
      dispatch({ type: "SET_PROMPT", payload: "" });
      dispatch({ type: "START_SENDING", payload: activeId });
      await send(text);
    },
    [activeId, addMessage, send, dispatch, state.isSending],
  );

  const abortStream = useCallback(() => {
    dispatch({ type: "ABORT_STREAM" });
    abort();
    toast.info("Stream aborted");
  }, [abort, dispatch]);

  const messages = useMemo(() => {
    const base = activeSession?.messages || [];
    if (state.isSending && state.streamingSessionId === activeId) {
      return [
        ...base,
        {
          id: "streaming-response",
          role: "model",
          content: state.streamState.content,
          status: state.streamState.status,
          model: activeSession?.preferredModel,
        } as Message,
      ];
    }
    return base;
  }, [activeSession, state, activeId]);

  const value = useMemo(
    () => ({
      messages,
      isSending: state.isSending,
      prompt: state.prompt,
      streamingSessionId: state.streamingSessionId,
      setPrompt: (value: string) => dispatch({ type: "SET_PROMPT", payload: value }),
      sendMessage,
      abortStream,
    }),
    [messages, state, sendMessage, abortStream, dispatch],
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
