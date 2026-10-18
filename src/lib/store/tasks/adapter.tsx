import { load } from "@tauri-apps/plugin-store";
import { createPersistedStorage } from "@/lib/store/persisted-storage";
import { migrateEscapedJson } from "@/lib/store/migrate-escaped-json";

const tasksStore = await load("tasks.json");

await migrateEscapedJson(tasksStore, ["tasks-storage"], "tasks");

export const createTasksStorage = <T,>() =>
  createPersistedStorage<T>(tasksStore);
