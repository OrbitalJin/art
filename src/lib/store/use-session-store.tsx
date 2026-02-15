import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand";

import { DEFAULT_MODEL, MODELS, type ModelId } from "@/lib/llm/common/types";
import type { Message, Session } from "@/lib/store/session/types";
import { sessionStorage } from "@/lib/store/session/adapter";
import { toast } from "sonner";
import { DEFAULT_MODE, MODES, type ModeId } from "../llm/prompts/modes";
import type { TraitId } from "../llm/prompts/traits";

const createNewSession = (title?: string): Session => {
  const date = Date.now();
  return {
    id: crypto.randomUUID(),
    title: title ?? "New Session",
    traits: [],
    messages: [],
    journalRefs: [],
    webCtxUrls: [],
    mode: DEFAULT_MODE,
    modelId: DEFAULT_MODEL.id,
    createdAt: date,
    updatedAt: date,
  };
};

export interface SessionState {
  sessions: Session[];
  activeId: string | null;

  fork: (id: string) => void;
  setMode: (id: string, mode: ModeId) => void;
  toggleArchived: (id: string) => void;
  togglePinned: (id: string) => void;
  toggleSearchGrounding: (id: string) => void;

  addWebCtxUrl: (id: string, url: string) => void;
  removeWebCtxUrl: (id: string, url: string) => void;
  clearWebCtxUrls: (id: string) => void;

  addTrait: (id: string, trait: TraitId) => void;
  removeTrait: (id: string, trait: TraitId) => void;
  clearTraits: (id: string) => void;

  addJournalRef: (id: string, pageId: string) => void;
  removeJournalRef: (id: string, pageId: string) => void;
  clearJournalRefs: (id: string) => void;

  setActive: (id: string) => void;
  importFn: (s: Session) => void;
  deleteFn: (id: string) => void;
  create: (title?: string) => void;
  getFn: (id: string) => Session | undefined;
  addMessage: (sessionId: string, message: Message) => void;
  updateTitle: (sessionId: string, newTitle: string) => void;
  setModel: (sessionId: string, modelId: ModelId) => void;
  purge: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeId: null,

      addWebCtxUrl: (id: string, url: string) => {
        set((state: SessionState) => ({
          sessions: state.sessions.map((session) => {
            if (session.id === id) {
              const isDuplicate = (session.webCtxUrls || []).includes(url);
              if (isDuplicate) {
                toast.warning("Duplicate URL detected.");
              }
              return {
                ...session,
                webCtxUrls: isDuplicate
                  ? session.webCtxUrls || []
                  : [...(session.webCtxUrls || []), url],
              };
            }
            return session;
          }),
        }));
      },

      removeWebCtxUrl: (id: string, url: string) => {
        set((state: SessionState) => ({
          sessions: state.sessions.map((session) =>
            session.id === id
              ? {
                  ...session,
                  webCtxUrls: (session.webCtxUrls || []).filter(
                    (u) => u !== url,
                  ),
                }
              : session,
          ),
        }));
      },

      clearWebCtxUrls: (id: string) => {
        set((state: SessionState) => ({
          sessions: state.sessions.map((session) =>
            session.id === id ? { ...session, webCtxUrls: [] } : session,
          ),
        }));
      },

      purge: () => {
        set({ sessions: [] });
      },

      toggleSearchGrounding: (id: string) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === id
              ? {
                  ...session,
                  searchGrounding: !session.searchGrounding,
                }
              : session,
          ),
        }));
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

      fork: (id: string) => {
        const state = get();
        const session = state.sessions.find((s) => s.id === id);
        if (!session) {
          return toast.error("Failed to fork: Session not found");
        }
        const fork = {
          ...session,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          forkOf: session.id,
        };

        toast.info("Session forked successfully");
        set({
          activeId: fork.id,
          sessions: [...state.sessions, fork],
        });
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

      addJournalRef: (id: string, pageId: string) => {
        set((state: SessionState) => ({
          sessions: state.sessions.map((session) =>
            session.id === id
              ? { ...session, journalRefs: [...session.journalRefs, pageId] }
              : session,
          ),
        }));
      },

      removeJournalRef: (id: string, pageId: string) => {
        set((state: SessionState) => ({
          sessions: state.sessions.map((session) =>
            session.id === id
              ? {
                  ...session,
                  journalRefs: session.journalRefs.filter((n) => n !== pageId),
                }
              : session,
          ),
        }));
      },

      clearJournalRefs: (id: string) => {
        set((state: SessionState) => ({
          sessions: state.sessions.map((session) =>
            session.id === id ? { ...session, journalRefs: [] } : session,
          ),
        }));
      },

      togglePinned: (id: string) => {
        const state = get();
        const session = state.sessions.find((s) => s.id === id);
        if (!session) return toast.error("Session not found");
        session.pinned = !session.pinned;
        toast.success(
          `Session ${!session.pinned ? "unpinned" : "pinned"} successfully.`,
        );
        set({ sessions: [...state.sessions] });
      },

      importFn: (orphan: Session) => {
        const state = get();
        const duplicate = state.sessions.find((s) => s.id === orphan.id);
        if (duplicate) {
          orphan.id = crypto.randomUUID();
          toast.warning("Conflicting session id detected.");
        }
        set({
          sessions: [...state.sessions, orphan],
        });
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

          let newActiveId = state.activeId;
          if (state.activeId === id) {
            newActiveId = newSessions[0].id;
          } else {
            toast.success("Session deleted successfully.");
          }

          return {
            sessions: newSessions,
            activeId: newActiveId,
          };
        });
      },

      setActive: (id: string) => {
        set({ activeId: id });
      },

      updateTitle: (id: string, newTitle: string) => {
        set((state: SessionState) => ({
          sessions: state.sessions.map((session) =>
            session.id === id
              ? { ...session, title: newTitle, updatedAt: Date.now() }
              : session,
          ),
        }));
        toast.success("Session title updated successfully.");
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
    }),
    {
      name: "session-storage",
      version: 2,
      storage: createJSONStorage(() => sessionStorage),
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          if (persistedState && Array.isArray(persistedState.sessions)) {
            persistedState.sessions = persistedState.sessions.map(
              (session: any) => ({
                ...session,
                modelId:
                  session.modelId in MODELS
                    ? session.modelId
                    : DEFAULT_MODEL.id,
                mode: session.mode in MODES ? session.mode : DEFAULT_MODE,
                webCtxUrls: Array.isArray(session.webCtxUrls)
                  ? session.webCtxUrls
                  : [],
                journalRefs: Array.isArray(session.journalRefs)
                  ? session.journalRefs
                  : [],
                traits: Array.isArray(session.traits) ? session.traits : [],
              }),
            );
          }
        }
        return persistedState;
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
