import type { FC, ReactNode } from "react";
import { MailOpen } from "lucide-react";
import {
  Chip,
  EmptyNote,
  ResultBadge,
  SummaryRow,
  SummaryStatus,
  SummaryText,
} from "../../shared";
import type { RendererProps, ToolRenderer } from "../../types";
import { senderName } from "./helpers";
import { emailOutputSchema, gmailFetchMessageInput } from "./schema";
import type { EmailOutput, GmailFetchMessageInput } from "./schema";

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

const Summary: FC<RendererProps<GmailFetchMessageInput, EmailOutput>> = ({
  block,
  input,
  output,
}) => {
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

const Detail: FC<RendererProps<GmailFetchMessageInput, EmailOutput>> = ({
  block,
  output,
}) => {
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

export const renderer: ToolRenderer<GmailFetchMessageInput, EmailOutput> = {
  icon: MailOpen,
  title: "Read email",
  executingTitle: "Reading email",
  inputSchema: gmailFetchMessageInput,
  outputSchema: emailOutputSchema,
  Summary,
  Detail,
};
