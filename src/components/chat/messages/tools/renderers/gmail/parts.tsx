import type { FC, ReactNode } from "react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import type { GmailMessagesOutput } from "@/lib/ai/tools/gmail";
import { cn } from "@/lib/utils";
import { Chip, EmptyNote, ErrorNote, ListRow, RowList } from "../../primitives";
import {
  formatEmailDate,
  senderEmail,
  senderName,
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

export const IdRow: FC<{ email: Email }> = ({ email }) => (
  <ListRow>
    <div className="flex min-w-0 items-baseline gap-2">
      <span className="min-w-0 truncate font-mono text-[11px] text-foreground/80">
        {email.id ?? "Unknown message"}
      </span>
      {email.threadId ? (
        <span className="ml-auto shrink-0 truncate font-mono text-[10px] text-muted-foreground/40">
          {email.threadId}
        </span>
      ) : null}
    </div>
  </ListRow>
);

export const MessagesDetail: FC<{
  block: ToolCallBlock;
  output: GmailMessagesOutput | null;
  emptyLabel: string;
  executingLabel?: string;
  idOnly?: boolean;
}> = ({ block, output, emptyLabel, executingLabel = "Fetching…", idOnly }) => {
  if (output?.error) return <ErrorNote>{output.error}</ErrorNote>;

  if (block.state === "executing")
    return <EmptyNote>{executingLabel}</EmptyNote>;

  const messages = output?.messages ?? [];
  if (messages.length === 0) return <EmptyNote>{emptyLabel}</EmptyNote>;

  return (
    <RowList maxHeightClass="max-h-72">
      {messages.map((email, index) =>
        idOnly ? (
          <IdRow key={email.id ?? index} email={email} />
        ) : (
          <MessageRow key={email.id ?? index} email={email} />
        ),
      )}
    </RowList>
  );
};
