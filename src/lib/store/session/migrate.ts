import { DEFAULT_PERSONA, type PersonaId } from "@/lib/ai/prompts/personas";
import { CONNECTED_SERVICES, GmailTools } from "@/lib/services/catalog";
import type { FsRoot } from "@/lib/fs";
import type {
  AccessMode,
  Message,
  MessagePart,
  Session,
  SessionType,
  ToolCallBlock,
} from "./types";
import { defaultGroups } from "./meta";

export const SESSION_STORAGE_VERSION = 33;

export interface LegacySessionState {
  sessions: Session[];
  activeId: string | null;
}

/**
 * Brings persisted sessions up to the current shape. This is the single place
 * that owns data-shape evolution: any change to the stored session structure
 * (including the tool registry) must bump `SESSION_STORAGE_VERSION` and add a
 * block here instead of normalizing at runtime.
 */
export const migrateState = (
  persistedState: unknown,
  version: number,
): LegacySessionState => {
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
    activeId?: string | null;
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

  if (version < 33) {
    if (Array.isArray(state.sessions)) {
      state.sessions = state.sessions.map((session) => {
        const groups = { ...(session.groups ?? {}) };
        if (groups.todo !== undefined && groups.plan === undefined) {
          groups.plan = groups.todo;
        }
        delete groups.todo;
        return { ...session, groups };
      });
    }
  }

  return state as LegacySessionState;
};
