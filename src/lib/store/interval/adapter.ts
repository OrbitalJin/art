import { load } from "@tauri-apps/plugin-store";
import { createPersistedStorage } from "@/lib/store/persisted-storage";

const tauriStore = await load("intervals.json");

export const createIntervalsStorage = <T>() =>
  createPersistedStorage<T>(tauriStore);
