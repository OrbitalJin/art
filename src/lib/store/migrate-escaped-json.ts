import { load, type Store } from "@tauri-apps/plugin-store";
import type { StorageValue } from "zustand/middleware";

const parseEnvelope = (value: unknown): StorageValue<unknown> | null => {
  if (typeof value !== "string") return null;

  try {
    const parsed = JSON.parse(value) as StorageValue<unknown>;
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.state === "object" &&
      parsed.state !== null
    ) {
      return parsed;
    }
  } catch {
    // Not a persisted zustand envelope; leave it alone.
  }

  return null;
};

const backupStore = async (store: Store, name: string): Promise<string> => {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const path = `backups/${name}.${stamp}.json`;
  const backup = await load(path, { autoSave: false });

  for (const [key, value] of await store.entries()) {
    await backup.set(key, value);
  }

  await backup.save();

  return path;
};

/**
 * Older builds wrapped the zustand envelope in a JSON string, which the Tauri
 * store then wrote as an escaped string. Convert those keys to plain objects.
 * Idempotent: keys that already hold objects are skipped.
 *
 * Before the conversion the whole store is snapshotted to
 * `backups/<name>.<timestamp>.json` so the original values can be recovered.
 */
export const migrateEscapedJson = async (
  store: Store,
  keys: string[],
  name: string,
): Promise<void> => {
  const converted: Array<[string, StorageValue<unknown>]> = [];

  for (const key of keys) {
    const envelope = parseEnvelope(await store.get(key));
    if (envelope) converted.push([key, envelope]);
  }

  if (converted.length === 0) return;

  const backupPath = await backupStore(store, name);

  for (const [key, envelope] of converted) {
    await store.set(key, envelope);
  }

  await store.save();

  console.info(
    `[migrate] decoded escaped zustand values: ${converted.map(([key]) => key).join(", ")} (backup: ${backupPath})`,
  );
};
