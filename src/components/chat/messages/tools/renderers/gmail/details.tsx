import type { FC } from "react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import { EmptyNote, ErrorNote } from "../../primitives";
import {
  errorOf,
  formatFullEmailDate,
  messageOf,
  messagesOf,
  senderEmail,
  senderName,
  toEmail,
} from "./helpers";
import {
  HeaderLine,
  LabelChips,
  MessageIdsDetail,
  MessagesDetail,
  StarMark,
  ThreadMessagesDetail,
  UnreadDot,
} from "./parts";

export const FetchEmailsDetail: FC<{ block: ToolCallBlock }> = ({ block }) => (
  <MessagesDetail
    block={block}
    emptyLabel="No emails found."
    executingLabel="Searching…"
  />
);

export const ListMessagesDetail: FC<{ block: ToolCallBlock }> = ({ block }) => (
  <MessageIdsDetail block={block} />
);

export const ThreadDetail: FC<{ block: ToolCallBlock }> = ({ block }) => (
  <ThreadMessagesDetail block={block} />
);

export const SingleMessageDetail: FC<{ block: ToolCallBlock }> = ({
  block,
}) => {
  const error = errorOf(block.output);
  if (error) return <ErrorNote>{error}</ErrorNote>;

  if (block.state === "executing") return <EmptyNote>Loading…</EmptyNote>;

  const messages = messagesOf(block.output);
  const email = toEmail(messageOf(block.output));
  if (!email.id && !email.subject && messages.length === 0) {
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
