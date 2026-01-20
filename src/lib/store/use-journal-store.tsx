import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand";
import { toast } from "sonner";
import type { Page, Workspace } from "./journal/types";
import { journalStorage } from "./journal/adapter";
import mockContent from "@/assets/mock.md?raw";

const createNewPage = (workspace: Workspace, title?: string): Page => {
  const date = Date.now();
  return {
    id: crypto.randomUUID(),
    title: title ?? "Untitled Page",
    content: "",
    workspace: workspace,
    createdAt: date,
    updatedAt: date,
    lastViewedAt: date,
    tags: [],
  };
};

export interface State {
  pages: Page[];
  activeId: string | null;
  currentWorkspace: Workspace;

  toggleArchived: (id: string) => void;
  togglePinned: (id: string) => void;
  importFn: (orphan: Page) => void;
  setActive: (id: string) => void;
  deleteFn: (id: string) => void;
  create: (workspace?: Workspace, title?: string) => string;
  getFn: (id: string) => Page | undefined;
  save: (page: Page) => void;
  updateContent: (
    pageId: string,
    newContent: string,
    showToast: boolean,
  ) => void;
  updateTitle: (pageId: string, newTitle: string) => void;
  addTag: (pageId: string, tag: string) => void;
  removeTag: (pageId: string, tag: string) => void;
  updateTags: (pageId: string, tags: string[]) => void;
  getAllTags: () => string[];
  changeWorkspace: (id: string, workspace: Workspace) => void;
  getByTag: (tag: string) => Page[];
  updateViewedAt: (pageId: string) => void;
  setWorkspace: (workspace: Workspace) => void;
}

export const useJournalStore = create<State>()(
  persist(
    (set, get) => ({
      pages: [],
      activeId: null,
      currentWorkspace: "personal",

      toggleArchived: (id: string) => {
        set((state) => ({
          pages: state.pages.map((page) =>
            page.id === id ? { ...page, archived: !page.archived } : page,
          ),
        }));
      },

      setWorkspace: (workspace: Workspace) =>
        set({ currentWorkspace: workspace }),

      save(page: Page) {
        set((state) => ({
          pages: state.pages.map((s) => (s.id === page.id ? page : s)),
        }));
      },

      importFn(orphan: Page) {
        const state = get();
        const duplicate = state.pages.find((s) => s.id === orphan.id);
        if (duplicate) {
          orphan.id = crypto.randomUUID();
          toast.warning("Conflicting page id detected.");
        }
        set({
          pages: [...state.pages, orphan],
        });
      },

      getFn(id: string) {
        return get().pages.find((s) => s.id === id);
      },

      create(workspace?: Workspace, title?: string) {
        const state = get();
        const newPage = createNewPage(
          workspace || state.currentWorkspace,
          title,
        );
        set({
          pages: [...state.pages, newPage],
          activeId: newPage.id,
          currentWorkspace: workspace,
        });
        return newPage.id;
      },

      deleteFn(id: string) {
        set((state: State) => {
          const newPages = state.pages.filter((s) => s.id !== id);
          toast.success("Page deleted successfully.");

          return {
            pages: newPages,
            activeId: state.activeId === id ? null : state.activeId,
          };
        });
      },

      setActive(id: string) {
        const page = get().pages.find((e) => e.id === id);
        if (!page) return;

        set((state: State) => ({
          activeId: id,
          currentWorkspace: page.workspace,
          pages: state.pages.map((e) =>
            e.id === id ? { ...e, lastViewedAt: Date.now() } : e,
          ),
        }));
      },

      updateTitle(id: string, newTitle: string) {
        set((state: State) => ({
          pages: state.pages.map((page) =>
            page.id === id
              ? { ...page, title: newTitle, updatedAt: Date.now() }
              : page,
          ),
        }));
        toast.success("Page title updated successfully.");
      },

      changeWorkspace(id: string, workspace: Workspace) {
        set((state: State) => ({
          currentWorkspace:
            state.activeId === id ? workspace : state.currentWorkspace,
          pages: state.pages.map((page) =>
            page.id === id
              ? { ...page, workspace: workspace, updatedAt: Date.now() }
              : page,
          ),
        }));
      },

      updateContent(pageId: string, newContent: string, showToast = true) {
        set((state: State) => {
          const updated = state.pages.map((page) => {
            if (page.id === pageId) {
              const contentChanged = page.content !== newContent;
              return {
                ...page,
                content: newContent,
                updatedAt: contentChanged ? Date.now() : page.updatedAt,
              };
            }
            return page;
          });

          const page = state.pages.find((e) => e.id === pageId);
          if (page && page.content !== newContent && showToast) {
            toast.success("Page content updated successfully.");
          }

          return { pages: updated };
        });
      },

      addTag(pageId: string, tag: string) {
        set((state: State) => ({
          pages: state.pages.map((page) => {
            if (page.id === pageId) {
              const normalizedTag = tag.trim();
              if (!page.tags.includes(normalizedTag)) {
                return {
                  ...page,
                  tags: [...page.tags, normalizedTag],
                  updatedAt: Date.now(),
                };
              }
            }
            return page;
          }),
        }));
      },

      removeTag(pageId: string, tag: string) {
        set((state: State) => ({
          pages: state.pages.map((page) =>
            page.id === pageId
              ? {
                  ...page,
                  tags: page.tags.filter((t) => t !== tag.trim()),
                  updatedAt: Date.now(),
                }
              : page,
          ),
        }));
      },

      updateTags(pageId: string, tags: string[]) {
        set((state: State) => ({
          pages: state.pages.map((page) =>
            page.id === pageId
              ? {
                  ...page,
                  tags: tags.map((t) => t.trim()).filter(Boolean),
                  updatedAt: Date.now(),
                }
              : page,
          ),
        }));
      },

      togglePinned(id: string) {
        const state = get();
        const page = state.pages.find((e) => e.id === id);
        if (!page) return toast.error("Page not found");
        page.pinned = !page.pinned;
        toast.success(
          `Page ${!page.pinned ? "unpinned" : "pinned"} successfully.`,
        );
        set({ pages: [...state.pages] });
      },

      getAllTags() {
        const state = get();
        const allTags = state.pages.flatMap((page) => page.tags);
        return [...new Set(allTags)].sort();
      },

      getByTag(tag: string) {
        const state = get();
        const normalizedTag = tag.trim();
        return state.pages.filter((page) => page.tags.includes(normalizedTag));
      },

      updateViewedAt(pageId: string) {
        set((state: State) => ({
          pages: state.pages.map((page) =>
            page.id === pageId ? { ...page, lastViewedAt: Date.now() } : page,
          ),
        }));
      },
    }),
    {
      name: "note-storage",
      version: 1,
      storage: createJSONStorage(() => journalStorage),
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          if (persistedState && Array.isArray(persistedState.entries)) {
            persistedState.pages = persistedState.entries;
            delete persistedState.entries;
          }
        }

        // Example: Future breaking change (e.g., adding a new required field)
        // if (version === 1) { ... }

        return persistedState;
      },
      onRehydrateStorage: () => (store) => {
        if (!store) return;

        if (store.pages.length > 0) {
          if (!store.activeId) {
            store.setActive(store.pages[0].id);
          }
        } else {
          const id = store.create("personal", "Welcome to Art");
          store.updateContent(id, mockContent, false);
          store.togglePinned(id);
        }
      },
    },
  ),
);
