import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { open as openFile } from "@tauri-apps/plugin-fs";
import { toast } from "sonner";
import {
  MAX_IMAGE_SIZE,
  arrayBufferToBase64,
  rgbaToPng,
  getMimeTypeFromPath,
} from "@/lib/utils/images";
import type { MessageAttachment } from "@/lib/store/session/types";
import { readImage } from "@tauri-apps/plugin-clipboard-manager";

export const useImportImage = () => {
  return {
    importClipboardImage: async (): Promise<MessageAttachment | null> => {
      const id = toast.loading("Importing image from clipboard...");
      try {
        const image = await readImage();
        const { width, height } = await image.size();
        const rgba = await image.rgba();

        const pngBytes = await rgbaToPng(rgba, width, height);
        const size = pngBytes.byteLength;

        if (size > MAX_IMAGE_SIZE) {
          const sizeInMB = (size / (1024 * 1024)).toFixed(2);

          toast.error(
            `Image size (${sizeInMB}MB) exceeds maximum allowed size of 5MB`,
            { id },
          );

          return null;
        }

        const base64 = arrayBufferToBase64(pngBytes);

        toast.success(
          "Image imported successfully",

          { id },
        );

        return {
          base64,
          mediaType: "image/png",
          name: "clipboard-image.png",
          size,
        };
      } catch (error) {
        toast.error("Failed to import image", { id });
        console.error("Image import error:", error);
        return null;
      }
    },
    importFSImage: async (): Promise<MessageAttachment | null> => {
      const id = toast.loading("Importing image from file system...");
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
            { id },
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

        toast.success("Image imported successfully", { id });
        return { base64, mediaType, name, size: stat.size };
      } catch (error) {
        toast.error("Failed to import image", { id });
        console.error("Image import error:", error);
        return null;
      }
    },
  };
};
