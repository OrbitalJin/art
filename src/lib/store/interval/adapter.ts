import { load } from "@tauri-apps/plugin-store";
import { createPersistedStorage } from "@/lib/store/persisted-storage";
import { migrateEscapedJson } from "@/lib/store/migrate-escaped-json";

const tauriStore = await load("intervals.json");

await migrateEscapedJson(
  tauriStore,
  ["intervals-storage", "intervals-storage3", "intervals-storages"],
  "intervals",
);

export const createIntervalsStorage = <T>() =>
  createPersistedStorage<T>(tauriStore);
