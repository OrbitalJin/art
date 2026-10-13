import { z } from "zod";

/**
 * Gmail renderers consume Composio's Vercel tools directly, so the raw tool
 * output is the execution envelope `{ data, error, successful, logId }`. We
 * parse the envelope once here and normalize `data` into the shapes the email
 * parts render, keeping the UI decoupled from the backend payload.
 */
const envelope = <T extends z.ZodTypeAny>(data: T) =>
  z.object({
    data,
    error: z.string().nullish(),
    successful: z.boolean().optional(),
    logId: z.string().nullish(),
  });

export const gmailFetchEmailsInput = z
  .object({
    query: z.string().optional(),
    max_results: z.number().optional(),
  })
  .loose();
export type GmailFetchEmailsInput = z.infer<typeof gmailFetchEmailsInput>;

export const gmailListMessagesInput = z
  .object({
    q: z.string().optional(),
    max_results: z.number().optional(),
  })
  .loose();
export type GmailListMessagesInput = z.infer<typeof gmailListMessagesInput>;

export const gmailFetchMessageInput = z
  .object({
    message_id: z.string().optional(),
    id: z.string().optional(),
    format: z.string().optional(),
  })
  .loose();
export type GmailFetchMessageInput = z.infer<typeof gmailFetchMessageInput>;

export const gmailListLabelsInput = z.object({}).loose();
export type GmailListLabelsInput = z.infer<typeof gmailListLabelsInput>;

/**
 * The snippet Composio attaches to a message. `messageText` is often empty on
 * list calls; the actual preview text lives in `preview.body`.
 */
const messagePreview = z.object({
  body: z.string().nullish(),
  subject: z.string().nullish(),
  snippet: z.string().nullish(),
});

const messageBody = z.object({
  messageId: z.string().nullish(),
  threadId: z.string().nullish(),
  subject: z.string().nullish(),
  sender: z.string().nullish(),
  to: z.string().nullish(),
  snippet: z.string().nullish(),
  messageText: z.string().nullish(),
  preview: messagePreview.nullish(),
  messageTimestamp: z.string().nullish(),
  labelIds: z.array(z.string()).nullish(),
});

/** First non-empty, trimmed string among the candidates, or `null`. */
const firstText = (...values: (string | null | undefined)[]): string | null => {
  for (const value of values) {
    const text = value?.trim();
    if (text) return text;
  }
  return null;
};

export const emailListOutputSchema = envelope(
  z.object({
    messages: z.array(messageBody).nullish(),
  }),
).transform(({ data }) => ({
  emails: (data.messages ?? []).map((message) => ({
    id: message.messageId ?? null,
    subject: firstText(message.subject, message.preview?.subject),
    from: message.sender ?? null,
    preview: firstText(
      message.preview?.body,
      message.preview?.snippet,
      message.snippet,
      message.messageText,
    ),
  })),
}));
export type EmailListOutput = z.infer<typeof emailListOutputSchema>;

export const messageIdListOutputSchema = envelope(
  z.object({
    messages: z
      .array(z.object({ id: z.string(), threadId: z.string() }))
      .nullish(),
  }),
).transform(({ data }) => ({ messages: data.messages ?? [] }));
export type MessageIdListOutput = z.infer<typeof messageIdListOutputSchema>;

export const emailOutputSchema = envelope(messageBody.nullish()).transform(
  ({ data }) => ({
    email: data
      ? {
          id: data.messageId ?? null,
          threadId: data.threadId ?? null,
          subject: firstText(data.subject, data.preview?.subject),
          from: data.sender ?? null,
          to: data.to ?? null,
          body: firstText(
            data.messageText,
            data.preview?.body,
            data.preview?.snippet,
            data.snippet,
          ),
          date: data.messageTimestamp ?? null,
          labels: data.labelIds ?? [],
        }
      : null,
  }),
);
export type EmailOutput = z.infer<typeof emailOutputSchema>;

export const labelListOutputSchema = envelope(
  z.object({
    labels: z
      .array(
        z.object({
          id: z.string().nullish(),
          name: z.string().nullish(),
          type: z.string().nullish(),
        }),
      )
      .nullish(),
  }),
).transform(({ data }) => ({ labels: data.labels ?? [] }));
export type LabelListOutput = z.infer<typeof labelListOutputSchema>;
