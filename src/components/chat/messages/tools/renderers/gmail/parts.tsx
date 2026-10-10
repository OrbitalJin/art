import type { FC } from "react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import { cn } from "@/lib/utils";
import {
  Chip,
  EmptyNote,
  ErrorNote,
  ListRow,
  MetaLine,
  RowList,
} from "../../primitives";
import {
  errorOf,
  formatEmailDate,
  messagesOf,
  senderEmail,
  senderName,
  toEmail,
  type Email,
} from "./helpers";

export const LabelChips: FC<{ labels: string[] }> = ({ labels }) => {
  if (labels.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {labels.map((label) => (
        <Chip key={label} mono>
          {label}
        </Chip>
      ))}
    </div>
  );
};

export const MessageRow: FC<{ email: Email }> = ({ email }) => {
  const title = email.subject ?? "(no subject)";
  const sender = email.sender ? senderName(email.sender) : null;
  const address = email.sender ? senderEmail(email.sender) : null;
  const date = formatEmailDate(email.date);

  const titleClasses = cn(
    "min-w-0 truncate text-[12px] font-medium",
    email.unread ? "text-foreground/95" : "text-foreground/80",
  );

  return (
    <ListRow>
      <div className="flex min-w-0 items-center gap-2">
        {email.unread ? (
          <span
            aria-hidden
            title="Unread"
            className="size-1.5 shrink-0 rounded-full bg-primary/70"
          />
        ) : null}
        <span className={titleClasses} title={title}>
          {title}
        </span>
        {email.starred ? (
          <span aria-hidden className="shrink-0 text-[10px] text-amber-500/80">
            ★
          </span>
        ) : null}
        {date ? (
          <span className="ml-auto shrink-0 text-[10px] tabular-nums text-muted-foreground/50">
            {date}
          </span>
        ) : null}
      </div>

      {sender || address ? (
        <span className="truncate text-[10px] text-muted-foreground/50">
          {[sender, address].filter(Boolean).join(" · ")}
        </span>
      ) : null}

      {email.snippet ? (
        <p className="line-clamp-3 text-[11px] leading-snug text-muted-foreground/70">
          {email.snippet}
        </p>
      ) : null}

      <LabelChips labels={email.labels} />
    </ListRow>
  );
};

export const IdRow: FC<{ record: Record<string, unknown> }> = ({ record }) => {
  const id =
    typeof record.id === "string" || typeof record.messageId === "string"
      ? ((record.id ?? record.messageId) as string)
      : null;
  const threadId =
    typeof record.threadId === "string" ? record.threadId : null;

  return (
    <ListRow>
      <span className="truncate font-mono text-[12px] text-foreground/80">
        {id ?? "Unknown message"}
      </span>
      <MetaLine items={[threadId ? `thread ${threadId}` : null]} />
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

  if (block.state === "executing") return <EmptyNote>{executingLabel}</EmptyNote>;

  const messages = messagesOf(block.output);
  if (messages.length === 0) return <EmptyNote>{emptyLabel}</EmptyNote>;

  return (
    <RowList maxHeightClass="max-h-72">
      {messages.map((record, index) => (
        <MessageRow key={toEmail(record).id ?? index} email={toEmail(record)} />
      ))}
    </RowList>
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
