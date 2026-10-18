import { load } from "@tauri-apps/plugin-store";
import { createPersistedStorage } from "@/lib/store/persisted-storage";
import { migrateEscapedJson } from "@/lib/store/migrate-escaped-json";

const tauriStore = await load("notes.json");

await migrateEscapedJson(tauriStore, ["note-storage", "note-temp-storage"]);

export const createJournalStorage = <T,>() =>
  createPersistedStorage<T>(tauriStore);
