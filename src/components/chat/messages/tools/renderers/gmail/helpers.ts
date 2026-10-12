export type { GmailEmail as Email } from "@/lib/ai/tools/gmail";

const isHiddenLabel = (label: string): boolean =>
  label === "UNREAD" ||
  label === "STARRED" ||
  label === "IMPORTANT" ||
  label === "INBOX" ||
  label.startsWith("CATEGORY_") ||
  label.startsWith("Label_");

/**
 * Drops labels that are already represented elsewhere (unread dot, star) or
 * are opaque ids, and humanizes the rest: `SENT` -> `sent`.
 */
export const visibleLabels = (labels: string[]): string[] =>
  labels
    .filter((label) => !isHiddenLabel(label))
    .map((label) => label.toLowerCase().replace(/_/g, " "));

export const senderEmail = (sender: string): string | null => {
  const match = sender.match(/<([^>]+)>/);
  if (match) return match[1].trim();
  return sender.includes("@") ? sender.trim() : null;
};

export const senderName = (sender: string): string => {
  const match = sender.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  const name = match?.[1]?.trim();
  if (name) return name;
  return senderEmail(sender) ?? sender;
};

const parseEmailDate = (value: string): Date => {
  const numeric = /^\d+$/.test(value) ? Number(value) : null;
  return numeric !== null ? new Date(numeric) : new Date(value);
};

/** Gmail-style: time today, "Mar 4" this year, "Mar 4, 2024" otherwise. */
export const formatEmailDate = (value: string | null): string | null => {
  if (!value) return null;

  const date = parseEmailDate(value);
  if (Number.isNaN(date.getTime())) return value;

  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatFullEmailDate = (value: string | null): string | null => {
  if (!value) return null;

  const date = parseEmailDate(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};
