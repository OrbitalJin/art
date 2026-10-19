import { useDraftStore } from "@/lib/store/use-draft-store";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { useStreamStore } from "@/lib/store/use-stream-store";
import { sessionDataStore } from "./data-store";
import { useSessionIndex } from "./index-store";
import { createMeta } from "./meta";
import type { Message, SessionMeta, SessionType } from "./types";

export const appendMessage = async (
  sessionId: string,
  message: Message,
): Promise<void> => {
  await sessionDataStore.getState().ensure(sessionId);
  sessionDataStore.getState().addMessage(sessionId, message);
  useSessionIndex.getState().touch(sessionId, Date.now());
};

export const revertMessage = async (
  sessionId: string,
  messageId: string,
): Promise<boolean> => {
  await sessionDataStore.getState().ensure(sessionId);
  const ok = sessionDataStore.getState().revert(sessionId, messageId);
  if (ok) useSessionIndex.getState().touch(sessionId, Date.now());
  return ok;
};

export const createSession = (type: SessionType, title?: string): string => {
  const meta = createMeta({ type, title });
  useSessionIndex.getState().addMeta(meta);
  return meta.id;
};

export const deleteSession = (id: string): void => {
  useStreamStore.getState().abort(id);
  useDraftStore.getState().clear(id);
  useSessionIndex.getState().removeMeta(id);
  sessionDataStore.getState().remove(id);
};

export const purgeSessions = (): void => {
  useStreamStore.getState().clearAll();
  useDraftStore.getState().clearAll();

  const index = useSessionIndex.getState();
  const active = index.sessions.find((s) => s.id === index.activeId);
  for (const meta of index.sessions) {
    sessionDataStore.getState().remove(meta.id);
  }

  const meta = createMeta({ type: active?.type ?? "chat" });
  useSessionIndex.setState({ sessions: [meta], activeId: meta.id });
};

export const branchFromSession = async (
  sessionId: string,
  messageId: string,
  keepMessage: boolean,
): Promise<boolean> => {
  const source = useSessionIndex.getState().getMeta(sessionId);
  if (!source) return false;

  await sessionDataStore.getState().ensure(sessionId);
  const data = sessionDataStore.getState().cache[sessionId];
  if (!data) return false;

  const index = data.messages.findIndex((m) => m.id === messageId);
  if (index < 0) return false;

  const meta: SessionMeta = {
    ...source,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    branchOf: sessionId,
  };

  useSessionIndex.getState().addMeta(meta);
  sessionDataStore
    .getState()
    .setMessages(meta.id, data.messages.slice(0, index + (keepMessage ? 1 : 0)));
  return true;
};

export const branchSession = async (id: string): Promise<boolean> => {
  const source = useSessionIndex.getState().getMeta(id);
  if (!source) return false;

  await sessionDataStore.getState().ensure(id);
  const data = sessionDataStore.getState().cache[id] ?? { messages: [] };

  const meta: SessionMeta = {
    ...source,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    branchOf: id,
  };

  useSessionIndex.getState().addMeta(meta);
  sessionDataStore.getState().setMessages(meta.id, data.messages);
  return true;
};

/**
 * Boots the session index and message cache.
 */
export const hydrateSessions = async (): Promise<void> => {
  await useSettingsStore.persist.rehydrate();
  await useSessionIndex.persist.rehydrate();

  if (useSessionIndex.getState().sessions.length === 0) {
    const meta = createMeta({});
    useSessionIndex.getState().replaceAll([meta], meta.id);
  }

  const state = useSessionIndex.getState();
  const activeId =
    state.activeId && state.sessions.some((s) => s.id === state.activeId)
      ? state.activeId
      : (state.sessions[0]?.id ?? null);

  useSessionIndex.setState({ activeId, hydrated: true });
  if (activeId) await sessionDataStore.getState().ensure(activeId);
};
