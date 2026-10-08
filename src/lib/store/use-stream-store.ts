import { create } from "zustand";
import type { MessageStatus } from "@/lib/store/session/types";
import {
  initialAccumulator,
  type StreamAccumulator,
} from "@/lib/ai/stream/stream-accumulator";

export const STREAMING_MESSAGE_ID = "streaming-response";

export interface SessionStream {
  snapshot: StreamAccumulator;
  status: MessageStatus;
}

interface StreamState {
  streams: Record<string, SessionStream>;
  begin: (sessionId: string) => AbortController;
  setSnapshot: (sessionId: string, snapshot: StreamAccumulator) => void;
  end: (sessionId: string) => void;
  abort: (sessionId?: string) => void;
  clearAll: () => void;
}

const controllers = new Map<string, AbortController>();

export const useStreamStore = create<StreamState>()((set) => ({
  streams: {},

  begin: (sessionId) => {
    const controller = new AbortController();
    controllers.set(sessionId, controller);
    set((state) => ({
      streams: {
        ...state.streams,
        [sessionId]: { snapshot: initialAccumulator, status: "streaming" },
      },
    }));
    return controller;
  },

  setSnapshot: (sessionId, snapshot) => {
    set((state) => {
      if (!(sessionId in state.streams)) return state;
      return {
        streams: {
          ...state.streams,
          [sessionId]: { snapshot, status: snapshot.status },
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