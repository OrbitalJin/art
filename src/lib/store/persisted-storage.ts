import type { Store } from "@tauri-apps/plugin-store";
import type { PersistStorage, StorageValue } from "zustand/middleware";

/**
 * Wraps a Tauri store as a zustand `PersistStorage`.
 *
 * zustand persists on every `set`, including sets that fire before its async
 * hydration has read the stored value. Writing then would clobber the file
 * with the store's initial defaults, so `setItem` is dropped until the first
 * `getItem` resolves. `removeItem` (an explicit clear) is always honored.
 */
export const createPersistedStorage = <T>(store: Store): PersistStorage<T> => {
  let hydrated = false;

  return {
    getItem: async (name: string): Promise<StorageValue<T> | null> => {
      const value = (await store.get<StorageValue<T>>(name)) ?? null;
      hydrated = true;
      return value;
    },

    setItem: async (name: string, value: StorageValue<T>): Promise<void> => {
      if (!hydrated) return;
      await store.set(name, value);
      await store.save();
    },

    removeItem: async (name: string): Promise<void> => {
      await store.delete(name);
      await store.save();
    },
  };
};
