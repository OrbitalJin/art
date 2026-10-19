import { load } from "@tauri-apps/plugin-store";
import { createPersistedStorage } from "@/lib/store/persisted-storage";

const tauriStore = await load("prompts.json");

export const createStashStorage = <T>() =>
  createPersistedStorage<T>(tauriStore);
