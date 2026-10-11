import type { TranscriptResult } from "./types";
import {
  clearCacheFile,
  readCacheFile,
  writeCacheFile,
  type PersistedEntry,
} from "./cache-store";

const MAX_ENTRIES = 50;

const memory = new Map<string, PersistedEntry>();
let hydrated = false;
let hydratePromise: Promise<void> | null = null;

const keyOf = (providerId: string, videoId: string, lang?: string): string =>
  `${providerId}:${videoId}:${lang ?? ""}`;

const hydrate = async (): Promise<void> => {
  if (hydrated) return;
  if (!hydratePromise) {
    hydratePromise = (async () => {
      const data = await readCacheFile();
      for (const [key, entry] of Object.entries(data)) {
        if (entry?.result) memory.set(key, entry);
      }
      hydrated = true;
    })();
  }
  await hydratePromise;
};

const persist = async (): Promise<void> => {
  const entries: Record<string, PersistedEntry> = {};
  for (const [key, entry] of memory) entries[key] = entry;
  await writeCacheFile(entries);
};

const evict = (): void => {
  if (memory.size <= MAX_ENTRIES) return;
  const oldestFirst = [...memory.entries()].sort(
    (a, b) => a[1].savedAt - b[1].savedAt,
  );
  const overflow = memory.size - MAX_ENTRIES;
  for (let i = 0; i < overflow; i++) memory.delete(oldestFirst[i][0]);
};

export const getCachedTranscript = async (
  providerId: string,
  videoId: string,
  lang?: string,
): Promise<TranscriptResult | null> => {
  await hydrate();
  const entry = memory.get(keyOf(providerId, videoId, lang));
  return entry?.result ?? null;
};

export const setCachedTranscript = async (
  providerId: string,
  videoId: string,
  result: TranscriptResult,
  lang?: string,
): Promise<void> => {
  if (result.error) return;
  await hydrate();
  memory.set(keyOf(providerId, videoId, lang), {
    result,
    savedAt: Date.now(),
  });
  evict();
  await persist();
};

export const clearTranscriptCache = async (): Promise<void> => {
  memory.clear();
  hydrated = true;
  await clearCacheFile();
};
