import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand";

import { MODELS, type ModelId } from "@/lib/ai/models";
import type {
  Message,
  MessagePart,
  SessionType,
  Session,
  SessionCapabilities,
  ToolCallBlock,
} from "@/lib/store/session/types";
import { sessionStorage } from "@/lib/store/session/adapter";
import { DEFAULT_MODE, type ModeId } from "../ai/prompts/modes";
import { useSettingsStore } from "./use-settings-store";

interface CreateSessionOpts {
  title?: string;
  defaultModelId?: ModelId;
  type?: SessionType;
}

const createNewSession = ({
  title,
  defaultModelId,
  type,
}: CreateSessionOpts): Session => {
  const date = Date.now();
  return {
    id: crypto.randomUUID(),
    type: type ?? "chat",
    title: title ?? "New Session",
    capabilities: { journal: false, tasks: false },
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

type LegacyMessage = Message & {
  content?: string;
  parts?: MessagePart[];
  toolCalls?: ToolCallBlock[];
};

const normalizeMessage = (message: LegacyMessage): Message => {
  if (Array.isArray(message.parts)) return message;

  const parts: MessagePart[] = [];
  if (typeof message.content === "string" && message.content) {
    parts.push({ type: "text", text: message.content });
  }
  for (const call of message.toolCalls ?? []) {
    parts.push({ type: "tool-call", ...call });
  }

  const { content: _content, ...rest } = message;
  void _content;
  return { ...rest, parts };
};

const normalizeSession = (session: Session): Session => ({
  ...session,
  type: session.type ?? "chat",
  mode: session.mode ?? DEFAULT_MODE,
  capabilities: session.capabilities ?? { journal: false, tasks: false },
  messages: (session.messages ?? []).map((message) =>
    normalizeMessage(message as LegacyMessage),
  ),
});

export interface SessionState {
  sessions: Session[];
  activeId: string | null;
  hydrated: boolean;
  titleGeneratingIds: string[];

  setMode: (id: string, mode: ModeId) => void;
  branch: (id: string) => boolean;
  toggleArchived: (id: string) => void;
  togglePinned: (id: string) => boolean;

  setKnowledgeBase: (id: string, root?: string) => void;
  setCapability: (
    id: string,
    key: keyof SessionCapabilities,
    value: boolean,
  ) => void;
  disableAllCapabilities: (id: string) => void;
  setActive: (id: string) => void;
  importFn: (s: Session) => boolean;
  deleteFn: (id: string) => void;
  create: (type: SessionType, title?: string) => string;
  getFn: (id: string) => Session | undefined;
  branchFrom: (
    sessionId: string,
    messageId: string,
    keepMessage: boolean,
  ) => boolean;
  addMessage: (sessionId: string, message: Message) => void;
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
      hydrated: false,
      titleGeneratingIds: [],

      setKnowledgeBase: (id: string, root?: string) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === id ? { ...session, knowledgeBase: root } : session,
          ),
        }));
      },

      setCapability: (
        id: string,
        key: keyof SessionCapabilities,
        value: boolean,
      ) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === id
              ? {
                  ...session,
                  capabilities: {
                    ...session.capabilities,
                    [key]: value,
                  },
                }
              : session,
          ),
        }));
      },

      disableAllCapabilities: (id: string) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === id
              ? {
                  ...session,
                  capabilities: { journal: false, tasks: false },
                }
              : session,
          ),
        }));
      },

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
        const active = get().sessions.find((s) => s.id === get().activeId);
        const newSession = createNewSession({ type: active?.type ?? "chat" });
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
          sessions: [...state.sessions, normalizeSession(orphan)],
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

      create: (type: SessionType, title?: string) => {
        const newSession = createNewSession({ title, type });

        set((state) => ({
          sessions: [newSession, ...state.sessions],
          activeId: newSession.id,
        }));

        return newSession.id;
      },

      deleteFn: (id: string) => {
        set((state: SessionState) => {
          const deleted = state.sessions.find((s) => s.id === id);
          const newSessions = state.sessions.filter((s) => s.id !== id);

          if (newSessions.length === 0) {
            const defaultSession = createNewSession({
              title: deleted?.type === "chat" ? "New Chat" : "New Agent",
              type: deleted?.type ?? "chat",
            });
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
    }),
    {
      name: "session-storage",
      version: 22,
      storage: createJSONStorage(() => sessionStorage),
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as {
          sessions?: Array<{
            capabilities?: SessionCapabilities;
            messages?: Array<
              Message & {
                role: string;
                content?:
                  string | Array<{ type: string } & Record<string, unknown>>;
                parts?: MessagePart[];
                toolCalls?: ToolCallBlock[];
              }
            >;
          }>;
        };

        if (version < 20) {
          if (Array.isArray(state.sessions)) {
            state.sessions = state.sessions.map((session) => {
              const legacy = session as {
                type?: SessionType;
                mode?: ModeId;
              };
              return {
                ...session,
                type: legacy.type ?? "chat",
                mode: legacy.mode ?? DEFAULT_MODE,
              };
            });
          }
        }

        if (version < 21) {
          if (Array.isArray(state.sessions)) {
            state.sessions = state.sessions.map((session) => ({
              ...session,
              capabilities:
                session.capabilities ?? { journal: false, tasks: false },
            }));
          }
        }

        if (version < 22) {
          if (Array.isArray(state.sessions)) {
            state.sessions = state.sessions.map((session) => ({
              ...session,
              messages: (session.messages ?? []).map((message) =>
                normalizeMessage(message as LegacyMessage),
              ),
            }));
          }
        }

        return state as SessionState;
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Failed to rehydrate session storage", error);
          useSessionStore.setState({ hydrated: true });
          return;
        }
        if (!state) return;
        state.sessions = (state.sessions ?? []).map(normalizeSession);
        if (state.sessions.length === 0) {
          const newSession = createNewSession({});
          state.sessions = [newSession];
          state.activeId = newSession.id;
        } else if (
          !state.activeId ||
          !state.sessions.find((s) => s.id === state.activeId)
        ) {
          state.activeId = state.sessions[0].id;
        }
        state.hydrated = true;
      },
    },
  ),
);
