import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand";
import { toast } from "sonner";
import type { Entry } from "./notes/types";
import { noteStorage } from "./notes/adapter";

const createNewEntry = (title?: string): Entry => {
  const date = Date.now();
  return {
    id: crypto.randomUUID(),
    title: title ?? "Random Thoughts",
    content: "",
    createdAt: date,
    updatedAt: date,
    lastViewedAt: date,
    tags: [],
  };
};

export interface State {
  entries: Entry[];
  activeId: string | null;

  importFn: (orphan: Entry) => void;
  setActive: (id: string) => void;
  ensureDefault: () => void;
  deleteFn: (id: string) => void;
  create: (title?: string) => void;
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
  getEntriesByTag: (tag: string) => Entry[];
  updateViewedAt: (entryId: string) => void;
}
export const useNoteStore = create<State>()(
  persist(
    (set, get) => ({
      entries: [],
      activeId: null,

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

      ensureDefault() {
        const state = get();
        if (state.entries.length === 0) {
          const newEntry = createNewEntry();
          set({
            entries: [newEntry],
            activeId: newEntry.id,
          });
        } else {
          if (!state.activeId) {
            set({
              activeId: state.entries[0].id,
            });
          }
        }
      },

      getFn(id: string) {
        return get().entries.find((s) => s.id === id);
      },

      create(title?: string) {
        const state = get();
        const newEntry = createNewEntry(title);
        set({
          entries: [...state.entries, newEntry],
          activeId: newEntry.id,
        });
      },

      deleteFn(id: string) {
        set((state: State) => {
          const newEntries = state.entries
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .filter((s) => s.id !== id);

          if (newEntries.length === 0) {
            const defaultEntry = createNewEntry();
            toast.success("No entries left. Created a new one.");
            return { entries: [defaultEntry], activeId: defaultEntry.id };
          }

          let newActiveId = state.activeId;
          if (state.activeId === id) {
            newActiveId = newEntries[0].id;
            toast.success("Active entry deleted, switched to most recent.");
          } else {
            toast.success("Entry deleted successfully.");
          }

          return {
            entries: newEntries,
            activeId: newActiveId,
          };
        });
      },

      setActive(id: string) {
        set((state: State) => {
          const updatedEntries = state.entries.map((entry) =>
            entry.id === id
              ? { ...entry, lastViewedAt: Date.now() }
              : entry,
          );
          return {
            activeId: id,
            entries: updatedEntries,
          };
        });
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

      updateContent(
        entryId: string,
        newContent: string,
        showToast: boolean = true,
      ) {
        set((state: State) => {
          const updatedEntries = state.entries.map((entry) => {
            if (entry.id === entryId) {
              // Only update updatedAt if content actually changed
              const contentChanged = entry.content !== newContent;
              return {
                ...entry,
                content: newContent,
                updatedAt: contentChanged ? Date.now() : entry.updatedAt,
              };
            }
            return entry;
          });

          // Only show toast if content actually changed
          const entry = state.entries.find((e) => e.id === entryId);
          if (entry && entry.content !== newContent && showToast) {
            toast.success("Entry content updated successfully.");
          }

          return { entries: updatedEntries };
        });
      },

      addTag(entryId: string, tag: string) {
        set((state: State) => {
          const updatedEntries = state.entries.map((entry) => {
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
          });

          return { entries: updatedEntries };
        });
      },

      removeTag(entryId: string, tag: string) {
        set((state: State) => ({
          entries: state.entries.map((entry) =>
            entry.id === entryId
              ? {
                  ...entry,
                  tags: entry.tags.filter((t) => t !== tag.trim().toLowerCase()),
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
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Error rehydrating store:", error);
          return;
        }

        if (state) {
          state.ensureDefault();
          // Migrate existing entries to include tags and lastViewedAt fields
          state.entries = state.entries.map((entry) => ({
            ...entry,
            tags: entry.tags || [],
            lastViewedAt: entry.lastViewedAt || entry.updatedAt,
          }));
        }
      },
    },
  ),
);