import { load } from "@tauri-apps/plugin-store";
import { createPersistedStorage } from "@/lib/store/persisted-storage";
import type { SessionData } from "./types";

const sessionIndexStore = await load("sessions/index.json");

export const createSessionIndexStorage = <T>() =>
  createPersistedStorage<T>(sessionIndexStore);

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
