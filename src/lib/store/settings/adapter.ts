import { load } from "@tauri-apps/plugin-store";
import { createPersistedStorage } from "@/lib/store/persisted-storage";

const tauriStore = await load("settings.json");

export const createSettingsStorage = <T>() =>
  createPersistedStorage<T>(tauriStore);
