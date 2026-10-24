import { invoke } from "@tauri-apps/api/core";
import { pb } from "@/lib/upload/pocketbase";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import {
  COMMANDS_COLLECTION,
  createScreenshot,
  markCommand,
  pendingScreenshotCommands,
  type CommandRecord,
} from "./screenshots";

interface ScreenInfo {
  monitors: number;
  width: number;
  height: number;
}

const POLL_INTERVAL_MS = 8000;

/**
 * Commands already processed, keyed by `id:updated`. PocketBase bumps
 * `updated` on every save, so setting a row back to `pending` yields a new key
 * and re-triggers it. A failure whose status update doesn't stick keeps its key
 * and is therefore not retried by the poll — no screenshot loop.
 */
const handled = new Set<string>();

const commandKey = (command: CommandRecord): string =>
  `${command.id}:${command.updated}`;

const runCommand = async (command: CommandRecord): Promise<void> => {
  const key = commandKey(command);
  if (handled.has(key)) return;
  handled.add(key);

  try {
    const info = await invoke<ScreenInfo>("screen_info");
    const bytes = await invoke<ArrayBuffer>("capture_screens");
    const file = new File([bytes], `screenshot-${Date.now()}.png`, {
      type: "image/png",
    });

    const record = await createScreenshot(file, {
      artKey: command.artKey,
      width: info.width,
      height: info.height,
      monitors: info.monitors,
    });
    const url = pb.files.getURL(record, record.file as string);
    await markCommand(command.id, "done", { url });
  } catch (error) {
    // Best-effort. The command stays handled so a stuck status update can't
    // cause a capture loop; re-pend the row to retry.
    await markCommand(command.id, "error", {
      error: String(error).slice(0, 500),
    }).catch(() => undefined);
  }
};

const isRunnable = (command: CommandRecord): boolean =>
  command.type === "screenshot" && command.status === "pending";

/**
 * Listens for screenshot commands addressed to the configured art key. Uses
 * PocketBase realtime for near-instant delivery, with a slow poll as a safety
 * net for dropped connections (e.g. the machine sleeping). Returns a stop
 * function.
 */
export const startControlChannel = async (): Promise<() => void> => {
  const artKey = useSettingsStore.getState().artKey;
  if (!artKey) return () => undefined;

  const poll = async () => {
    try {
      const commands = await pendingScreenshotCommands();
      for (const command of commands) {
        if (isRunnable(command)) await runCommand(command);
      }
    } catch {
      // Transient network error; the next tick retries.
    }
  };

  await poll();
  const timer = window.setInterval(poll, POLL_INTERVAL_MS);

  let unsubscribe: (() => void) | null = null;
  try {
    unsubscribe = await pb.collection(COMMANDS_COLLECTION).subscribe(
      "*",
      (event) => {
        if (event.action !== "create" && event.action !== "update") return;
        const command = event.record as unknown as CommandRecord;
        if (isRunnable(command)) void runCommand(command);
      },
      { query: { secret: artKey } },
    );
  } catch {
    // Realtime unavailable (e.g. CORS on the SSE endpoint); polling covers it.
    unsubscribe = null;
  }

  return () => {
    window.clearInterval(timer);
    if (unsubscribe) void unsubscribe();
  };
};
