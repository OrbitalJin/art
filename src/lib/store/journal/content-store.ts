import { useEffect } from "react";
import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";
import {
  readPageMarkdown,
  removePageMarkdown,
  writePageMarkdown,
} from "./content-adapter";

interface JournalContentState {
  cache: Record<string, string | undefined>;
  ensure: (id: string) => Promise<string>;
  set: (id: string, markdown: string) => void;
  remove: (id: string) => void;
}

export const journalContentStore = createStore<JournalContentState>()(
  (set, get) => ({
    cache: {},

    ensure: async (id) => {
      const cached = get().cache[id];
      if (cached !== undefined) return cached;
      const markdown = (await readPageMarkdown(id)) ?? "";
      set((state) => ({ cache: { ...state.cache, [id]: markdown } }));
      return markdown;
    },

    set: (id, markdown) => {
      set((state) => ({ cache: { ...state.cache, [id]: markdown } }));
      void writePageMarkdown(id, markdown);
    },

    remove: (id) => {
      set((state) => {
        if (!(id in state.cache)) return state;
        const cache = { ...state.cache };
        delete cache[id];
        return { cache };
      });
      void removePageMarkdown(id);
    },
  }),
);

export const usePageMarkdown = (id: string | null): string | undefined => {
  const markdown = useStore(journalContentStore, (state) =>
    id ? state.cache[id] : undefined,
  );

  useEffect(() => {
    if (id) void journalContentStore.getState().ensure(id);
  }, [id]);

  return markdown;
};
