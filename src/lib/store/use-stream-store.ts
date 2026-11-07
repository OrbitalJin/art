import { create } from "zustand";
import type { MessageStatus } from "@/lib/store/session/types";
import {
  initialAccumulator,
  type StreamAccumulator,
} from "@/lib/ai/stream/stream-accumulator";

export interface SessionStream {
  snapshot: StreamAccumulator;
  status: MessageStatus;
  /**
   * The id the live stream is rendered under. It is generated up front and
   * reused for the persisted message so the list item keeps the same React key
   * across stream end — otherwise the item unmounts and remounts, briefly
   * shrinking the content and yanking a scrolled-up reader to the bottom.
   */
  messageId: string;
}

interface StreamState {
  streams: Record<string, SessionStream>;
  begin: (sessionId: string, messageId: string) => AbortController;
  setSnapshot: (sessionId: string, snapshot: StreamAccumulator) => void;
  end: (sessionId: string) => void;
  abort: (sessionId?: string) => void;
  clearAll: () => void;
}

const controllers = new Map<string, AbortController>();

export const useStreamStore = create<StreamState>()((set) => ({
  streams: {},

  begin: (sessionId, messageId) => {
    const controller = new AbortController();
    controllers.set(sessionId, controller);
    set((state) => ({
      streams: {
        ...state.streams,
        [sessionId]: {
          snapshot: initialAccumulator,
          status: "streaming",
          messageId,
        },
      },
    }));
    return controller;
  },

  setSnapshot: (sessionId, snapshot) => {
    set((state) => {
      const existing = state.streams[sessionId];
      if (!existing) return state;
      return {
        streams: {
          ...state.streams,
          [sessionId]: { ...existing, snapshot, status: snapshot.status },
        },
      };
    });
  },

  end: (sessionId) => {
    controllers.delete(sessionId);
    set((state) => {
      if (!(sessionId in state.streams)) return state;
      const streams = { ...state.streams };
      delete streams[sessionId];
      return { streams };
    });
  },

  abort: (sessionId) => {
    if (sessionId) controllers.get(sessionId)?.abort();
  },

  clearAll: () => {
    for (const controller of controllers.values()) controller.abort();
    controllers.clear();
    set({ streams: {} });
  },
}));

export const useIsStreaming = (sessionId?: string | null): boolean =>
  useStreamStore((state) => !!sessionId && !!state.streams[sessionId]);

export const useStreamingIds = (): string[] =>
  useStreamStore((state) => Object.keys(state.streams));