import { useActiveSession } from "@/contexts/active-session-context";
import { useSessionStore } from "@/lib/ai/store/use-session-store";

export const useStreamingState = () => {
  const activeId = useSessionStore((state) => state.activeId);
  const { isSending, streamingSessionId } = useActiveSession();

  return {
    isSessionStreaming: (sessionId: string) =>
      isSending && streamingSessionId === sessionId,
    isCurrentSessionStreaming: isSending && streamingSessionId === activeId,
    isAnySessionStreaming: streamingSessionId !== null,
    streamingSessionId,
  };
};
