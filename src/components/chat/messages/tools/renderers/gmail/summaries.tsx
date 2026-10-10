import type { FC } from "react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import { ResultBadge, SummaryRow, SummaryText } from "../../primitives";
import { asArray, asRecord, formatCount, getString } from "../../helpers";
import { errorOf, messageOf, messagesOf, toEmail } from "./helpers";

const queryOf = (input: unknown): string | null => {
  const record = asRecord(input);
  const query = getString(record, "query");
  if (query) return query;

  const labels = asArray(record?.label_ids)
    .filter((label): label is string => typeof label === "string")
    .join(", ");
  return labels || null;
};

export const FetchEmailsSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const query = queryOf(block.input);
  const error = errorOf(block.output);
  const messages = messagesOf(block.output);

  return (
    <SummaryRow>
      {query ? <SummaryText title={query}>{query}</SummaryText> : null}
      {error ? (
        <ResultBadge tone="error">failed</ResultBadge>
      ) : block.state !== "executing" ? (
        <ResultBadge>{formatCount(messages.length, "email")}</ResultBadge>
      ) : null}
    </SummaryRow>
  );
};

export const ListMessagesSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const query = queryOf(block.input);
  const error = errorOf(block.output);
  const messages = messagesOf(block.output);

  return (
    <SummaryRow>
      {query ? <SummaryText title={query}>{query}</SummaryText> : null}
      {error ? (
        <ResultBadge tone="error">failed</ResultBadge>
      ) : block.state !== "executing" ? (
        <ResultBadge>{formatCount(messages.length, "message")}</ResultBadge>
      ) : null}
    </SummaryRow>
  );
};

export const MessageSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const error = errorOf(block.output);
  const email = toEmail(messageOf(block.output));
  const fallback = getString(asRecord(block.input), "message_id");

  return (
    <SummaryRow>
      {email.subject ?? fallback ? (
        <SummaryText title={email.subject ?? fallback ?? undefined}>
          {email.subject ?? fallback}
        </SummaryText>
      ) : null}
      {error ? (
        <ResultBadge tone="error">failed</ResultBadge>
      ) : email.id && block.state !== "executing" ? (
        <ResultBadge>read</ResultBadge>
      ) : null}
    </SummaryRow>
  );
};

export const ThreadSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const error = errorOf(block.output);
  const threadId = getString(asRecord(block.input), "thread_id");
  const messages = messagesOf(block.output);

  return (
    <SummaryRow>
      {threadId ? (
        <SummaryText mono title={threadId}>
          {threadId}
        </SummaryText>
      ) : null}
      {error ? (
        <ResultBadge tone="error">failed</ResultBadge>
      ) : block.state !== "executing" ? (
        <ResultBadge>{formatCount(messages.length, "message")}</ResultBadge>
      ) : null}
    </SummaryRow>
  );
};
