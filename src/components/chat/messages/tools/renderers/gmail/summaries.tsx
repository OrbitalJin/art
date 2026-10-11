import type { FC } from "react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import { ResultBadge, SummaryRow, SummaryText } from "../../primitives";
import { asArray, asRecord, formatCount, getString } from "../../helpers";
import { errorOf, messageOf, messagesOf, senderName, toEmail } from "./helpers";

const queryOf = (input: unknown): string | null => {
  const record = asRecord(input);
  const query = getString(record, "query");
  if (query) return query;

  const labels = asArray(record?.label_ids)
    .filter((label): label is string => typeof label === "string")
    .join(", ");
  return labels || null;
};

const CountSummary: FC<{ block: ToolCallBlock; noun: string }> = ({
  block,
  noun,
}) => {
  const query = queryOf(block.input);
  const error = errorOf(block.output);
  const messages = messagesOf(block.output);

  return (
    <SummaryRow>
      {query ? <SummaryText title={query}>{query}</SummaryText> : null}
      {error ? (
        <ResultBadge tone="error">failed</ResultBadge>
      ) : block.state !== "executing" ? (
        <ResultBadge>{formatCount(messages.length, noun)}</ResultBadge>
      ) : null}
    </SummaryRow>
  );
};

export const FetchEmailsSummary: FC<{ block: ToolCallBlock }> = ({ block }) => (
  <CountSummary block={block} noun="email" />
);

export const ListMessagesSummary: FC<{ block: ToolCallBlock }> = ({
  block,
}) => <CountSummary block={block} noun="message" />;

export const MessageSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const error = errorOf(block.output);
  const email = toEmail(messageOf(block.output));
  const fallback = getString(asRecord(block.input), "message_id");

  const label = email.subject ?? fallback;
  const sender = email.sender ? senderName(email.sender) : null;
  const isLoaded = email.id !== null && block.state !== "executing";

  return (
    <SummaryRow>
      {label ? <SummaryText title={label}>{label}</SummaryText> : null}
      {error ? (
        <ResultBadge tone="error">failed</ResultBadge>
      ) : isLoaded ? (
        <ResultBadge>{sender ?? "read"}</ResultBadge>
      ) : null}
    </SummaryRow>
  );
};

export const ThreadSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const error = errorOf(block.output);
  const threadId = getString(asRecord(block.input), "thread_id");
  const messages = messagesOf(block.output);
  const subject = toEmail(messages[0]).subject;

  return (
    <SummaryRow>
      {subject ? (
        <SummaryText title={subject}>{subject}</SummaryText>
      ) : threadId ? (
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
