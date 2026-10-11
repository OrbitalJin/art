import { toast } from "sonner";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";

const safeStringify = (value: unknown): string => {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2) ?? String(value);
  } catch {
    return String(value);
  }
};

/**
 * Serialize an error (Composio `ComposioError` / `@composio/client` `APIError`
 * or a plain value) into a complete, copyable block.
 */
export const formatError = (err: unknown): string => {
  if (err instanceof Error) {
    const record = err as unknown as Record<string, unknown>;
    const lines = [`${err.name}: ${err.message}`];

    if (record.status !== undefined) {
      lines.push(`Status: ${String(record.status)}`);
    }
    if (record.code !== undefined) {
      lines.push(`Code: ${String(record.code)}`);
    }
    if (record.errorId !== undefined) {
      lines.push(`Error ID: ${String(record.errorId)}`);
    }
    if (Array.isArray(record.possibleFixes) && record.possibleFixes.length > 0) {
      lines.push(`Possible fixes: ${record.possibleFixes.join("; ")}`);
    }

    if (record.error !== undefined) {
      const body = safeStringify(record.error);
      if (!err.message.includes(body)) lines.push(`Body:\n${body}`);
    }

    if (err.stack) lines.push(`\nStack:\n${err.stack}`);
    return lines.join("\n");
  }

  return safeStringify(err);
};

const shortMessage = (err: unknown): string =>
  err instanceof Error ? err.message : safeStringify(err);

/**
 * Persistent error toast for connection failures, with a button that copies the
 * full serialized error to the clipboard.
 */
export const showConnectionErrorToast = (err: unknown): void => {
  const full = formatError(err);
  const message = shortMessage(err);

  toast.error("Connection failed", {
    description: message.length > 200 ? `${message.slice(0, 200)}…` : message,
    duration: Infinity,
    closeButton: true,
    action: {
      label: "Copy full error",
      onClick: () => {
        void writeText(full)
          .then(() => toast.success("Error copied"))
          .catch(() => toast.error("Failed to copy error"));
      },
    },
  });
};
