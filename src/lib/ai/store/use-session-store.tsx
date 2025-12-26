import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand";

import type { Message, Session, SessionState } from "@/lib/ai/store/types";
import { DefaultModel, type Model } from "@/lib/ai/common/types";
import { sessionStorage } from "@/lib/ai/store/adapter";

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeId: null,

      ensureDefaultSession: () => {
        const state = get();
        if (state.sessions.length === 0) {
          const newSession: Session = {
            id: crypto.randomUUID(),
            title: "New Session",
            messages: [],
            preferredModel: DefaultModel,
          };
          return {
            sessions: [newSession],
            activeId: newSession.id,
          };
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
        const newSession: Session = {
          id: crypto.randomUUID(),
          title: title || "New Session",
          messages: [],
          preferredModel: DefaultModel,
        };

        set((state) => ({
          sessions: [newSession, ...state.sessions],
          activeId: newSession.id,
        }));
      },

      deleteSession: (id: string) => {
        set((state: SessionState) => {
          const newSessions = state.sessions.filter((s) => s.id !== id);

          if (newSessions.length === 0) {
            const defaultSession: Session = {
              id: crypto.randomUUID(),
              title: "New Session",
              messages: [],
              preferredModel: DefaultModel,
            };
            return { sessions: [defaultSession], activeId: defaultSession.id };
          }

          let newActiveId = state.activeId;
          if (state.activeId === id) {
            newActiveId = newSessions.length > 0 ? newSessions[0].id : null;
          }
          return { sessions: newSessions, activeId: newActiveId };
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
