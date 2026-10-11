import type { FC, ReactNode } from "react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import { cn } from "@/lib/utils";
import { Chip, EmptyNote, ErrorNote, ListRow, RowList } from "../../primitives";
import { getString } from "../../helpers";
import {
  errorOf,
  formatEmailDate,
  messagesOf,
  senderEmail,
  senderName,
  toEmail,
  visibleLabels,
  type Email,
} from "./helpers";

export const UnreadDot: FC = () => (
  <span
    aria-hidden
    title="Unread"
    className="size-1.5 shrink-0 rounded-full bg-primary/70"
  />
);

export const StarMark: FC = () => (
  <span aria-hidden className="shrink-0 text-[10px] text-amber-500/80">
    ★
  </span>
);

export const DateStamp: FC<{ value: string | null }> = ({ value }) => {
  if (!value) return null;

  return (
    <span className="ml-auto shrink-0 text-[10px] tabular-nums text-muted-foreground/50">
      {value}
    </span>
  );
};

export const SenderLine: FC<{ sender: string | null }> = ({ sender }) => {
  if (!sender) return null;

  const name = senderName(sender);
  const address = senderEmail(sender);
  const showAddress = address !== null && address !== name;

  return (
    <div className="flex min-w-0 items-baseline gap-1.5 text-[10px]">
      <span className="truncate text-muted-foreground/70">{name}</span>
      {showAddress ? (
        <span className="truncate text-muted-foreground/40">{address}</span>
      ) : null}
    </div>
  );
};

export const HeaderLine: FC<{ label: string; children: ReactNode }> = ({
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

export const LabelChips: FC<{ labels: string[] }> = ({ labels }) => {
  const visible = visibleLabels(labels);
  if (visible.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((label) => (
        <Chip key={label}>{label}</Chip>
      ))}
    </div>
  );
};

export const MessageRow: FC<{ email: Email }> = ({ email }) => {
  const title = email.subject ?? "(no subject)";
  const date = formatEmailDate(email.date);

  const titleClasses = cn(
    "min-w-0 truncate text-[12px] font-medium",
    email.unread ? "text-foreground/95" : "text-foreground/80",
  );

  return (
    <ListRow>
      <div className="flex min-w-0 items-center gap-2">
        {email.unread ? <UnreadDot /> : null}
        <span className={titleClasses} title={title}>
          {title}
        </span>
        {email.starred ? <StarMark /> : null}
        <DateStamp value={date} />
      </div>

      <SenderLine sender={email.sender} />

      {email.snippet ? (
        <p className="line-clamp-3 text-[11px] leading-snug text-muted-foreground/70">
          {email.snippet}
        </p>
      ) : null}

      <LabelChips labels={email.labels} />
    </ListRow>
  );
};

export const ThreadMessageRow: FC<{ email: Email }> = ({ email }) => {
  const name = email.sender ? senderName(email.sender) : "Unknown sender";
  const address = email.sender ? senderEmail(email.sender) : null;
  const date = formatEmailDate(email.date);

  const nameClasses = cn(
    "min-w-0 truncate text-[12px] font-medium",
    email.unread ? "text-foreground/95" : "text-foreground/80",
  );

  return (
    <ListRow>
      <div className="flex min-w-0 items-center gap-2">
        {email.unread ? <UnreadDot /> : null}
        <span className={nameClasses} title={address ?? name}>
          {name}
        </span>
        {email.starred ? <StarMark /> : null}
        <DateStamp value={date} />
      </div>

      {email.snippet ? (
        <p className="line-clamp-3 text-[11px] leading-snug text-muted-foreground/70">
          {email.snippet}
        </p>
      ) : null}
    </ListRow>
  );
};

export const IdRow: FC<{ record: Record<string, unknown> }> = ({ record }) => {
  const id = getString(record, "id") ?? getString(record, "messageId");
  const threadId = getString(record, "threadId");

  return (
    <ListRow>
      <div className="flex min-w-0 items-baseline gap-2">
        <span className="min-w-0 truncate font-mono text-[11px] text-foreground/80">
          {id ?? "Unknown message"}
        </span>
        {threadId ? (
          <span className="ml-auto shrink-0 truncate font-mono text-[10px] text-muted-foreground/40">
            {threadId}
          </span>
        ) : null}
      </div>
    </ListRow>
  );
};

export const MessagesDetail: FC<{
  block: ToolCallBlock;
  emptyLabel: string;
  executingLabel?: string;
}> = ({ block, emptyLabel, executingLabel = "Fetching…" }) => {
  const error = errorOf(block.output);
  if (error) return <ErrorNote>{error}</ErrorNote>;

  if (block.state === "executing")
    return <EmptyNote>{executingLabel}</EmptyNote>;

  const messages = messagesOf(block.output);
  if (messages.length === 0) return <EmptyNote>{emptyLabel}</EmptyNote>;

  return (
    <RowList maxHeightClass="max-h-72">
      {messages.map((record, index) => {
        const email = toEmail(record);
        return <MessageRow key={email.id ?? index} email={email} />;
      })}
    </RowList>
  );
};

export const ThreadMessagesDetail: FC<{ block: ToolCallBlock }> = ({
  block,
}) => {
  const error = errorOf(block.output);
  if (error) return <ErrorNote>{error}</ErrorNote>;

  if (block.state === "executing") return <EmptyNote>Fetching…</EmptyNote>;

  const messages = messagesOf(block.output);
  if (messages.length === 0) {
    return <EmptyNote>No messages in thread.</EmptyNote>;
  }

  const subject = toEmail(messages[0]).subject ?? "(no subject)";

  return (
    <div className="flex flex-col gap-2">
      <p
        className="truncate text-[12px] font-medium text-foreground/85"
        title={subject}
      >
        {subject}
      </p>
      <RowList maxHeightClass="max-h-72">
        {messages.map((record, index) => {
          const email = toEmail(record);
          return <ThreadMessageRow key={email.id ?? index} email={email} />;
        })}
      </RowList>
    </div>
  );
};

export const MessageIdsDetail: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const error = errorOf(block.output);
  if (error) return <ErrorNote>{error}</ErrorNote>;

  if (block.state === "executing") return <EmptyNote>Fetching…</EmptyNote>;

  const messages = messagesOf(block.output);
  if (messages.length === 0) return <EmptyNote>No messages found.</EmptyNote>;

  return (
    <RowList maxHeightClass="max-h-72">
      {messages.map((record, index) => (
        <IdRow key={index} record={record} />
      ))}
    </RowList>
  );
};
