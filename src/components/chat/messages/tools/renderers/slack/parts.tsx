import type { FC, ReactNode } from "react";
import { Lock } from "lucide-react";
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
import { formatCount } from "../../helpers";
import {
  channelsOf,
  cleanSlackText,
  errorOf,
  formatSlackTs,
  messagesOf,
  toChannel,
  toMessage,
  toUser,
  usersOf,
  type Channel,
  type SlackMessage,
  type SlackUser,
} from "./helpers";

export const DetailGate: FC<{
  block: ToolCallBlock;
  executingLabel: string;
  children: ReactNode;
}> = ({ block, executingLabel, children }) => {
  const error = errorOf(block.output);
  if (error) return <ErrorNote>{error}</ErrorNote>;

  if (block.state === "executing") {
    return <EmptyNote>{executingLabel}</EmptyNote>;
  }

  return <>{children}</>;
};

export const DetailTitle: FC<{ title: string; children?: ReactNode }> = ({
  title,
  children,
}) => (
  <div className="flex min-w-0 items-center gap-2">
    <span
      className="min-w-0 truncate text-[12px] font-medium text-foreground/90"
      title={title}
    >
      {title}
    </span>
    {children}
  </div>
);

export const DetailSubtitle: FC<{ children: ReactNode }> = ({ children }) => (
  <p className="truncate text-[10px] text-muted-foreground/50">{children}</p>
);

export const HeaderLine: FC<{
  label: string;
  mono?: boolean;
  children: ReactNode;
}> = ({ label, mono, children }) => {
  const valueClasses = cn(
    "min-w-0 break-words text-[11px] text-foreground/70",
    mono && "font-mono text-[10px]",
  );

  return (
    <div className="flex min-w-0 items-baseline gap-2">
      <span className="w-14 shrink-0 text-[10px] text-muted-foreground/50">
        {label}
      </span>
      <span className={valueClasses}>{children}</span>
    </div>
  );
};

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

export const ChannelRow: FC<{ channel: Channel }> = ({ channel }) => {
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

const ChannelsList: FC<{ block: ToolCallBlock; emptyLabel: string }> = ({
  block,
  emptyLabel,
}) => {
  const channels = channelsOf(block.output);
  if (channels.length === 0) return <EmptyNote>{emptyLabel}</EmptyNote>;

  return (
    <RowList maxHeightClass="max-h-72">
      {channels.map((record, index) => {
        const channel = toChannel(record);
        return <ChannelRow key={channel.id ?? index} channel={channel} />;
      })}
    </RowList>
  );
};

const MessagesList: FC<{ block: ToolCallBlock; emptyLabel: string }> = ({
  block,
  emptyLabel,
}) => {
  const messages = messagesOf(block.output);
  if (messages.length === 0) return <EmptyNote>{emptyLabel}</EmptyNote>;

  return (
    <RowList maxHeightClass="max-h-72">
      {messages.map((record, index) => {
        const message = toMessage(record);
        return <MessageRow key={message.id ?? index} message={message} />;
      })}
    </RowList>
  );
};

const UsersList: FC<{ block: ToolCallBlock; emptyLabel: string }> = ({
  block,
  emptyLabel,
}) => {
  const users = usersOf(block.output);
  if (users.length === 0) return <EmptyNote>{emptyLabel}</EmptyNote>;

  return (
    <RowList maxHeightClass="max-h-72">
      {users.map((record, index) => {
        const user = toUser(record);
        return <UserRow key={user.id ?? index} user={user} />;
      })}
    </RowList>
  );
};

export const ChannelsDetail: FC<{
  block: ToolCallBlock;
  emptyLabel: string;
  executingLabel?: string;
}> = ({ block, emptyLabel, executingLabel = "Fetching…" }) => (
  <DetailGate block={block} executingLabel={executingLabel}>
    <ChannelsList block={block} emptyLabel={emptyLabel} />
  </DetailGate>
);

export const MessagesDetail: FC<{
  block: ToolCallBlock;
  emptyLabel: string;
  executingLabel?: string;
}> = ({ block, emptyLabel, executingLabel = "Fetching…" }) => (
  <DetailGate block={block} executingLabel={executingLabel}>
    <MessagesList block={block} emptyLabel={emptyLabel} />
  </DetailGate>
);

export const UsersDetail: FC<{
  block: ToolCallBlock;
  emptyLabel: string;
  executingLabel?: string;
}> = ({ block, emptyLabel, executingLabel = "Fetching…" }) => (
  <DetailGate block={block} executingLabel={executingLabel}>
    <UsersList block={block} emptyLabel={emptyLabel} />
  </DetailGate>
);
