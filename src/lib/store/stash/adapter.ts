import { load } from "@tauri-apps/plugin-store";
import { createPersistedStorage } from "@/lib/store/persisted-storage";
import { migrateEscapedJson } from "@/lib/store/migrate-escaped-json";

const tauriStore = await load("prompts.json");

await migrateEscapedJson(tauriStore, ["stash-storage"]);

export const createStashStorage = <T>() =>
  createPersistedStorage<T>(tauriStore);
