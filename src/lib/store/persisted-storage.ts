import type { Store } from "@tauri-apps/plugin-store";
import type { PersistStorage, StorageValue } from "zustand/middleware";

export const createPersistedStorage = <T>(store: Store): PersistStorage<T> => ({
  getItem: async (name: string): Promise<StorageValue<T> | null> =>
    (await store.get<StorageValue<T>>(name)) ?? null,

  setItem: async (name: string, value: StorageValue<T>): Promise<void> => {
    await store.set(name, value);
    await store.save();
  },

  removeItem: async (name: string): Promise<void> => {
    await store.delete(name);
    await store.save();
  },
});
