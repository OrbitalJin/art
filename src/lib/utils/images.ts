export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"];

export const isValidImageFile = (file: File): boolean => {
  return ALLOWED_IMAGE_TYPES.includes(file.type);
};

export const isValidImageSize = (file: File): boolean => {
  return file.size <= MAX_IMAGE_SIZE;
};

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
    throw new Error("Invalid image type. Please upload a JPEG, PNG, GIF, WebP, or SVG image.");
  }

  if (!isValidImageSize(file)) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    throw new Error(`Image size (${sizeInMB}MB) exceeds maximum allowed size of 5MB.`);
  }

  try {
    const base64 = await fileToBase64(file);
    return base64;
  } catch {
    throw new Error("Failed to process image. Please try again.");
  }
};

export const extractImageFromClipboard = async (clipboardData: DataTransfer | null): Promise<string | null> => {
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

export const extractImageFromDrop = async (dataTransfer: DataTransfer | null): Promise<string | null> => {
  if (!dataTransfer) return null;

  const files = Array.from(dataTransfer.files);

  for (const file of files) {
    if (file.type.startsWith("image/")) {
      return await processImageFile(file);
    }
  }

  return null;
};
