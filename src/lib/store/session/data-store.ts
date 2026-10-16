import { useEffect } from "react";
import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";
import {
  clearSessionData,
  readSessionData,
  writeSessionData,
} from "./adapter";
import { useSessionIndex } from "./index-store";
import type { Message, SessionData } from "./types";

interface LegacyAttachment {
  base64?: unknown;
}

/**
 * Pre-attachment sessions stored image bytes inline as base64. Strip those
 * attachments (the new renderer only understands remote URLs) so the session
 * file shrinks; the caller flags the session `legacyMedia` to warn the user.
 */
const pruneLegacyMedia = (
  data: SessionData,
): { data: SessionData; pruned: boolean } => {
  let pruned = false;

  const messages = data.messages.map((message) => {
    const hasLegacy = message.attachments?.some(
      (attachment) => (attachment as LegacyAttachment).base64 !== undefined,
    );
    if (!hasLegacy) return message;
    pruned = true;
    return { ...message, attachments: undefined };
  });

  return { data: pruned ? { messages } : data, pruned };
};

export interface SessionDataState {
  cache: Record<string, SessionData | undefined>;
  ensure: (id: string) => Promise<void>;
  addMessage: (id: string, message: Message) => void;
  updateMessage: (
    id: string,
    messageId: string,
    patch: Partial<Message>,
  ) => void;
  revert: (id: string, messageId: string) => boolean;
  setMessages: (id: string, messages: Message[]) => void;
  remove: (id: string) => void;
}

export const sessionDataStore = createStore<SessionDataState>()((set, get) => ({
  cache: {},

  ensure: async (id) => {
    if (get().cache[id] !== undefined) return;
    const raw = await readSessionData(id);
    const { data, pruned } = pruneLegacyMedia(raw ?? { messages: [] });
    set((state) => ({
      cache: { ...state.cache, [id]: data },
    }));
    if (pruned) {
      await writeSessionData(id, data);
      useSessionIndex.getState().updateMeta(id, { legacyMedia: true });
    }
  },

  addMessage: (id, message) => {
    const data = get().cache[id] ?? { messages: [] };
    const next = { messages: [...data.messages, message] };
    set((state) => ({ cache: { ...state.cache, [id]: next } }));
    void writeSessionData(id, next);
  },

  updateMessage: (id, messageId, patch) => {
    const data = get().cache[id];
    if (!data) return;
    const next = {
      messages: data.messages.map((message) =>
        message.id === messageId ? { ...message, ...patch } : message,
      ),
    };
    set((state) => ({ cache: { ...state.cache, [id]: next } }));
    void writeSessionData(id, next);
  },

  revert: (id, messageId) => {
    const data = get().cache[id];
    if (!data) return false;
    const index = data.messages.findIndex((m) => m.id === messageId);
    if (index < 0) return false;
    const next = { messages: data.messages.slice(0, index) };
    set((state) => ({ cache: { ...state.cache, [id]: next } }));
    void writeSessionData(id, next);
    return true;
  },

  setMessages: (id, messages) => {
    const next = { messages };
    set((state) => ({ cache: { ...state.cache, [id]: next } }));
    void writeSessionData(id, next);
  },

  remove: (id) => {
    set((state) => {
      if (!(id in state.cache)) return state;
      const cache = { ...state.cache };
      delete cache[id];
      return { cache };
    });
    void clearSessionData(id);
  },
}));

export const useSession = (id: string | null): SessionData | undefined => {
  const data = useStore(sessionDataStore, (state) =>
    id ? state.cache[id] : undefined,
  );
  useEffect(() => {
    if (id) void sessionDataStore.getState().ensure(id);
  }, [id]);
  return data;
};
