import PocketBase from "pocketbase";
import { fetch as nativeFetch } from "@tauri-apps/plugin-http";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import type { ChatAttachment } from "@/lib/store/session/types";

export const PB_URL = "https://pb.x1c.dev";
export const PB_COLLECTION = "attachments";

/**
 * Strip the configured domain so a stored reference survives a domain change.
 * `uploadAttachment` hands out absolute URLs; only the root-relative part is
 * persisted.
 */
const toStoredRef = (url: string): string =>
  url.startsWith(PB_URL) ? url.slice(PB_URL.length) : url;

/**
 * Re-attach the current domain to a stored reference. Absolute URLs (written
 * before references became root-relative) pass through untouched, so existing
 * sessions keep resolving without a migration.
 */
export const resolveAttachmentUrl = (url: string): string =>
  /^https?:\/\//.test(url) ? url : `${PB_URL}${url}`;

export const pb = new PocketBase(PB_URL);

pb.beforeSend = (url, options) => {
  options.fetch = nativeFetch as typeof fetch;
  options.query = {
    ...options.query,
    uploadSecret: useSettingsStore.getState().uploadSecret,
  };
  return { url, options };
};

export const uploadAttachment = async (
  file: File,
  sessionId: string,
): Promise<ChatAttachment> => {
  const record = await pb
    .collection(PB_COLLECTION)
    .create({ sessionId, file }, { requestKey: null });

  return {
    id: record.id,
    name: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    url: pb.files.getURL(record, record.file as string),
  };
};

export const deleteAttachment = async (id: string): Promise<void> => {
  await pb.collection(PB_COLLECTION).delete(id, { requestKey: null });
};

/**
 * Strip draft-only fields (`status`, `localUrl`, `localFile`) so the attachment
 * can be persisted to the session JSON without bloating it with a raw File.
 */
export const toPersistedAttachment = (
  attachment: ChatAttachment,
): ChatAttachment => ({
  id: attachment.id,
  name: attachment.name,
  mimeType: attachment.mimeType,
  size: attachment.size,
  url: toStoredRef(attachment.url),
});
