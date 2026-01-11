import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand";
import { toast } from "sonner";
import type { Entry, Workspace } from "./notes/types";
import { noteStorage } from "./notes/adapter";

const createNewEntry = (workspace: Workspace, title?: string): Entry => {
  const date = Date.now();
  return {
    id: crypto.randomUUID(),
    title: title ?? "Random Thoughts",
    content: "",
    workspace: workspace,
    createdAt: date,
    updatedAt: date,
    lastViewedAt: date,
    tags: [],
  };
};

export interface State {
  entries: Entry[];
  activeId: string | null;
  currentWorkspace: Workspace;

  togglePin: (id: string) => void;
  importFn: (orphan: Entry) => void;
  setActive: (id: string) => void;
  deleteFn: (id: string) => void;
  create: (workspace?: Workspace, title?: string) => void;
  getFn: (id: string) => Entry | undefined;
  save: (entry: Entry) => void;
  updateContent: (
    entryId: string,
    newContent: string,
    showToast: boolean,
  ) => void;
  updateTitle: (entryId: string, newTitle: string) => void;
  addTag: (entryId: string, tag: string) => void;
  removeTag: (entryId: string, tag: string) => void;
  updateTags: (entryId: string, tags: string[]) => void;
  getAllTags: () => string[];
  changeWorkspace: (id: string, workspace: Workspace) => void;
  getEntriesByTag: (tag: string) => Entry[];
  updateViewedAt: (entryId: string) => void;
  setWorkspace: (workspace: Workspace) => void;
}

export const useNoteStore = create<State>()(
  persist(
    (set, get) => ({
      entries: [],
      activeId: null,
      currentWorkspace: "personal",

      setWorkspace: (workspace: Workspace) =>
        set({ currentWorkspace: workspace }),

      save(entry: Entry) {
        set((state) => ({
          entries: state.entries.map((s) => (s.id === entry.id ? entry : s)),
        }));
      },

      importFn(orphan: Entry) {
        const state = get();
        const duplicate = state.entries.find((s) => s.id === orphan.id);
        if (duplicate) {
          orphan.id = crypto.randomUUID();
          toast.warning("Conflicting entry id detected.");
        }
        set({
          entries: [...state.entries, orphan],
        });
      },

      getFn(id: string) {
        return get().entries.find((s) => s.id === id);
      },

      create(workspace?: Workspace, title?: string) {
        const state = get();
        const newEntry = createNewEntry(
          workspace || state.currentWorkspace,
          title,
        );
        set({
          entries: [...state.entries, newEntry],
          activeId: newEntry.id,
          currentWorkspace: workspace,
        });
      },

      deleteFn(id: string) {
        set((state: State) => {
          const newEntries = state.entries.filter((s) => s.id !== id);
          toast.success("Entry deleted successfully.");

          return {
            entries: newEntries,
            activeId: state.activeId === id ? null : state.activeId,
          };
        });
      },

      setActive(id: string) {
        const entry = get().entries.find((e) => e.id === id);
        if (!entry) return;

        set((state: State) => ({
          activeId: id,
          currentWorkspace: entry.workspace,
          entries: state.entries.map((e) =>
            e.id === id ? { ...e, lastViewedAt: Date.now() } : e,
          ),
        }));
      },

      updateTitle(id: string, newTitle: string) {
        set((state: State) => ({
          entries: state.entries.map((entry) =>
            entry.id === id
              ? { ...entry, title: newTitle, updatedAt: Date.now() }
              : entry,
          ),
        }));
        toast.success("Entry title updated successfully.");
      },

      changeWorkspace(id: string, workspace: Workspace) {
        set((state: State) => ({
          currentWorkspace:
            state.activeId === id ? workspace : state.currentWorkspace,
          entries: state.entries.map((entry) =>
            entry.id === id
              ? { ...entry, workspace: workspace, updatedAt: Date.now() }
              : entry,
          ),
        }));
      },

      updateContent(entryId: string, newContent: string, showToast = true) {
        set((state: State) => {
          const updatedEntries = state.entries.map((entry) => {
            if (entry.id === entryId) {
              const contentChanged = entry.content !== newContent;
              return {
                ...entry,
                content: newContent,
                updatedAt: contentChanged ? Date.now() : entry.updatedAt,
              };
            }
            return entry;
          });

          const entry = state.entries.find((e) => e.id === entryId);
          if (entry && entry.content !== newContent && showToast) {
            toast.success("Entry content updated successfully.");
          }

          return { entries: updatedEntries };
        });
      },

      addTag(entryId: string, tag: string) {
        set((state: State) => ({
          entries: state.entries.map((entry) => {
            if (entry.id === entryId) {
              const normalizedTag = tag.trim().toLowerCase();
              if (!entry.tags.includes(normalizedTag)) {
                return {
                  ...entry,
                  tags: [...entry.tags, normalizedTag],
                  updatedAt: Date.now(),
                };
              }
            }
            return entry;
          }),
        }));
      },

      removeTag(entryId: string, tag: string) {
        set((state: State) => ({
          entries: state.entries.map((entry) =>
            entry.id === entryId
              ? {
                  ...entry,
                  tags: entry.tags.filter(
                    (t) => t !== tag.trim().toLowerCase(),
                  ),
                  updatedAt: Date.now(),
                }
              : entry,
          ),
        }));
      },

      updateTags(entryId: string, tags: string[]) {
        set((state: State) => ({
          entries: state.entries.map((entry) =>
            entry.id === entryId
              ? {
                  ...entry,
                  tags: tags.map((t) => t.trim().toLowerCase()).filter(Boolean),
                  updatedAt: Date.now(),
                }
              : entry,
          ),
        }));
      },

      togglePin(entryId: string) {
        set((state: State) => ({
          entries: state.entries.map((entry) =>
            entry.id === entryId
              ? {
                  ...entry,
                  pinned: !entry.pinned,
                  updatedAt: Date.now(),
                }
              : entry,
          ),
        }));
      },

      getAllTags() {
        const state = get();
        const allTags = state.entries.flatMap((entry) => entry.tags);
        return [...new Set(allTags)].sort();
      },

      getEntriesByTag(tag: string) {
        const state = get();
        const normalizedTag = tag.trim().toLowerCase();
        return state.entries.filter((entry) =>
          entry.tags.includes(normalizedTag),
        );
      },

      updateViewedAt(entryId: string) {
        set((state: State) => ({
          entries: state.entries.map((entry) =>
            entry.id === entryId
              ? { ...entry, lastViewedAt: Date.now() }
              : entry,
          ),
        }));
      },
    }),
    {
      name: "note-storage",
      storage: createJSONStorage(() => noteStorage),
      onRehydrateStorage: () => (store) => {
        if (!store) return;
        const entries = store.entries;
        if (entries.length !== 0) {
          store.setActive(entries[0].id);
        }
      },
    },
  ),
);
