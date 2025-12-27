import { useChat } from "@/contexts/chat-context";
import { useSessionStore } from "@/lib/ai/store/use-session-store";
import { useCallback, useMemo } from "react";

export const useStreamingState = () => {
  const activeId = useSessionStore((state) => state.activeId);
  const { isSending, streamingSession } = useChat();

  const isSessionStreaming = useCallback(
    (sessionId: string) => {
      return isSending && streamingSession === sessionId;
    },
    [isSending, streamingSession],
  );

  const isCurrentSessionStreaming = useMemo(() => {
    return isSessionStreaming(activeId ?? "");
  }, [isSessionStreaming, activeId]);

  const getStreamingSession = useCallback(() => {
    return streamingSession;
  }, [streamingSession]);

  return {
    isSessionStreaming,
    getStreamingSession,
    isAnySessionStreaming: () => streamingSession !== null,
    isCurrentSessionStreaming,
  };
};
