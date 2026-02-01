import type { StateStorage } from "zustand/middleware";
import { load } from "@tauri-apps/plugin-store";

const tasksStore = await load("tasks.json");

export const tasksStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await tasksStore.get(name)) || null;
  },

  setItem: async (name: string, value: string): Promise<void> => {
    await tasksStore.set(name, value);
    await tasksStore.save();
  },

  removeItem: async (name: string): Promise<void> => {
    await tasksStore.delete(name);
    await tasksStore.save();
  },
};
