import { LazyStore } from "@tauri-apps/plugin-store";
import type { TranscriptResult } from "./types";

export interface PersistedEntry {
  result: TranscriptResult;
  savedAt: number;
}

const CACHE_KEY = "cache";

const store = new LazyStore("transcripts.json");

export const readCacheFile = async (): Promise<
  Record<string, PersistedEntry>
> => {
  try {
    const data =
      await store.get<Record<string, PersistedEntry>>(CACHE_KEY);
    return data ?? {};
  } catch {
    return {};
  }
};

export const writeCacheFile = async (
  entries: Record<string, PersistedEntry>,
): Promise<void> => {
  await store.set(CACHE_KEY, entries);
  await store.save();
};

export const clearCacheFile = async (): Promise<void> => {
  await store.delete(CACHE_KEY);
  await store.save();
};
