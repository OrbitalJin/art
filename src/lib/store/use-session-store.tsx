import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand";

import { MODELS, type ModelId } from "@/lib/ai/models";
import type {
  AccessMode,
  Message,
  MessagePart,
  SessionType,
  Session,
  SessionGroups,
  ToolCallBlock,
} from "@/lib/store/session/types";
import {
  CONNECTED_SERVICES,
  GmailTools,
  GoogleSheetsTools,
  SearchTools,
} from "@/lib/services/catalog";
import { sessionStorage } from "@/lib/store/session/adapter";
import type { FsRoot } from "@/lib/fs";
import { DEFAULT_PERSONA, type PersonaId } from "../ai/prompts/personas";
import { useSettingsStore } from "./use-settings-store";
import { useStreamStore } from "./use-stream-store";
import { useDraftStore } from "./use-draft-store";

interface CreateSessionOpts {
  title?: string;
  defaultModelId?: ModelId;
  type?: SessionType;
}

/**
 * The default group state for a new session. This is the single source of
 * truth for defaults; the tools builder only reads the stored map.
 */
export const defaultGroups = (type: SessionType): SessionGroups => ({
  tasks: false,
  todo: type === "agent",
  askUser: type === "agent",
  youtube: false,
  files: false,
  [SearchTools.web]: true,
  [SearchTools.fetch]: true,
  [SearchTools.news]: false,
  [SearchTools.flights]: false,
  [SearchTools.hotels]: false,
  [SearchTools.maps]: false,
  [GmailTools.fetchEmails]: false,
  [GmailTools.listMessages]: false,
  [GmailTools.fetchMessageById]: false,
  [GmailTools.listLabels]: false,
  [GoogleSheetsTools.search]: false,
  [GoogleSheetsTools.getSpreadsheetInfo]: false,
  [GoogleSheetsTools.getSheetNames]: false,
  [GoogleSheetsTools.valuesGet]: false,
  [GoogleSheetsTools.batchGet]: false,
  [GoogleSheetsTools.lookupRow]: false,
});

const createNewSession = ({
  title,
  defaultModelId,
  type,
}: CreateSessionOpts): Session => {
  const date = Date.now();
  const sessionType = type ?? "chat";
  const settings = useSettingsStore.getState();
  const modelId =
    defaultModelId ??
    MODELS.find(
      (m) =>
        m.id ===
        (sessionType === "agent"
          ? settings.defaultAgentModel
          : settings.defaultModel),
    )?.id ??
    MODELS[0].id;

  return {
    id: crypto.randomUUID(),
    type: sessionType,
    title: title ?? "New Session",
    accessMode: settings.defaultAccessMode,
    groups: defaultGroups(sessionType),
    messages: [],
    persona: settings.defaultPersona,
    modelId,
    createdAt: date,
    updatedAt: date,
  };
};

export const SESSION_STORAGE_VERSION = 32;

/**
 * Brings persisted sessions up to the current shape. This is the single place
 * that owns data-shape evolution: any change to the stored session structure
 * (including the tool registry) must bump `SESSION_STORAGE_VERSION` and add a
 * block here instead of normalizing at runtime.
 */
const migrateState = (
  persistedState: unknown,
  version: number,
): SessionState => {
  const state = persistedState as {
    sessions?: Array<{
      type?: SessionType;
      mode?: PersonaId;
      persona?: PersonaId;
      accessMode?: AccessMode;
      disableApproval?: boolean;
      knowledgeBase?: string;
      folders?: FsRoot[];
      capabilities?: Record<string, boolean>;
      toolkits?: Record<string, boolean>;
      groups?: Record<string, boolean>;
      messages?: Array<
        Message & {
          role: string;
          content?: string | Array<{ type: string } & Record<string, unknown>>;
          parts?: MessagePart[];
          toolCalls?: ToolCallBlock[];
        }
      >;
    }>;
  };

  if (version < 20) {
    if (Array.isArray(state.sessions)) {
      state.sessions = state.sessions.map((session) => ({
        ...session,
        type: session.type ?? "chat",
        persona: session.persona ?? session.mode ?? DEFAULT_PERSONA,
      }));
    }
  }

  if (version < 21) {
    if (Array.isArray(state.sessions)) {
      state.sessions = state.sessions.map((session) => ({
        ...session,
        capabilities: session.capabilities ?? {
          journal: false,
          tasks: false,
          askUser: false,
        },
      }));
    }
  }

  if (version < 22) {
    if (Array.isArray(state.sessions)) {
      state.sessions = state.sessions.map((session) => ({
        ...session,
        messages: (session.messages ?? []).map((message) => {
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
        }),
      }));
    }
  }

  if (version < 23) {
    if (Array.isArray(state.sessions)) {
      state.sessions = state.sessions.map((session) => ({
        ...session,
        capabilities: {
          journal: false,
          tasks: false,
          ...(session.capabilities ?? {}),
          askUser: false,
        },
      }));
    }
  }

  if (version < 24) {
    if (Array.isArray(state.sessions)) {
      state.sessions = state.sessions.map((session) => {
        const { disableApproval, ...rest } = session;
        return {
          ...rest,
          accessMode: disableApproval ? "autonomous" : "confirm",
        };
      });
    }
  }

  if (version < 25) {
    if (Array.isArray(state.sessions)) {
      state.sessions = state.sessions.map((session) => {
        const { knowledgeBase, ...rest } = session;
        const segments = (knowledgeBase ?? "").split(/[\\/]/).filter(Boolean);
        return {
          ...rest,
          folders: knowledgeBase
            ? [
                {
                  id: crypto.randomUUID(),
                  name: segments[segments.length - 1] ?? knowledgeBase,
                  path: knowledgeBase,
                },
              ]
            : [],
        };
      });
    }
  }

  if (version < 26) {
    if (Array.isArray(state.sessions)) {
      state.sessions = state.sessions.map((session) => {
        const type = session.type ?? "chat";
        return {
          ...session,
          capabilities: {
            ...(session.capabilities ?? {
              journal: false,
              tasks: false,
              askUser: false,
            }),
            connections: session.capabilities?.connections ?? type === "agent",
          },
        };
      });
    }
  }

  if (version < 27) {
    if (Array.isArray(state.sessions)) {
      state.sessions = state.sessions.map((session) => {
        const { toolPolicy, ...rest } = session as { toolPolicy?: unknown };
        void toolPolicy;
        return rest;
      });
    }
  }

  if (version < 28) {
    if (Array.isArray(state.sessions)) {
      state.sessions = state.sessions.map((session) => {
        const type = session.type ?? "chat";
        const { capabilities, ...rest } = session;
        if (session.toolkits) return rest;
        const connections = capabilities?.connections ?? type === "agent";
        return {
          ...rest,
          toolkits: {
            journal: capabilities?.journal ?? false,
            tasks: capabilities?.tasks ?? false,
            askUser: capabilities?.askUser ?? type === "agent",
            ...Object.fromEntries(
              CONNECTED_SERVICES.map((service) => [service.id, connections]),
            ),
          },
        };
      });
    }
  }

  if (version < 29) {
    if (Array.isArray(state.sessions)) {
      state.sessions = state.sessions.map((session) => {
        const type = session.type ?? "chat";
        const folders = session.folders ?? [];
        const stored = session.toolkits ?? {};
        const defaults = defaultGroups(type);
        const toolkits: Record<string, boolean> = {};
        for (const key of Object.keys(defaults)) {
          const value = stored[key];
          if (value !== undefined) {
            toolkits[key] = value;
          } else if (key === "files") {
            toolkits[key] = folders.length > 0;
          } else {
            toolkits[key] = defaults[key] ?? false;
          }
        }
        return {
          ...session,
          type,
          persona: session.persona ?? session.mode ?? DEFAULT_PERSONA,
          accessMode: session.accessMode ?? "confirm",
          folders,
          toolkits,
        };
      });
    }
  }

  if (version < 30) {
    if (Array.isArray(state.sessions)) {
      state.sessions = state.sessions.map((session) => {
        const { mode, ...rest } = session;
        return {
          ...rest,
          persona: session.persona ?? mode ?? DEFAULT_PERSONA,
        };
      });
    }
  }

  if (version < 31) {
    if (Array.isArray(state.sessions)) {
      state.sessions = state.sessions.map((session) => {
        const type = session.type ?? "chat";
        const defaults = defaultGroups(type);
        const toolkits: Record<string, boolean> = { ...(session.toolkits ?? {}) };
        for (const key of Object.keys(defaults)) {
          if (toolkits[key] === undefined) {
            toolkits[key] = defaults[key] ?? false;
          }
        }
        return { ...session, toolkits };
      });
    }
  }

  if (version < 32) {
    if (Array.isArray(state.sessions)) {
      state.sessions = state.sessions.map((session) => {
        const legacy = session.toolkits ?? {};
        const groups: Record<string, boolean> = {};
        for (const [key, value] of Object.entries(legacy)) {
          if (key === "gmail") continue;
          groups[key] = value;
        }
        if (legacy.gmail !== undefined) {
          for (const toolId of Object.values(GmailTools)) {
            groups[toolId] = legacy.gmail;
          }
        }
        const { toolkits: _toolkits, ...rest } = session;
        void _toolkits;
        return { ...rest, groups };
      });
    }
  }

  return state as SessionState;
};

export interface SessionState {
  sessions: Session[];
  activeId: string | null;
  hydrated: boolean;
  titleGeneratingIds: string[];

  setPersona: (id: string, persona: PersonaId) => void;
  branch: (id: string) => boolean;
  toggleArchived: (id: string) => void;
  togglePinned: (id: string) => boolean;

  setAccessMode: (id: string, mode: AccessMode) => void;
  addFolder: (id: string, root: FsRoot) => void;
  removeFolder: (id: string, folderId: string) => void;
  setGroup: (id: string, key: string, value: boolean) => void;
  setGroups: (id: string, groups: SessionGroups) => void;
  disableAllGroups: (id: string) => void;
  setActive: (id: string) => void;
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

      setAccessMode: (id: string, mode: AccessMode) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === id ? { ...session, accessMode: mode } : session,
          ),
        }));
      },

      addFolder: (id: string, root: FsRoot) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === id
              ? {
                  ...session,
                  folders: [...(session.folders ?? []), root],
                  groups: { ...session.groups, files: true },
                }
              : session,
          ),
        }));
      },

      removeFolder: (id: string, folderId: string) => {
        set((state) => ({
          sessions: state.sessions.map((session) => {
            if (session.id !== id) return session;
            const folders = (session.folders ?? []).filter(
              (root) => root.id !== folderId,
            );
            return {
              ...session,
              folders,
              groups: { ...session.groups, files: folders.length > 0 },
            };
          }),
        }));
      },

      setGroup: (id: string, key: string, value: boolean) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === id
              ? {
                  ...session,
                  groups: { ...session.groups, [key]: value },
                }
              : session,
          ),
        }));
      },

      setGroups: (id: string, groups: SessionGroups) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === id
              ? { ...session, groups: { ...session.groups, ...groups } }
              : session,
          ),
        }));
      },

      disableAllGroups: (id: string) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === id
              ? {
                  ...session,
                  groups: Object.fromEntries(
                    Object.keys(defaultGroups(session.type)).map((key) => [
                      key,
                      false,
                    ]),
                  ),
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
        useStreamStore.getState().clearAll();
        useDraftStore.getState().clearAll();
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

      setPersona: (id: string, personaId: PersonaId) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === id
              ? {
                  ...session,
                  persona: personaId,
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
        useStreamStore.getState().abort(id);
        useDraftStore.getState().clear(id);
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
      version: SESSION_STORAGE_VERSION,
      storage: createJSONStorage(() => sessionStorage),
      migrate: migrateState,
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Failed to rehydrate session storage", error);
          useSessionStore.setState({ hydrated: true });
          return;
        }
        if (!state) return;
        state.sessions = state.sessions ?? [];
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
