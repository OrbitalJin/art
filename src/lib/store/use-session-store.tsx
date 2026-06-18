import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand";

import { MODELS, type ModelId } from "@/lib/ai/models";
import type { ContentBlock, Message, Session } from "@/lib/store/session/types";
import { sessionStorage } from "@/lib/store/session/adapter";
import { DEFAULT_MODE, type ModeId } from "../ai/prompts/modes";
import type { TraitId } from "../ai/prompts/traits";
import { useSettingsStore } from "./use-settings-store";

const createNewSession = (
  title?: string,
  defaultModelId?: ModelId,
): Session => {
  const date = Date.now();
  return {
    id: crypto.randomUUID(),
    title: title ?? "New Session",
    traits: [],
    messages: [],
    mode: DEFAULT_MODE,
    modelId:
      defaultModelId ??
      MODELS.find((m) => m.id === useSettingsStore.getState().defaultModel)
        ?.id ??
      MODELS[0].id,
    createdAt: date,
    updatedAt: date,
  };
};

export interface SessionState {
  sessions: Session[];
  activeId: string | null;
  titleGeneratingIds: string[];

  setMode: (id: string, mode: ModeId) => void;
  branch: (id: string) => boolean;
  toggleArchived: (id: string) => void;
  togglePinned: (id: string) => boolean;

  addTrait: (id: string, trait: TraitId) => void;
  removeTrait: (id: string, trait: TraitId) => void;
  clearTraits: (id: string) => void;

  setActive: (id: string) => void;
  importFn: (s: Session) => boolean;
  deleteFn: (id: string) => void;
  create: (title?: string) => void;
  getFn: (id: string) => Session | undefined;
  branchFrom: (
    sessionId: string,
    messageId: string,
    keepMessage: boolean,
  ) => boolean;
  addMessage: (sessionId: string, message: Message) => void;
  updateMessageBlocks: (
    sessionId: string,
    messageId: string,
    updater: (blocks: ContentBlock[]) => ContentBlock[],
  ) => boolean;
  revertMessage: (sessionId: string, messageId: string) => boolean;
  updateTitle: (sessionId: string, newTitle: string) => boolean;
  setTitleGenerated: (sessionId: string, value: boolean) => void;
  startTitleGeneration: (sessionId: string) => void;
  endTitleGeneration: (sessionId: string) => void;
  setModel: (sessionId: string, modelId: ModelId) => void;
  purge: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeId: null,
      titleGeneratingIds: [],

      revertMessage: (sessionId: string, messageId: string): boolean => {
        let success = false;
        set((state: SessionState) => ({
          sessions: state.sessions.map((session) => {
            if (session.id === sessionId) {
              const index = session.messages.findIndex(
                (m) => m.id === messageId,
              );
              if (index >= 0) {
                success = true;
                return {
                  ...session,
                  messages: [...session.messages.slice(0, index)],
                  updatedAt: Date.now(),
                };
              }
            }
            return session;
          }),
        }));
        return success;
      },

      purge: () => {
        const newSession = createNewSession();
        set({
          sessions: [newSession],
          activeId: newSession.id,
        });
      },

      toggleArchived: (id: string) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === id
              ? { ...session, archived: !session.archived }
              : session,
          ),
        }));
      },

      setMode: (id: string, modeId: ModeId) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === id
              ? {
                  ...session,
                  mode: modeId,
                }
              : session,
          ),
        }));
      },

      branch: (id: string): boolean => {
        const state = get();
        const session = state.sessions.find((s) => s.id === id);
        if (!session) {
          return false;
        }

        const branch = {
          ...session,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          branchOf: session.id,
        };

        set({
          activeId: branch.id,
          sessions: [...state.sessions, branch],
        });
        return true;
      },

      branchFrom: (
        sessionId: string,
        messageId: string,
        keepMessage: boolean,
      ): boolean => {
        const state = get();
        const session = state.sessions.find((s) => s.id === sessionId);
        if (!session) {
          return false;
        }

        const index = session.messages.findIndex((m) => m.id === messageId);

        const branch = {
          ...session,
          messages: session.messages.slice(0, index + (keepMessage ? 1 : 0)),
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          branchOf: session.id,
        };

        set({
          activeId: branch.id,
          sessions: [...state.sessions, branch],
        });
        return true;
      },

      addTrait: (id: string, trait: TraitId) => {
        set((state: SessionState) => ({
          sessions: state.sessions.map((session) =>
            session.id === id
              ? { ...session, traits: [...session.traits, trait] }
              : session,
          ),
        }));
      },

      removeTrait: (id: string, trait: TraitId) => {
        set((state: SessionState) => ({
          sessions: state.sessions.map((session) =>
            session.id === id
              ? {
                  ...session,
                  traits: session.traits.filter((t) => t != trait),
                }
              : session,
          ),
        }));
      },

      clearTraits: (id: string) => {
        set((state: SessionState) => ({
          sessions: state.sessions.map((session) =>
            session.id === id ? { ...session, traits: [] } : session,
          ),
        }));
      },

      togglePinned: (id: string): boolean => {
        const state = get();
        const session = state.sessions.find((s) => s.id === id);
        if (!session) return false;
        session.pinned = !session.pinned;
        set({ sessions: [...state.sessions] });
        return true;
      },

      importFn: (orphan: Session): boolean => {
        const state = get();
        const duplicate = state.sessions.find((s) => s.id === orphan.id);
        if (duplicate) {
          orphan.id = crypto.randomUUID();
        }
        set({
          sessions: [...state.sessions, orphan],
        });
        return !!duplicate;
      },

      getFn: (id: string) => {
        return get().sessions.find((s) => s.id === id);
      },

      setModel: (sessionId: string, modelId: ModelId) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? { ...s, modelId: modelId } : s,
          ),
        })),

      create: (title?: string) => {
        const newSession = createNewSession(title);

        set((state) => ({
          sessions: [newSession, ...state.sessions],
          activeId: newSession.id,
        }));
      },

      deleteFn: (id: string) => {
        set((state: SessionState) => {
          const newSessions = state.sessions.filter((s) => s.id !== id);

          if (newSessions.length === 0) {
            const defaultSession = createNewSession();
            return { sessions: [defaultSession], activeId: defaultSession.id };
          }

          const newActiveId =
            state.activeId === id ? newSessions[0].id : state.activeId;

          return {
            sessions: newSessions,
            activeId: newActiveId,
          };
        });
      },

      setActive: (id: string) => {
        set((state: SessionState) => {
          const found = state.sessions.find((s) => s.id === id);
          if (!found) return state;
          return { activeId: id };
        });
      },

      updateTitle: (id: string, newTitle: string): boolean => {
        let success = false;
        set((state: SessionState) => ({
          sessions: state.sessions.map((session) => {
            if (session.id === id) {
              success = true;
              return {
                ...session,
                title: newTitle,
                updatedAt: Date.now(),
              };
            }
            return session;
          }),
        }));
        return success;
      },

      setTitleGenerated: (id: string, value: boolean) => {
        set((state: SessionState) => ({
          sessions: state.sessions.map((session) =>
            session.id === id ? { ...session, titleGenerated: value } : session,
          ),
        }));
      },

      startTitleGeneration: (id: string) => {
        set((state) => ({
          titleGeneratingIds: [...state.titleGeneratingIds, id],
        }));
      },

      endTitleGeneration: (id: string) => {
        set((state) => ({
          titleGeneratingIds: state.titleGeneratingIds.filter((i) => i !== id),
        }));
      },

      addMessage: (id: string, message: Message) => {
        set((state: SessionState) => ({
          sessions: state.sessions.map((session) => {
            if (session.id === id) {
              return {
                ...session,
                messages: [...session.messages, message],
                updatedAt: Date.now(),
              };
            }
            return session;
          }),
        }));
      },

      updateMessageBlocks: (id, messageId, updater) => {
        let success = false;
        set((state) => ({
          sessions: state.sessions.map((session) => {
            if (session.id !== id) return session;
            return {
              ...session,
              messages: session.messages.map((msg) => {
                if (msg.id !== messageId) return msg;
                if (!Array.isArray(msg.content)) return msg;
                success = true;
                return {
                  ...msg,
                  content: updater(msg.content),
                };
              }),
              updatedAt: Date.now(),
            };
          }),
        }));
        return success;
      },
    }),
    {
      name: "session-storage",
      version: 6,
      storage: createJSONStorage(() => sessionStorage),
      migrate: (persistedState: unknown, version: number) => {
        if (version < 6) {
          const state = persistedState as {
            sessions?: Array<{ messages?: Array<Message & { role: string }> }>;
          };
          if (state && Array.isArray(state.sessions)) {
            state.sessions = state.sessions.map((session) => ({
              ...session,
              readOnly: true,
              messages: (session.messages ?? []).map((msg) => ({
                ...msg,
                role:
                  // @ts-expect-error migration schema mismatch
                  msg.role === "model" || msg.role === "error"
                    ? "assistant"
                    : msg.role,
                tokenUsage: msg.tokenUsage ?? { input: 0, output: 0 },
              })),
            }));
          }
        }
        return persistedState as SessionState;
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (state.sessions.length === 0) {
          const newSession = createNewSession();
          state.sessions = [newSession];
          state.activeId = newSession.id;
        } else if (
          !state.activeId ||
          !state.sessions.find((s) => s.id === state.activeId)
        ) {
          state.activeId = state.sessions[0].id;
        }
      },
    },
  ),
);
