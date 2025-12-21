import { useState } from "react";
import { toast } from "sonner";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";

export const useCopy = (value: string) => {
  const [copied, setCopied] = useState<boolean>(false);

  const copy = async () => {
    try {
      await writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };
  return {
    copied,
    copy,
  };
};
