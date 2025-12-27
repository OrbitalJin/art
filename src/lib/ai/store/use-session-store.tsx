import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand";

import { DefaultModel, type Model } from "@/lib/ai/common/types";
import type { Message, Session } from "@/lib/ai/store/types";
import { sessionStorage } from "@/lib/ai/store/adapter";
import { toast } from "sonner";

const createNewSession = (title?: string): Session => {
  const date = Date.now();
  return {
    id: crypto.randomUUID(),
    title: title ?? "New Session",
    messages: [],
    preferredModel: DefaultModel,
    createdAt: date,
    updatedAt: date,
  };
};

export interface SessionState {
  sessions: Session[];
  activeId: string | null;

  ensureDefaultSession: () => void;
  getSession: (id: string) => Session | undefined;
  deleteSession: (id: string) => void;
  createSession: (title?: string) => void;
  setActive: (id: string) => void;
  addMessage: (sessionId: string, message: Message) => void;
  updateTitle: (sessionId: string, newTitle: string) => void;
  setSessionModel: (sessionId: string, model: Model) => void;
}
export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeId: null,

      ensureDefaultSession: () => {
        const state = get();
        if (state.sessions.length === 0) {
          const newSession = createNewSession();
          set({
            sessions: [newSession],
            activeId: newSession.id,
          });
        } else {
          if (!state.activeId) {
            set({
              activeId: state.sessions[0].id,
            });
          }
        }
      },

      getSession: (id: string) => {
        return get().sessions.find((s) => s.id === id);
      },

      setSessionModel: (sessionId: string, model: Model) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? { ...s, preferredModel: model } : s,
          ),
        })),

      createSession: (title?: string) => {
        const newSession = createNewSession(title);

        set((state) => ({
          sessions: [newSession, ...state.sessions],
          activeId: newSession.id,
        }));
      },

      deleteSession: (id: string) => {
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

          console.log(
            "deleteSession: activeId changed from",
            state.activeId,
            "to",
            newActiveId,
          );
          return {
            sessions: newSessions, // Remove sorting - let UI handle it
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
            session.id === id ? { ...session, title: newTitle } : session,
          ),
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
    }),
    {
      name: "session-storage",
      storage: createJSONStorage(() => sessionStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Error rehydrating store:", error);
          return;
        }

        if (state) {
          state.ensureDefaultSession();
        }
      },
    },
  ),
);
