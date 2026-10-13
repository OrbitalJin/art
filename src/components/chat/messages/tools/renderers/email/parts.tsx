import type { FC, ReactNode } from "react";
import {
  type EmailListOutput,
  type EmailOutput,
  type GmailFetchEmailsInput,
  type GmailFetchMessageInput,
  type GmailListLabelsInput,
  type GmailListMessagesInput,
  type LabelListOutput,
  type MessageIdListOutput,
} from "./schema";
import type { RendererProps } from "../../types";
import {
  Chip,
  EmptyNote,
  ListRow,
  ResultBadge,
  RowList,
  SummaryRow,
  SummaryStatus,
  SummaryText,
} from "../../primitives";
import { formatCount } from "../../helpers";

const senderName = (sender: string): string => {
  const match = sender.match(/^\s*"?([^"<]*?)"?\s*<[^>]+>\s*$/);
  return match?.[1]?.trim() || sender;
};

const HeaderLine: FC<{ label: string; children: ReactNode }> = ({
  label,
  children,
}) => (
  <div className="flex min-w-0 items-baseline gap-2">
    <span className="w-8 shrink-0 text-[10px] text-muted-foreground/50">
      {label}
    </span>
    <span className="min-w-0 truncate text-[11px] text-foreground/70">
      {children}
    </span>
  </div>
);

export const EmailListSummary: FC<
  RendererProps<GmailFetchEmailsInput, EmailListOutput>
> = ({ block, input, output }) => {
  const query = input?.query ?? null;
  const count = output?.emails.length ?? 0;

  return (
    <SummaryRow>
      {query ? <SummaryText title={query}>{query}</SummaryText> : null}
      <SummaryStatus block={block}>
        <ResultBadge>{formatCount(count, "email")}</ResultBadge>
      </SummaryStatus>
    </SummaryRow>
  );
};

export const EmailListDetail: FC<
  RendererProps<GmailFetchEmailsInput, EmailListOutput>
> = ({ block, output }) => {
  if (block.state === "executing") return <EmptyNote>Searching…</EmptyNote>;

  const emails = output?.emails ?? [];
  if (emails.length === 0) return <EmptyNote>No emails found.</EmptyNote>;

  return (
    <RowList maxHeightClass="max-h-72">
      {emails.map((email, index) => (
        <ListRow key={email.id ?? index}>
          <span
            className="min-w-0 truncate text-[12px] font-medium text-foreground/90"
            title={email.subject ?? undefined}
          >
            {email.subject ?? "(no subject)"}
          </span>

          {email.from ? (
            <span className="truncate text-[10px] text-muted-foreground/70">
              {senderName(email.from)}
            </span>
          ) : null}

          {email.preview ? (
            <p className="line-clamp-3 text-[11px] leading-snug text-muted-foreground/70">
              {email.preview}
            </p>
          ) : null}
        </ListRow>
      ))}
    </RowList>
  );
};

export const MessageIdListSummary: FC<
  RendererProps<GmailListMessagesInput, MessageIdListOutput>
> = ({ block, input, output }) => {
  const query = input?.q ?? null;
  const count = output?.messages.length ?? 0;

  return (
    <SummaryRow>
      {query ? <SummaryText title={query}>{query}</SummaryText> : null}
      <SummaryStatus block={block}>
        <ResultBadge>{formatCount(count, "id")}</ResultBadge>
      </SummaryStatus>
    </SummaryRow>
  );
};

export const MessageIdListDetail: FC<
  RendererProps<GmailListMessagesInput, MessageIdListOutput>
> = ({ block, output }) => {
  if (block.state === "executing") return <EmptyNote>Fetching…</EmptyNote>;

  const messages = output?.messages ?? [];
  if (messages.length === 0) return <EmptyNote>No messages found.</EmptyNote>;

  return (
    <RowList maxHeightClass="max-h-72">
      {messages.map((message) => (
        <ListRow key={message.id}>
          <div className="flex min-w-0 items-baseline gap-2">
            <span className="min-w-0 truncate font-mono text-[11px] text-foreground/80">
              {message.id}
            </span>
            <span className="ml-auto shrink-0 truncate font-mono text-[10px] text-muted-foreground/40">
              {message.threadId}
            </span>
          </div>
        </ListRow>
      ))}
    </RowList>
  );
};

export const EmailSummary: FC<
  RendererProps<GmailFetchMessageInput, EmailOutput>
> = ({ block, input, output }) => {
  const email = output?.email ?? null;
  const label = email?.subject ?? input?.message_id ?? input?.id ?? null;

  return (
    <SummaryRow>
      {label ? <SummaryText title={label}>{label}</SummaryText> : null}
      <SummaryStatus block={block}>
        <ResultBadge>
          {email?.from ? senderName(email.from) : "read"}
        </ResultBadge>
      </SummaryStatus>
    </SummaryRow>
  );
};

export const EmailDetail: FC<
  RendererProps<GmailFetchMessageInput, EmailOutput>
> = ({ block, output }) => {
  if (block.state === "executing") return <EmptyNote>Loading…</EmptyNote>;

  const email = output?.email ?? null;
  if (!email) return <EmptyNote>Message not found.</EmptyNote>;

  const subject = email.subject ?? "(no subject)";

  let date: string | null = null;
  if (email.date) {
    const numeric = /^\d+$/.test(email.date) ? Number(email.date) : null;
    const parsed = numeric !== null ? new Date(numeric) : new Date(email.date);
    date = Number.isNaN(parsed.getTime())
      ? email.date
      : parsed.toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
  }

  return (
    <div className="flex flex-col gap-2.5">
      <span
        className="min-w-0 truncate text-[12px] font-medium text-foreground/90"
        title={subject}
      >
        {subject}
      </span>

      <div className="flex flex-col gap-1">
        {email.from ? (
          <HeaderLine label="From">{senderName(email.from)}</HeaderLine>
        ) : null}
        {email.to ? <HeaderLine label="To">{email.to}</HeaderLine> : null}
        {date ? <HeaderLine label="Date">{date}</HeaderLine> : null}
      </div>

      {email.labels.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {email.labels.map((label) => (
            <Chip key={label}>{label}</Chip>
          ))}
        </div>
      ) : null}

      {email.body ? (
        <div className="max-h-72 overflow-y-auto rounded-md border border-border/40 bg-muted/20 px-2.5 py-2 text-[11px] leading-relaxed break-words whitespace-pre-wrap text-muted-foreground/80">
          {email.body}
        </div>
      ) : null}
    </div>
  );
};

export const LabelListSummary: FC<
  RendererProps<GmailListLabelsInput, LabelListOutput>
> = ({ block, output }) => {
  const count = output?.labels.length ?? 0;

  return (
    <SummaryRow>
      <SummaryStatus block={block}>
        <ResultBadge>{formatCount(count, "label")}</ResultBadge>
      </SummaryStatus>
    </SummaryRow>
  );
};

export const LabelListDetail: FC<
  RendererProps<GmailListLabelsInput, LabelListOutput>
> = ({ block, output }) => {
  if (block.state === "executing") return <EmptyNote>Loading…</EmptyNote>;

  const labels = output?.labels ?? [];
  if (labels.length === 0) return <EmptyNote>No labels found.</EmptyNote>;

  return (
    <div className="flex flex-wrap gap-1">
      {labels.map((label, index) => (
        <Chip key={label.id ?? index}>
          {label.name ?? label.id ?? "unknown"}
        </Chip>
      ))}
    </div>
  );
};
