import { load } from "@tauri-apps/plugin-store";
import { createPersistedStorage } from "@/lib/store/persisted-storage";
import { migrateEscapedJson } from "@/lib/store/migrate-escaped-json";

const tauriStore = await load("settings.json");

await migrateEscapedJson(tauriStore, ["settings-storage", "ui-state-storage"]);

export const createSettingsStorage = <T>() =>
  createPersistedStorage<T>(tauriStore);
