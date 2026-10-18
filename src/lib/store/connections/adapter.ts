import { load } from "@tauri-apps/plugin-store";
import { createPersistedStorage } from "@/lib/store/persisted-storage";
import { migrateEscapedJson } from "@/lib/store/migrate-escaped-json";

const tauriStore = await load("connections.json");

await migrateEscapedJson(tauriStore, ["connections-storage"], "connections");

export const createConnectionsStorage = <T>() =>
  createPersistedStorage<T>(tauriStore);
