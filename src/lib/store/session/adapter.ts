import type { StateStorage } from "zustand/middleware";
import { load } from "@tauri-apps/plugin-store";
import type { SessionData } from "./types";

export const createStoreStorage = (file: string): StateStorage => ({
  getItem: async (name: string): Promise<string | null> => {
    return (await (await load(file)).get<string>(name)) ?? null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    const store = await load(file);
    await store.set(name, value);
    await store.save();
  },
  removeItem: async (name: string): Promise<void> => {
    const store = await load(file);
    await store.delete(name);
    await store.save();
  },
});

export const sessionIndexStorage = createStoreStorage("sessions/index.json");

const sessionFile = (id: string) => `sessions/${id}.json`;

export const readSessionData = async (
  id: string,
): Promise<SessionData | null> => {
  return (await (await load(sessionFile(id))).get<SessionData>("data")) ?? null;
};

export const writeSessionData = async (
  id: string,
  data: SessionData,
): Promise<void> => {
  const store = await load(sessionFile(id));
  await store.set("data", data);
  await store.save();
};

export const clearSessionData = async (id: string): Promise<void> => {
  const store = await load(sessionFile(id));
  await store.clear();
  await store.save();
};
