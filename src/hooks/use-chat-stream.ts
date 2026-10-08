import { useCallback, useMemo } from "react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import { useSessionStore } from "@/lib/store/use-session-store";
import {
  STREAMING_MESSAGE_ID,
  useStreamStore,
} from "@/lib/store/use-stream-store";

export interface ChatStreamValues {
  streamingSessionId: string | null;
  streamingMessageId: string | null;
  isSending: boolean;
  toolCalls: ToolCallBlock[];
  abortStream: (sessionId?: string) => void;
}

const EMPTY_TOOL_CALLS: ToolCallBlock[] = [];

export const useChatStream = (sessionId?: string): ChatStreamValues => {
  const activeId = useSessionStore((state) => state.activeId);
  const id = sessionId ?? activeId ?? null;

  const streamingId = useStreamStore((state) =>
    id && state.streams[id] ? id : null,
  );

  const toolCalls =
    useStreamStore((state) =>
      id ? state.streams[id]?.snapshot.toolCalls : undefined,
    ) ?? EMPTY_TOOL_CALLS;

  const abortStream = useCallback(
    (target?: string) => {
      const session = target ?? id;
      if (session) useStreamStore.getState().abort(session);
    },
    [id],
  );

  return useMemo(
    () => ({
      streamingSessionId: streamingId,
      streamingMessageId: streamingId ? STREAMING_MESSAGE_ID : null,
      isSending: !!streamingId,
      toolCalls,
      abortStream,
    }),
    [streamingId, toolCalls, abortStream],
  );
};