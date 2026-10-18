import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ModelId } from "@/lib/ai/models";
import type { PersonaId } from "@/lib/ai/prompts/personas";
import type { FsRoot } from "@/lib/fs";
import { createSessionIndexStorage } from "./adapter";
import { createMeta, defaultGroups } from "./meta";
import type {
  AccessMode,
  SessionGroups,
  SessionMeta,
} from "./types";

export interface SessionIndexState {
  sessions: SessionMeta[];
  activeId: string | null;
  hydrated: boolean;
  titleGeneratingIds: string[];

  setActive: (id: string) => void;
  addMeta: (meta: SessionMeta) => void;
  removeMeta: (id: string) => void;
  replaceAll: (sessions: SessionMeta[], activeId: string | null) => void;
  touch: (id: string, updatedAt: number) => void;
  setHydrated: (value: boolean) => void;

  updateMeta: (id: string, patch: Partial<SessionMeta>) => void;
  getMeta: (id: string) => SessionMeta | undefined;
  setGroup: (id: string, key: string, value: boolean) => void;
  setGroups: (id: string, groups: SessionGroups) => void;
  disableAllGroups: (id: string) => void;
  addFolder: (id: string, root: FsRoot) => void;
  removeFolder: (id: string, folderId: string) => void;
  setPersona: (id: string, persona: PersonaId) => void;
  setModel: (id: string, modelId: ModelId) => void;
  setAccessMode: (id: string, mode: AccessMode) => void;
  togglePinned: (id: string) => void;
  toggleArchived: (id: string) => void;
  updateTitle: (id: string, title: string) => void;
  setTitleGenerated: (id: string, value: boolean) => void;
  startTitleGeneration: (id: string) => void;
  endTitleGeneration: (id: string) => void;
}

const mapMeta = (
  sessions: SessionMeta[],
  id: string,
  updater: (meta: SessionMeta) => SessionMeta,
): SessionMeta[] =>
  sessions.map((meta) => (meta.id === id ? updater(meta) : meta));

export const useSessionIndex = create<SessionIndexState>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeId: null,
      hydrated: false,
      titleGeneratingIds: [],

      setActive: (id) => {
        if (!get().sessions.some((s) => s.id === id)) return;
        set({ activeId: id });
      },

      addMeta: (meta) =>
        set((state) => ({
          sessions: [meta, ...state.sessions],
          activeId: meta.id,
        })),

      removeMeta: (id) =>
        set((state) => {
          const remaining = state.sessions.filter((s) => s.id !== id);
          if (remaining.length === 0) {
            const meta = createMeta({});
            return { sessions: [meta], activeId: meta.id };
          }
          return {
            sessions: remaining,
            activeId: state.activeId === id ? remaining[0].id : state.activeId,
          };
        }),

      replaceAll: (sessions, activeId) => set({ sessions, activeId }),

      touch: (id, updatedAt) =>
        set((state) => ({
          sessions: mapMeta(state.sessions, id, (meta) => ({
            ...meta,
            updatedAt,
          })),
        })),

      setHydrated: (value) => set({ hydrated: value }),

      updateMeta: (id, patch) =>
        set((state) => ({
          sessions: mapMeta(state.sessions, id, (meta) => ({
            ...meta,
            ...patch,
          })),
        })),

      getMeta: (id) => get().sessions.find((s) => s.id === id),

      setGroup: (id, key, value) =>
        set((state) => ({
          sessions: mapMeta(state.sessions, id, (meta) => ({
            ...meta,
            groups: { ...meta.groups, [key]: value },
          })),
        })),

      setGroups: (id, groups) =>
        set((state) => ({
          sessions: mapMeta(state.sessions, id, (meta) => ({
            ...meta,
            groups: { ...meta.groups, ...groups },
          })),
        })),

      disableAllGroups: (id) =>
        set((state) => ({
          sessions: mapMeta(state.sessions, id, (meta) => ({
            ...meta,
            groups: Object.fromEntries(
              Object.keys(defaultGroups(meta.type)).map((key) => [key, false]),
            ),
          })),
        })),

      addFolder: (id, root) =>
        set((state) => ({
          sessions: mapMeta(state.sessions, id, (meta) => ({
            ...meta,
            folders: [...(meta.folders ?? []), root],
            groups: { ...meta.groups, files: true },
          })),
        })),

      removeFolder: (id, folderId) =>
        set((state) => ({
          sessions: mapMeta(state.sessions, id, (meta) => {
            const folders = (meta.folders ?? []).filter(
              (root) => root.id !== folderId,
            );
            return {
              ...meta,
              folders,
              groups: { ...meta.groups, files: folders.length > 0 },
            };
          }),
        })),

      setPersona: (id, persona) =>
        set((state) => ({
          sessions: mapMeta(state.sessions, id, (meta) => ({
            ...meta,
            persona,
          })),
        })),

      setModel: (id, modelId) =>
        set((state) => ({
          sessions: mapMeta(state.sessions, id, (meta) => ({
            ...meta,
            modelId,
          })),
        })),

      setAccessMode: (id, mode) =>
        set((state) => ({
          sessions: mapMeta(state.sessions, id, (meta) => ({
            ...meta,
            accessMode: mode,
          })),
        })),

      togglePinned: (id) =>
        set((state) => ({
          sessions: mapMeta(state.sessions, id, (meta) => ({
            ...meta,
            pinned: !meta.pinned,
          })),
        })),

      toggleArchived: (id) =>
        set((state) => ({
          sessions: mapMeta(state.sessions, id, (meta) => ({
            ...meta,
            archived: !meta.archived,
          })),
        })),

      updateTitle: (id, title) =>
        set((state) => ({
          sessions: mapMeta(state.sessions, id, (meta) => ({
            ...meta,
            title,
            updatedAt: Date.now(),
          })),
        })),

      setTitleGenerated: (id, value) =>
        set((state) => ({
          sessions: mapMeta(state.sessions, id, (meta) => ({
            ...meta,
            titleGenerated: value,
          })),
        })),

      startTitleGeneration: (id) =>
        set((state) => ({
          titleGeneratingIds: [...state.titleGeneratingIds, id],
        })),

      endTitleGeneration: (id) =>
        set((state) => ({
          titleGeneratingIds: state.titleGeneratingIds.filter((i) => i !== id),
        })),
    }),
    {
      name: "session-index",
      version: 1,
      storage:
        createSessionIndexStorage<
          Pick<SessionIndexState, "sessions" | "activeId">
        >(),
      skipHydration: true,
      partialize: (state) => ({
        sessions: state.sessions,
        activeId: state.activeId,
      }),
    },
  ),
);
