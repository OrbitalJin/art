import type { FC } from "react";
import type {
  GmailMessageOutput,
  GmailMessagesOutput,
} from "@/lib/ai/tools/gmail";
import type { RendererProps } from "../../types";
import { EmptyNote, ErrorNote } from "../../primitives";
import { formatFullEmailDate, senderEmail, senderName } from "./helpers";
import {
  HeaderLine,
  LabelChips,
  MessagesDetail,
  StarMark,
  UnreadDot,
} from "./parts";

export const FetchEmailsDetail: FC<RendererProps<GmailMessagesOutput>> = ({
  block,
  output,
}) => (
  <MessagesDetail
    block={block}
    output={output}
    emptyLabel="No emails found."
    executingLabel="Searching…"
  />
);

export const ListMessagesDetail: FC<RendererProps<GmailMessagesOutput>> = ({
  block,
  output,
}) => (
  <MessagesDetail
    block={block}
    output={output}
    emptyLabel="No messages found."
    executingLabel="Fetching…"
    idOnly
  />
);

export const SingleMessageDetail: FC<RendererProps<GmailMessageOutput>> = ({
  block,
  output,
}) => {
  if (output?.error) return <ErrorNote>{output.error}</ErrorNote>;

  if (block.state === "executing") return <EmptyNote>Loading…</EmptyNote>;

  const email = output?.message ?? null;
  if (!email || (!email.id && !email.subject)) {
    return <EmptyNote>Message not found.</EmptyNote>;
  }

  const subject = email.subject ?? "(no subject)";
  const senderDisplayName = email.sender ? senderName(email.sender) : null;
  const senderAddress = email.sender ? senderEmail(email.sender) : null;
  const showSenderAddress =
    senderAddress !== null && senderAddress !== senderDisplayName;
  const date = formatFullEmailDate(email.date);
  const body = email.body ?? email.snippet;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex min-w-0 items-center gap-2">
        {email.unread ? <UnreadDot /> : null}
        <span
          className="min-w-0 truncate text-[12px] font-medium text-foreground/90"
          title={subject}
        >
          {subject}
        </span>
        {email.starred ? <StarMark /> : null}
      </div>

      <div className="flex flex-col gap-1">
        {email.sender ? (
          <HeaderLine label="From">
            {senderDisplayName}
            {showSenderAddress ? (
              <span className="ml-1.5 text-[10px] text-muted-foreground/40">
                {senderAddress}
              </span>
            ) : null}
          </HeaderLine>
        ) : null}
        {email.recipient ? (
          <HeaderLine label="To">{email.recipient}</HeaderLine>
        ) : null}
        {date ? <HeaderLine label="Date">{date}</HeaderLine> : null}
      </div>

      <LabelChips labels={email.labels} />

      {body ? (
        <div className="max-h-72 overflow-y-auto whitespace-pre-wrap break-words rounded-md border border-border/40 bg-muted/20 px-2.5 py-2 text-[11px] leading-relaxed text-muted-foreground/80">
          {body}
        </div>
      ) : null}
    </div>
  );
};
