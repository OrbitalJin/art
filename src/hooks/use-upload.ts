import { useCallback } from "react";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { open as openFile } from "@tauri-apps/plugin-fs";
import { readImage } from "@tauri-apps/plugin-clipboard-manager";
import { toast } from "sonner";
import {
  ATTACHMENT_DIALOG_FILTERS,
  MAX_ATTACHMENT_SIZE,
  getMimeTypeFromExtension,
  isSupportedAttachment,
  resolveAttachmentMime,
  rgbaToPng,
} from "@/lib/utils/images";
import { deleteAttachment, uploadAttachment } from "@/lib/upload/pocketbase";
import { useDraftStore } from "@/lib/store/use-draft-store";
import { useSessionIndex } from "@/lib/store/session/index-store";

const MAX_MB = Math.round(MAX_ATTACHMENT_SIZE / (1024 * 1024));

const sizeInMB = (bytes: number): string => (bytes / (1024 * 1024)).toFixed(1);

/**
 * Temp ids of uploads that were removed from the draft while in flight. When
 * the upload resolves we delete the remote record instead of re-inserting it.
 */
const cancelledUploads = new Set<string>();

const fileFromPath = async (path: string): Promise<File> => {
  const handle = await openFile(path, { read: true });
  const stat = await handle.stat();
  const buffer = new Uint8Array(stat.size);
  await handle.read(buffer);
  await handle.close();
  const name = path.split(/[/\\]/).pop() || "file";
  return new File([buffer], name, {
    type: getMimeTypeFromExtension(name) ?? "",
  });
};

const readClipboardImage = async (): Promise<File | null> => {
  try {
    const image = await readImage();
    const { width, height } = await image.size();
    const rgba = await image.rgba();
    const png = await rgbaToPng(rgba, width, height);
    return new File([png.buffer as ArrayBuffer], "clipboard-image.png", {
      type: "image/png",
    });
  } catch {
    return null;
  }
};

/** Extract file objects from a paste/drop `DataTransfer`. */
export const filesFromDataTransfer = (data: DataTransfer | null): File[] => {
  if (!data) return [];
  const files = Array.from(data.files);
  if (files.length > 0) return files;
  return Array.from(data.items)
    .filter((item) => item.kind === "file")
    .map((item) => item.getAsFile())
    .filter((file): file is File => file !== null);
};

export const useUpload = () => {
  const activeId = useSessionIndex((state) => state.activeId);

  const startUpload = useCallback((file: File, sessionId: string) => {
    const tempId = crypto.randomUUID();
    const localUrl = URL.createObjectURL(file);

    useDraftStore.getState().addAttachment(sessionId, {
      id: tempId,
      name: file.name,
      mimeType: resolveAttachmentMime(file),
      size: file.size,
      url: "",
      status: "uploading",
      localUrl,
      localFile: file,
    });

    void uploadAttachment(file, sessionId)
      .then((uploaded) => {
        if (cancelledUploads.delete(tempId)) {
          URL.revokeObjectURL(localUrl);
          void deleteAttachment(uploaded.id).catch(() => undefined);
          return;
        }
        URL.revokeObjectURL(localUrl);
        useDraftStore.getState().updateAttachment(sessionId, tempId, {
          ...uploaded,
          status: "done",
          localUrl: undefined,
          localFile: undefined,
        });
      })
      .catch((error) => {
        cancelledUploads.delete(tempId);
        useDraftStore.getState().updateAttachment(sessionId, tempId, {
          status: "error",
        });
        console.error("Attachment upload failed:", error);
        toast.error(`Failed to upload ${file.name}`);
      });
  }, []);

  const ingest = useCallback(
    (files: File[]) => {
      const sessionId = useSessionIndex.getState().activeId;
      if (!sessionId) return;

      for (const file of files) {
        if (!isSupportedAttachment(file)) {
          toast.error(
            `${file.name} can't be attached — only images and PDFs are supported`,
          );
          continue;
        }
        if (file.size > MAX_ATTACHMENT_SIZE) {
          toast.error(
            `${file.name} is ${sizeInMB(file.size)}MB — the limit is ${MAX_MB}MB`,
          );
          continue;
        }
        startUpload(file, sessionId);
      }
    },
    [startUpload],
  );

  const remove = useCallback(
    (id: string) => {
      if (!activeId) return;
      const removed = useDraftStore.getState().removeAttachment(activeId, id);
      if (!removed) return;

      if (removed.localUrl) URL.revokeObjectURL(removed.localUrl);

      if (removed.status === "uploading") {
        // Record doesn't exist yet; mark so the in-flight upload deletes it.
        cancelledUploads.add(removed.id);
        return;
      }

      if (removed.status === "done") {
        void deleteAttachment(removed.id).catch(() => {
          toast.error(`Failed to delete ${removed.name}`);
        });
      }
    },
    [activeId],
  );

  const retry = useCallback(
    (id: string) => {
      if (!activeId) return;
      const draft = useDraftStore.getState().drafts[activeId];
      const attachment = draft?.attachments.find((a) => a.id === id);
      if (!attachment?.localFile) return;

      useDraftStore
        .getState()
        .updateAttachment(activeId, id, { status: "uploading" });

      void uploadAttachment(attachment.localFile, activeId)
        .then((uploaded) => {
          if (attachment.localUrl) URL.revokeObjectURL(attachment.localUrl);
          useDraftStore.getState().updateAttachment(activeId, id, {
            ...uploaded,
            status: "done",
            localUrl: undefined,
            localFile: undefined,
          });
        })
        .catch((error) => {
          useDraftStore
            .getState()
            .updateAttachment(activeId, id, { status: "error" });
          console.error("Attachment upload failed:", error);
          toast.error(`Failed to upload ${attachment.name}`);
        });
    },
    [activeId],
  );

  const pickFiles = useCallback(async () => {
    const selection = await openDialog({
      multiple: true,
      directory: false,
      filters: ATTACHMENT_DIALOG_FILTERS,
    });
    if (!selection) return;
    const paths = Array.isArray(selection) ? selection : [selection];

    const files: File[] = [];
    for (const path of paths) {
      try {
        files.push(await fileFromPath(path));
      } catch (error) {
        console.error("Failed to read file:", error);
        toast.error(`Failed to read ${path.split(/[/\\]/).pop() ?? "file"}`);
      }
    }
    if (files.length) ingest(files);
  }, [ingest]);

  const ingestClipboardImage = useCallback(async (): Promise<boolean> => {
    const file = await readClipboardImage();
    if (!file) return false;
    ingest([file]);
    return true;
  }, [ingest]);

  return { ingest, remove, retry, pickFiles, ingestClipboardImage };
};
