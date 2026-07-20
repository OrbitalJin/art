import { useState } from "react";
import { toast } from "sonner";
import { writeText, writeImage } from "@tauri-apps/plugin-clipboard-manager";
import { base64DataUrlToBytes } from "@/lib/utils/images";

type CopyInput =
  | string
  | { kind: "text"; data: string }
  | { kind: "image"; data: string };

const isImageInput = (
  input: CopyInput,
): input is { kind: "image"; data: string } =>
  typeof input === "object" && input.kind === "image";

const getText = (input: CopyInput): string =>
  typeof input === "string" ? input : input.data;

export const useCopy = (input: CopyInput) => {
  const [copied, setCopied] = useState<boolean>(false);

  const copy = async () => {
    try {
      if (isImageInput(input)) {
        await writeImage(base64DataUrlToBytes(input.data));
      } else {
        await writeText(getText(input));
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Copied to clipboard");
    } catch (e) {
      console.log(e);
      toast.error("Failed to copy to clipboard");
    }
  };

  return {
    copied,
    copy,
  };
};
