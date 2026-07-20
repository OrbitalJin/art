import type { MessageAttachment } from "@/lib/store/session/types";

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

export const isValidImageFile = (file: File): boolean => {
  return ALLOWED_IMAGE_TYPES.includes(file.type);
};

export const isValidImageSize = (file: File): boolean => {
  return file.size <= MAX_IMAGE_SIZE;
};

export function getMimeTypeFromPath(path: string): string {
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

export async function rgbaToPng(
  rgba: Uint8Array,
  width: number,
  height: number,
): Promise<Uint8Array> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not create canvas context");
  }

  const imageData = new ImageData(new Uint8ClampedArray(rgba), width, height);

  context.putImageData(imageData, 0, 0);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) {
        resolve(result);
      } else {
        reject(new Error("Could not encode clipboard image as PNG"));
      }
    }, "image/png");
  });

  return new Uint8Array(await blob.arrayBuffer());
}

export const arrayBufferToBase64 = (
  buffer: ArrayBuffer | Uint8Array,
): string => {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export const base64DataUrlToBytes = (dataUrl: string): Uint8Array => {
  const comma = dataUrl.indexOf(",");
  const payload = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  const binary = atob(payload);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

export const fileToAttachment = async (
  file: File,
): Promise<MessageAttachment> => {
  const buffer = await file.arrayBuffer();
  const base64 = arrayBufferToBase64(buffer);
  return {
    base64,
    mediaType: file.type || "image/png",
    name: file.name,
    size: file.size,
  };
};

export const previewUrl = (attachment: MessageAttachment): string =>
  `data:${attachment.mediaType};base64,${attachment.base64}`;

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const processImageFile = async (file: File): Promise<string | null> => {
  if (!isValidImageFile(file)) {
    throw new Error(
      "Invalid image type. Please upload a JPEG, PNG, GIF, WebP, or SVG image.",
    );
  }

  if (!isValidImageSize(file)) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    throw new Error(
      `Image size (${sizeInMB}MB) exceeds maximum allowed size of 5MB.`,
    );
  }

  try {
    const base64 = await fileToBase64(file);
    return base64;
  } catch {
    throw new Error("Failed to process image. Please try again.");
  }
};

export const extractImageFromClipboard = async (
  clipboardData: DataTransfer | null,
): Promise<string | null> => {
  if (!clipboardData) return null;

  const items = Array.from(clipboardData.items);

  for (const item of items) {
    if (item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (file) {
        return await processImageFile(file);
      }
    }
  }

  return null;
};
