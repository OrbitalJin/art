import { load } from "@tauri-apps/plugin-store";
import { createPersistedStorage } from "@/lib/store/persisted-storage";

const tauriStore = await load("connections.json");

export const createConnectionsStorage = <T>() =>
  createPersistedStorage<T>(tauriStore);
