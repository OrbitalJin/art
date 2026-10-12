import type { FC } from "react";
import type {
  GmailMessageOutput,
  GmailMessagesOutput,
} from "@/lib/ai/tools/gmail";
import type { RendererProps } from "../../types";
import { ResultBadge, SummaryRow, SummaryText } from "../../primitives";
import { asArray, asRecord, formatCount, getString } from "../../helpers";
import { senderName } from "./helpers";

const queryOf = (input: unknown): string | null => {
  const record = asRecord(input);
  const query = getString(record, "query") ?? getString(record, "q");
  if (query) return query;

  const labels = asArray(record?.label_ids)
    .filter((label): label is string => typeof label === "string")
    .join(", ");
  return labels || null;
};

const CountSummary: FC<
  RendererProps<GmailMessagesOutput> & { noun: string }
> = ({ block, output, noun }) => {
  const query = queryOf(block.input);
  const messages = output?.messages ?? [];

  return (
    <SummaryRow>
      {query ? <SummaryText title={query}>{query}</SummaryText> : null}
      {output?.error ? (
        <ResultBadge tone="error">failed</ResultBadge>
      ) : block.state !== "executing" ? (
        <ResultBadge>{formatCount(messages.length, noun)}</ResultBadge>
      ) : null}
    </SummaryRow>
  );
};

export const FetchEmailsSummary: FC<RendererProps<GmailMessagesOutput>> = (
  props,
) => <CountSummary {...props} noun="email" />;

export const ListMessagesSummary: FC<RendererProps<GmailMessagesOutput>> = (
  props,
) => <CountSummary {...props} noun="message" />;

export const MessageSummary: FC<RendererProps<GmailMessageOutput>> = ({
  block,
  output,
}) => {
  const email = output?.message ?? null;
  const fallback = getString(asRecord(block.input), "message_id");

  const label = email?.subject ?? fallback;
  const sender = email?.sender ? senderName(email.sender) : null;
  const isLoaded = email?.id != null && block.state !== "executing";

  return (
    <SummaryRow>
      {label ? <SummaryText title={label}>{label}</SummaryText> : null}
      {output?.error ? (
        <ResultBadge tone="error">failed</ResultBadge>
      ) : isLoaded ? (
        <ResultBadge>{sender ?? "read"}</ResultBadge>
      ) : null}
    </SummaryRow>
  );
};
