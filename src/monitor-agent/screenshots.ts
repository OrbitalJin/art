import type { RecordModel } from "pocketbase";
import { pb } from "@/lib/upload/pocketbase";

export const COMMANDS_COLLECTION = "commands";
export const SCREENSHOTS_COLLECTION = "screenshots";

export interface CommandRecord {
  id: string;
  artKey: string;
  type: string;
  status: string;
  error?: string;
  /** Bumped by PocketBase on every save; used to detect a re-trigger. */
  updated: string;
}

export interface ScreenshotMeta {
  artKey: string;
  width: number;
  height: number;
  monitors: number;
}

export const createScreenshot = async (
  file: File,
  meta: ScreenshotMeta,
): Promise<RecordModel> => {
  return pb
    .collection(SCREENSHOTS_COLLECTION)
    .create({ ...meta, file }, { requestKey: null });
};

/** Pending screenshot commands for this key; used by the polling safety net. */
export const pendingScreenshotCommands = async (): Promise<CommandRecord[]> => {
  const records = await pb.collection(COMMANDS_COLLECTION).getFullList({
    filter: 'status = "pending" && type = "screenshot"',
    requestKey: null,
  });
  return records as unknown as CommandRecord[];
};

/**
 * Finalize a command. On success `url` carries the uploaded screenshot's file
 * URL so the trigger can resolve it without querying the screenshots
 * collection.
 */
export const markCommand = async (
  id: string,
  status: "done" | "error",
  { error = "", url = "" }: { error?: string; url?: string } = {},
): Promise<void> => {
  await pb
    .collection(COMMANDS_COLLECTION)
    .update(id, { status, error, url }, { requestKey: null });
};
