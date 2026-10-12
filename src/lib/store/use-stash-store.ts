import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { stashStorage } from "@/lib/store/stash/adapter";
import { hasPlaceholders } from "@/lib/stash/placeholders";

export type StashKind = "snippet" | "template";

export interface StashEntry {
  id: string;
  title: string;
  content: string;
  kind: StashKind;
  createdAt: number;
  updatedAt: number;
}

export interface StashEntryInput {
  title: string;
  content: string;
  kind?: StashKind;
}

interface StashState {
  entries: StashEntry[];
  hydrated: boolean;
  addEntry: (input: StashEntryInput) => string;
  updateEntry: (
    id: string,
    patch: Partial<Pick<StashEntry, "title" | "content" | "kind">>,
  ) => void;
  removeEntry: (id: string) => void;
  moveEntry: (from: number, to: number) => void;
  setHydrated: (value: boolean) => void;
}

const initialState = {
  entries: [] as StashEntry[],
  hydrated: false,
};

const resolveKind = (content: string, kind?: StashKind): StashKind =>
  kind ?? (hasPlaceholders(content) ? "template" : "snippet");

export const useStashStore = create<StashState>()(
  persist(
    (set) => ({
      ...initialState,

      addEntry: ({ title, content, kind }) => {
        const now = Date.now();
        const id = crypto.randomUUID();
        const entry: StashEntry = {
          id,
          title: title.trim() || "Untitled",
          content,
          kind: resolveKind(content, kind),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ entries: [...state.entries, entry] }));
        return id;
      },

      updateEntry: (id, patch) =>
        set((state) => ({
          entries: state.entries.map((entry) => {
            if (entry.id !== id) return entry;
            const content = patch.content ?? entry.content;
            return {
              ...entry,
              ...patch,
              content,
              kind: resolveKind(content, patch.kind ?? entry.kind),
              updatedAt: Date.now(),
            };
          }),
        })),

      removeEntry: (id) =>
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
        })),

      moveEntry: (from, to) =>
        set((state) => {
          if (
            from === to ||
            from < 0 ||
            to < 0 ||
            from >= state.entries.length ||
            to >= state.entries.length
          ) {
            return state;
          }
          const entries = [...state.entries];
          const [moved] = entries.splice(from, 1);
          entries.splice(to, 0, moved);
          return { entries };
        }),

      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: "stash-storage",
      version: 1,
      storage: createJSONStorage(() => stashStorage),
      partialize: (state) => ({ entries: state.entries }),
      migrate: (persistedState) =>
        persistedState as Pick<StashState, "entries">,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
