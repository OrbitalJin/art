import { load } from "@tauri-apps/plugin-store";
import type { StateStorage } from "zustand/middleware";

const tauriStore = await load("intervals.json");

export const intervalsStore: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await tauriStore.get(name)) || null;
  },

  setItem: async (name: string, value: string): Promise<void> => {
    await tauriStore.set(name, value);
    await tauriStore.save();
  },

  removeItem: async (name: string): Promise<void> => {
    await tauriStore.delete(name);
    await tauriStore.save();
  },
};
