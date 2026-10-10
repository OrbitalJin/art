import { asArray, asRecord, getString } from "../../helpers";

export const errorOf = (output: unknown): string | null =>
  getString(asRecord(output), "error");

/**
 * Composio tools return `{ data, error, successful }`. The renderer only cares
 * about the payload, so unwrap `data` when present and fall back to the raw
 * value for defensiveness.
 */
export const dataOf = (output: unknown): unknown => {
  const record = asRecord(output);
  if (!record) return output;
  return "data" in record ? record.data : output;
};

const recordsOf = (value: unknown): Record<string, unknown>[] =>
  asArray(value)
    .map((item) => asRecord(item))
    .filter((item): item is Record<string, unknown> => item !== null);

export const messagesOf = (output: unknown): Record<string, unknown>[] => {
  const data = dataOf(output);
  const record = asRecord(data) ?? asRecord(output);
  if (!record) return [];

  const messages = recordsOf(record.messages);
  if (messages.length > 0) return messages;

  const emails = recordsOf(record.emails);
  if (emails.length > 0) return emails;

  return [];
};

export const messageOf = (
  output: unknown,
): Record<string, unknown> | null => {
  const data = dataOf(output);
  const record = asRecord(data);
  if (record) {
    const nested =
      asRecord(record.message) ?? asRecord(asArray(record.messages)[0]);
    if (nested) return nested;
    return record;
  }
  return messagesOf(output)[0] ?? null;
};

export interface Email {
  id: string | null;
  threadId: string | null;
  subject: string | null;
  sender: string | null;
  recipient: string | null;
  snippet: string | null;
  date: string | null;
  labels: string[];
  unread: boolean;
  starred: boolean;
}

const headerOf = (
  record: Record<string, unknown>,
  name: string,
): string | null => {
  const payload = asRecord(record.payload);
  const headers = asArray(payload?.headers);
  const target = name.toLowerCase();
  for (const item of headers) {
    const header = asRecord(item);
    if (getString(header, "name")?.toLowerCase() === target) {
      return getString(header, "value");
    }
  }
  return null;
};

const timestampOf = (record: Record<string, unknown>): string | null => {
  const value = record.messageTimestamp ?? record.internalDate ?? record.date;
  if (typeof value === "number") return String(value);
  if (typeof value === "string" && value.trim()) return value;
  return headerOf(record, "Date");
};

export const toEmail = (item: unknown): Email => {
  const record = asRecord(item) ?? {};
  const preview = asRecord(record.preview);

  const labels = asArray(record.labelIds).filter(
    (label): label is string => typeof label === "string",
  );

  return {
    id: getString(record, "messageId") ?? getString(record, "id"),
    threadId: getString(record, "threadId"),
    subject: getString(record, "subject") ?? headerOf(record, "Subject"),
    sender: getString(record, "sender") ?? headerOf(record, "From"),
    recipient:
      getString(record, "recipient") ??
      getString(record, "to") ??
      headerOf(record, "To"),
    snippet:
      getString(record, "snippet") ??
      getString(record, "messageText") ??
      getString(preview, "body") ??
      getString(preview, "snippet"),
    date: timestampOf(record),
    labels,
    unread: labels.includes("UNREAD"),
    starred: labels.includes("STARRED"),
  };
};

export const senderName = (sender: string): string => {
  const match = sender.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  const name = match?.[1]?.trim();
  if (name) return name;
  return senderEmail(sender) ?? sender;
};

export const senderEmail = (sender: string): string | null => {
  const match = sender.match(/<([^>]+)>/);
  if (match) return match[1].trim();
  return sender.includes("@") ? sender.trim() : null;
};

export const formatEmailDate = (value: string | null): string | null => {
  if (!value) return null;

  const numeric = /^\d+$/.test(value) ? Number(value) : null;
  const date = numeric !== null ? new Date(numeric) : new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};
