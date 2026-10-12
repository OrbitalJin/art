import { z } from "zod";
import { composioTool } from "./composio/define";
import { failed } from "./composio/output";
import { asArray, asRecord, asString, recordsOf } from "@/lib/utils/coerce";

/**
 * Gmail tools backed by Composio. Each tool declares its input and output
 * schema and normalizes Composio's raw Gmail payload into the output shape, so
 * the rest of the app never has to guess at field names.
 */

const headerOf = (
  record: Record<string, unknown>,
  name: string,
): string | null => {
  const payload = asRecord(record.payload);
  const headers = asArray(payload?.headers);
  const target = name.toLowerCase();
  for (const item of headers) {
    const header = asRecord(item);
    if (asString(header?.name)?.toLowerCase() === target) {
      return asString(header?.value);
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

export const gmailEmailSchema = z.object({
  id: z.string().nullable(),
  threadId: z.string().nullable(),
  subject: z.string().nullable(),
  sender: z.string().nullable(),
  recipient: z.string().nullable(),
  snippet: z.string().nullable(),
  body: z.string().nullable(),
  date: z.string().nullable(),
  labels: z.array(z.string()),
  unread: z.boolean(),
  starred: z.boolean(),
});

export type GmailEmail = z.infer<typeof gmailEmailSchema>;

export const gmailLabelSchema = z.object({
  id: z.string().nullable(),
  name: z.string().nullable(),
  type: z.string().nullable(),
});

export type GmailLabel = z.infer<typeof gmailLabelSchema>;

export const gmailMessagesOutput = z.object({
  messages: z.array(gmailEmailSchema),
  error: z.string().optional(),
});

export const gmailMessageOutput = z.object({
  message: gmailEmailSchema.nullable(),
  error: z.string().optional(),
});

export const gmailLabelsOutput = z.object({
  labels: z.array(gmailLabelSchema),
  error: z.string().optional(),
});

export type GmailMessagesOutput = z.infer<typeof gmailMessagesOutput>;
export type GmailMessageOutput = z.infer<typeof gmailMessageOutput>;
export type GmailLabelsOutput = z.infer<typeof gmailLabelsOutput>;

const toEmail = (item: unknown): GmailEmail => {
  const record = asRecord(item) ?? {};
  const preview = asRecord(record.preview);
  const labels = asArray(record.labelIds).filter(
    (label): label is string => typeof label === "string",
  );

  return {
    id: asString(record.messageId) ?? asString(record.id),
    threadId: asString(record.threadId),
    subject: asString(record.subject) ?? headerOf(record, "Subject"),
    sender: asString(record.sender) ?? headerOf(record, "From"),
    recipient:
      asString(record.recipient) ??
      asString(record.to) ??
      headerOf(record, "To"),
    snippet:
      asString(record.snippet) ??
      asString(record.messageText) ??
      asString(preview?.body) ??
      asString(preview?.snippet),
    body: asString(record.messageText) ?? asString(preview?.body),
    date: timestampOf(record),
    labels,
    unread: labels.includes("UNREAD"),
    starred: labels.includes("STARRED"),
  };
};

const rawMessages = (
  data: Record<string, unknown>,
): Record<string, unknown>[] => {
  const messages = recordsOf(data.messages);
  if (messages.length > 0) return messages;
  return recordsOf(data.emails);
};

const rawMessage = (
  data: Record<string, unknown>,
): Record<string, unknown> | null => {
  const nested =
    asRecord(data.message) ?? asRecord(asArray(data.messages)[0]);
  return nested ?? data;
};

const userHint = "Leave unset to use the connected Gmail account.";

export const gmailTools = () => ({
  gmail_fetch_emails: composioTool({
    slug: "GMAIL_FETCH_EMAILS",
    title: "Fetch Emails",
    description:
      "Search and list Gmail messages. Supports Gmail search syntax in " +
      "`query` (e.g. `from:alice@example.com is:unread newer_than:7d`). " +
      "Returns normalized messages with sender, subject, snippet, and labels.",
    inputSchema: z.object({
      query: z
        .string()
        .optional()
        .describe("Gmail search query, e.g. 'is:unread from:alice@example.com'"),
      max_results: z
        .number()
        .int()
        .min(1)
        .max(50)
        .optional()
        .describe("Maximum number of messages to return."),
      label_ids: z
        .array(z.string())
        .optional()
        .describe("Restrict to messages with these label ids."),
      include_spam_trash: z
        .boolean()
        .optional()
        .describe("Include messages from Spam and Trash."),
      user_id: z.string().optional().describe(userHint),
    }),
    outputSchema: gmailMessagesOutput,
    args: (input) => ({ max_results: 10, ...input }),
    map: (data) => ({ messages: rawMessages(data).map(toEmail) }),
    errorResult: failed({ messages: [] }),
  }),

  gmail_list_messages: composioTool({
    slug: "GMAIL_LIST_MESSAGES",
    title: "List Messages",
    description:
      "List Gmail message ids matching an optional query. Use " +
      "`gmail_fetch_emails` when you need message contents.",
    inputSchema: z.object({
      q: z.string().optional().describe("Gmail search query."),
      max_results: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe("Maximum number of messages to list."),
      label_ids: z
        .array(z.string())
        .optional()
        .describe("Restrict to messages with these label ids."),
      user_id: z.string().optional().describe(userHint),
    }),
    outputSchema: gmailMessagesOutput,
    map: (data) => ({ messages: rawMessages(data).map(toEmail) }),
    errorResult: failed({ messages: [] }),
  }),

  gmail_fetch_message_by_id: composioTool({
    slug: "GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID",
    title: "Read Email",
    description:
      "Fetch a single Gmail message by its id, including its full body.",
    inputSchema: z.object({
      message_id: z.string().describe("The Gmail message id to fetch."),
      format: z
        .enum(["minimal", "full", "raw", "metadata"])
        .optional()
        .describe("Response format. Defaults to 'full'."),
      user_id: z.string().optional().describe(userHint),
    }),
    outputSchema: gmailMessageOutput,
    map: (data) => {
      const record = rawMessage(data);
      return { message: record ? toEmail(record) : null };
    },
    errorResult: failed({ message: null }),
  }),

  gmail_list_labels: composioTool({
    slug: "GMAIL_LIST_LABELS",
    title: "List Labels",
    description: "List the labels in the connected Gmail account.",
    inputSchema: z.object({
      user_id: z.string().optional().describe(userHint),
    }),
    outputSchema: gmailLabelsOutput,
    map: (data) => ({
      labels: recordsOf(data.labels).map((label) => ({
        id: asString(label.id),
        name: asString(label.name),
        type: asString(label.type),
      })),
    }),
    errorResult: failed({ labels: [] }),
  }),
});

export type GmailToolName = keyof ReturnType<typeof gmailTools>;
