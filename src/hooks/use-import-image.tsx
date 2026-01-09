import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { open as openFile } from "@tauri-apps/plugin-fs";
import { toast } from "sonner";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export const useImportImage = () => {
  const importImage = async (): Promise<string | null> => {
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
        toast.error(`Image size (${sizeInMB}MB) exceeds maximum allowed size of 5MB`);
        await file.close();
        return null;
      }

      const buffer = new Uint8Array(stat.size);
      await file.read(buffer);
      await file.close();

      const base64 = arrayBufferToBase64(buffer);
      const mimeType = getMimeTypeFromPath(path);
      const dataUrl = `data:${mimeType};base64,${base64}`;

      toast.success("Image imported successfully");
      return dataUrl;
    } catch (error) {
      toast.error("Failed to import image");
      console.error("Image import error:", error);
      return null;
    }
  };

  return {
    importImage,
  };
};

function arrayBufferToBase64(buffer: Uint8Array): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

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
