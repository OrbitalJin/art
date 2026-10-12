import type { FC } from "react";
import { Lock } from "lucide-react";
import type {
  SlackChannel,
  SlackChannelsOutput,
  SlackMessage,
  SlackMessagesOutput,
  SlackUser,
  SlackUsersOutput,
} from "@/lib/ai/tools/slack";
import { cn } from "@/lib/utils";
import type { ToolCallBlock } from "@/lib/store/session/types";
import {
  Chip,
  DetailGate,
  EmptyNote,
  ListRow,
  MetaLine,
  RowList,
} from "../../primitives";
import { formatCount } from "../../helpers";
import {
  cleanSlackText,
  formatSlackTs,
} from "./helpers";

const ChannelMark: FC<{ isPrivate: boolean }> = ({ isPrivate }) => {
  if (isPrivate) {
    return (
      <Lock aria-hidden className="size-3 shrink-0 text-muted-foreground/50" />
    );
  }

  return (
    <span aria-hidden className="shrink-0 text-[12px] text-muted-foreground/50">
      #
    </span>
  );
};

const DateStamp: FC<{ value: string | null; href: string | null }> = ({
  value,
  href,
}) => {
  if (!value) return null;

  const classes =
    "ml-auto shrink-0 text-[10px] tabular-nums text-muted-foreground/50";

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={`${classes} outline-none hover:text-primary hover:underline focus-visible:underline`}
      >
        {value}
      </a>
    );
  }

  return <span className={classes}>{value}</span>;
};

const AuthorName: FC<{ username: string | null; userId: string | null }> = ({
  username,
  userId,
}) => {
  if (username) {
    return (
      <span
        className="min-w-0 truncate text-[12px] font-medium text-foreground/80"
        title={username}
      >
        {username}
      </span>
    );
  }

  return (
    <span
      className="min-w-0 truncate font-mono text-[11px] text-muted-foreground/60"
      title={userId ?? undefined}
    >
      {userId ?? "Unknown"}
    </span>
  );
};

export const ChannelRow: FC<{ channel: SlackChannel }> = ({ channel }) => {
  const title = channel.name ?? channel.id ?? "Unknown channel";
  const description = channel.topic ?? channel.purpose;

  const titleClasses = cn(
    "min-w-0 truncate text-[12px] font-medium",
    channel.isArchived ? "text-foreground/50" : "text-foreground/80",
  );

  return (
    <ListRow>
      <div className="flex min-w-0 items-center gap-2">
        <ChannelMark isPrivate={channel.isPrivate} />
        <span className={titleClasses} title={title}>
          {title}
        </span>
        {channel.isArchived ? <Chip>archived</Chip> : null}
        {channel.memberCount !== null ? (
          <span className="ml-auto shrink-0 text-[10px] tabular-nums text-muted-foreground/50">
            {formatCount(channel.memberCount, "member")}
          </span>
        ) : null}
      </div>

      {description ? (
        <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground/70">
          {description}
        </p>
      ) : null}
    </ListRow>
  );
};

export const MessageRow: FC<{ message: SlackMessage }> = ({ message }) => {
  const date = formatSlackTs(message.ts);
  const text = message.text ? cleanSlackText(message.text) : null;
  const replies =
    message.replyCount === 1 ? "1 reply" : `${message.replyCount} replies`;

  return (
    <ListRow>
      <div className="flex min-w-0 items-center gap-2">
        <AuthorName username={message.username} userId={message.user} />
        {message.channel ? (
          <span className="shrink-0 text-[10px] text-muted-foreground/50">
            #{message.channel}
          </span>
        ) : null}
        <DateStamp value={date} href={message.permalink} />
      </div>

      {text ? (
        <p className="line-clamp-4 whitespace-pre-wrap break-words text-[11px] leading-snug text-muted-foreground/70">
          {text}
        </p>
      ) : null}

      {message.replyCount ? <MetaLine items={[replies]} /> : null}
    </ListRow>
  );
};

export const UserRow: FC<{ user: SlackUser }> = ({ user }) => {
  const name =
    user.realName ?? user.displayName ?? user.name ?? user.id ?? "Unknown user";
  const handle = user.name && user.name !== name ? `@${user.name}` : null;

  return (
    <ListRow>
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="min-w-0 truncate text-[12px] font-medium text-foreground/80"
          title={name}
        >
          {name}
        </span>
        {user.isBot ? <Chip>bot</Chip> : null}
        {user.deleted ? <Chip>deactivated</Chip> : null}
      </div>

      <MetaLine items={[handle, user.title, user.email]} />
    </ListRow>
  );
};

export const ChannelsDetail: FC<{
  block: ToolCallBlock;
  output: SlackChannelsOutput | null;
  emptyLabel: string;
  executingLabel?: string;
}> = ({ block, output, emptyLabel, executingLabel = "Fetching…" }) => {
  const channels = output?.channels ?? [];

  return (
    <DetailGate block={block} executingLabel={executingLabel}>
      {channels.length === 0 ? (
        <EmptyNote>{emptyLabel}</EmptyNote>
      ) : (
        <RowList maxHeightClass="max-h-72">
          {channels.map((channel, index) => (
            <ChannelRow key={channel.id ?? index} channel={channel} />
          ))}
        </RowList>
      )}
    </DetailGate>
  );
};

export const MessagesDetail: FC<{
  block: ToolCallBlock;
  output: SlackMessagesOutput | null;
  emptyLabel: string;
  executingLabel?: string;
}> = ({ block, output, emptyLabel, executingLabel = "Fetching…" }) => {
  const messages = output?.messages ?? [];

  return (
    <DetailGate block={block} executingLabel={executingLabel}>
      {messages.length === 0 ? (
        <EmptyNote>{emptyLabel}</EmptyNote>
      ) : (
        <RowList maxHeightClass="max-h-72">
          {messages.map((message, index) => (
            <MessageRow key={message.id ?? index} message={message} />
          ))}
        </RowList>
      )}
    </DetailGate>
  );
};

export const UsersDetail: FC<{
  block: ToolCallBlock;
  output: SlackUsersOutput | null;
  emptyLabel: string;
  executingLabel?: string;
}> = ({ block, output, emptyLabel, executingLabel = "Fetching…" }) => {
  const users = output?.users ?? [];

  return (
    <DetailGate block={block} executingLabel={executingLabel}>
      {users.length === 0 ? (
        <EmptyNote>{emptyLabel}</EmptyNote>
      ) : (
        <RowList maxHeightClass="max-h-72">
          {users.map((user, index) => (
            <UserRow key={user.id ?? index} user={user} />
          ))}
        </RowList>
      )}
    </DetailGate>
  );
};
