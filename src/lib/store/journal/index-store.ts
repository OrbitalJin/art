import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createJournalIndexStorage } from "./index-adapter";
import type { PageMeta, Workspace } from "./types";

export interface JournalIndexState {
  pages: PageMeta[];
  activeId: string | null;
  currentWorkspace: Workspace;
  hydrated: boolean;
  migrated: boolean;

  setActive: (id: string) => void;
  addPage: (meta: PageMeta) => void;
  removePage: (id: string) => void;
  updatePage: (id: string, patch: Partial<PageMeta>) => void;
  getPage: (id: string) => PageMeta | undefined;
  setWorkspace: (workspace: Workspace) => void;
  updateTitle: (id: string, title: string) => void;
  togglePinned: (id: string) => void;
  toggleArchived: (id: string) => void;
  changeWorkspace: (id: string, workspace: Workspace) => void;
}

const mapPage = (
  pages: PageMeta[],
  id: string,
  updater: (page: PageMeta) => PageMeta,
): PageMeta[] => pages.map((page) => (page.id === id ? updater(page) : page));

export const useJournalIndex = create<JournalIndexState>()(
  persist(
    (set, get) => ({
      pages: [],
      activeId: null,
      currentWorkspace: "personal",
      hydrated: false,
      migrated: false,

      setActive: (id) => {
        const page = get().pages.find((entry) => entry.id === id);
        if (!page) return;
        set((state) => ({
          activeId: id,
          currentWorkspace: page.workspace,
          pages: mapPage(state.pages, id, (entry) => ({
            ...entry,
            lastViewedAt: Date.now(),
          })),
        }));
      },

      addPage: (meta) =>
        set((state) => ({
          pages: [meta, ...state.pages],
          activeId: meta.id,
          currentWorkspace: meta.workspace,
        })),

      removePage: (id) =>
        set((state) => {
          const pages = state.pages.filter((page) => page.id !== id);
          return {
            pages,
            activeId:
              state.activeId === id ? (pages[0]?.id ?? null) : state.activeId,
          };
        }),

      updatePage: (id, patch) =>
        set((state) => ({
          pages: mapPage(state.pages, id, (page) => ({ ...page, ...patch })),
        })),

      getPage: (id) => get().pages.find((page) => page.id === id),

      setWorkspace: (workspace) => set({ currentWorkspace: workspace }),

      updateTitle: (id, title) =>
        set((state) => ({
          pages: mapPage(state.pages, id, (page) => ({
            ...page,
            title,
            updatedAt: Date.now(),
          })),
        })),

      togglePinned: (id) =>
        set((state) => ({
          pages: mapPage(state.pages, id, (page) => ({
            ...page,
            pinned: !page.pinned,
          })),
        })),

      toggleArchived: (id) =>
        set((state) => ({
          pages: mapPage(state.pages, id, (page) => ({
            ...page,
            archived: !page.archived,
          })),
        })),

      changeWorkspace: (id, workspace) =>
        set((state) => ({
          currentWorkspace:
            state.activeId === id ? workspace : state.currentWorkspace,
          pages: mapPage(state.pages, id, (page) => ({
            ...page,
            workspace,
            updatedAt: Date.now(),
          })),
        })),
    }),
    {
      name: "journal-index",
      version: 1,
      storage:
        createJournalIndexStorage<
          Pick<
            JournalIndexState,
            "pages" | "activeId" | "currentWorkspace" | "migrated"
          >
        >(),
      skipHydration: true,
      partialize: (state) => ({
        pages: state.pages,
        activeId: state.activeId,
        currentWorkspace: state.currentWorkspace,
        migrated: state.migrated,
      }),
    },
  ),
);
