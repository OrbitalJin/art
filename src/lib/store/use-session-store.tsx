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
  addTrait: (id: string, trait: TraitId) => void;
  removeTrait: (id: string, trait: TraitId) => void;
  clearTraits: (id: string) => void;
  addJournalRef: (id: string, pageId: string) => void;
  removeJournalRef: (id: string, pageId: string) => void;
  clearJournalRefs: (id: string) => void;
  toggleArchived: (id: string) => void;
  togglePinned: (id: string) => void;
  importFn: (s: Session) => void;
  setActive: (id: string) => void;
  deleteFn: (id: string) => void;
  create: (title?: string) => void;
  getFn: (id: string) => Session | undefined;
  addMessage: (sessionId: string, message: Message) => void;
  updateTitle: (sessionId: string, newTitle: string) => void;
  setModel: (sessionId: string, modelId: ModelId) => void;
}
export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeId: null,

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
            toast.success("No sessions left. Created a new one.");
            return { sessions: [defaultSession], activeId: defaultSession.id };
          }

          let newActiveId = state.activeId;
          if (state.activeId === id) {
            newActiveId = newSessions[0].id;
            toast.success("Active session deleted, switched to most recent.");
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
      version: 1,
      storage: createJSONStorage(() => sessionStorage),
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          if (persistedState && Array.isArray(persistedState.sessions)) {
            persistedState.sessions = persistedState.sessions.map(
              (session: any) => ({
                ...session,
                modelId:
                  session.modelId in MODELS
                    ? session.modelId
                    : DEFAULT_MODEL.id,
                mode: session.mode in MODES ? session.mode : DEFAULT_MODE,
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

        // If no sessions exist after migration/hydration, create the initial one
        if (state.sessions.length === 0) {
          const newSession = createNewSession();
          state.sessions = [newSession];
          state.activeId = newSession.id;
        }
        // If sessions exist but no activeId is set, set to first session
        else if (
          !state.activeId ||
          !state.sessions.find((s) => s.id === state.activeId)
        ) {
          state.activeId = state.sessions[0].id;
        }
      },
    },
  ),
);
