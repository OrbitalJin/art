import { load } from "@tauri-apps/plugin-store";
import { createPersistedStorage } from "@/lib/store/persisted-storage";

const journalIndexStore = await load("journal/index.json");

export const createJournalIndexStorage = <T>() =>
  createPersistedStorage<T>(journalIndexStore);
