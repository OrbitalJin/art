import { load } from "@tauri-apps/plugin-store";
import { createPersistedStorage } from "@/lib/store/persisted-storage";

const tauriStore = await load("notes.json");

export const createJournalStorage = <T,>() =>
  createPersistedStorage<T>(tauriStore);
