import { load } from "@tauri-apps/plugin-store";
import { createPersistedStorage } from "@/lib/store/persisted-storage";

const tasksStore = await load("tasks.json");

export const createTasksStorage = <T,>() =>
  createPersistedStorage<T>(tasksStore);
