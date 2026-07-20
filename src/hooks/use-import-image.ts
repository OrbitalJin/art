import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { open as openFile } from "@tauri-apps/plugin-fs";
import { toast } from "sonner";
import { MAX_IMAGE_SIZE, arrayBufferToBase64 } from "@/lib/utils/images";
import type { MessageAttachment } from "@/lib/store/session/types";

export const useImportImage = () => {
  return {
    importImage: async (): Promise<MessageAttachment | null> => {
      try {
        const path = await openDialog({
          multiple: false,
          directory: false,
          filters: [
            {
              name: "Image",
              extensions: ["jpeg", "jpg", "png", "gif", "webp", "svg"],
            },
          ],
        });

        if (!path) {
          return null;
        }

        const file = await openFile(path, {
          read: true,
        });
        const stat = await file.stat();

        if (stat.size > MAX_IMAGE_SIZE) {
          const sizeInMB = (stat.size / (1024 * 1024)).toFixed(2);
          toast.error(
            `Image size (${sizeInMB}MB) exceeds maximum allowed size of 5MB`,
          );
          await file.close();
          return null;
        }

        const buffer = new Uint8Array(stat.size);
        await file.read(buffer);
        await file.close();

        const base64 = arrayBufferToBase64(buffer);
        const mediaType = getMimeTypeFromPath(path);
        const name = path.split(/[/\\]/).pop() || "image";

        toast.success("Image imported successfully");
        return { base64, mediaType, name, size: stat.size };
      } catch (error) {
        toast.error("Failed to import image");
        console.error("Image import error:", error);
        return null;
      }
    },
  };
};

function getMimeTypeFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
  };
  return mimeTypes[ext || ""] || "image/png";
}
