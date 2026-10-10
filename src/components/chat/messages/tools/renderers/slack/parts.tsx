import type { FC } from "react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import {
  Chip,
  EmptyNote,
  ErrorNote,
  ListRow,
  MetaLine,
  RowList,
} from "../../primitives";
import {
  channelsOf,
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

export const ChannelRow: FC<{ channel: Channel }> = ({ channel }) => {
  const title = channel.name ?? channel.id ?? "Unknown channel";

  return (
    <ListRow>
      <div className="flex min-w-0 items-center gap-2">
        <span aria-hidden className="shrink-0 text-muted-foreground/50">
          #
        </span>
        <span
          className="min-w-0 truncate text-[12px] font-medium text-foreground/80"
          title={title}
        >
          {title}
        </span>
        {channel.isPrivate ? <Chip>private</Chip> : null}
        {channel.isArchived ? <Chip>archived</Chip> : null}
        {channel.memberCount !== null ? (
          <span className="ml-auto shrink-0 text-[10px] tabular-nums text-muted-foreground/50">
            {channel.memberCount} members
          </span>
        ) : null}
      </div>

      {channel.topic || channel.purpose ? (
        <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground/70">
          {channel.topic ?? channel.purpose}
        </p>
      ) : null}

      <MetaLine items={[channel.id]} />
    </ListRow>
  );
};

export const MessageRow: FC<{ message: SlackMessage }> = ({ message }) => {
  const author = message.username ?? message.user ?? "Unknown";
  const date = formatSlackTs(message.ts);

  return (
    <ListRow>
      <div className="flex min-w-0 items-center gap-2">
        <span className="min-w-0 truncate text-[11px] font-medium text-foreground/80">
          {author}
        </span>
        {message.channel ? (
          <span className="shrink-0 text-[10px] text-muted-foreground/50">
            #{message.channel}
          </span>
        ) : null}
        {date ? (
          <span className="ml-auto shrink-0 text-[10px] tabular-nums text-muted-foreground/50">
            {date}
          </span>
        ) : null}
      </div>

      {message.text ? (
        <p className="line-clamp-4 whitespace-pre-wrap text-[11px] leading-snug text-foreground/75">
          {message.text}
        </p>
      ) : null}

      {message.replyCount ? (
        <MetaLine items={[`${message.replyCount} replies`]} />
      ) : null}
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

      <MetaLine items={[handle, user.email, user.id]} />
    </ListRow>
  );
};

export const ChannelsDetail: FC<{
  block: ToolCallBlock;
  emptyLabel: string;
  executingLabel?: string;
}> = ({ block, emptyLabel, executingLabel = "Fetching…" }) => {
  const error = errorOf(block.output);
  if (error) return <ErrorNote>{error}</ErrorNote>;

  if (block.state === "executing") return <EmptyNote>{executingLabel}</EmptyNote>;

  const channels = channelsOf(block.output);
  if (channels.length === 0) return <EmptyNote>{emptyLabel}</EmptyNote>;

  return (
    <RowList maxHeightClass="max-h-72">
      {channels.map((record, index) => (
        <ChannelRow
          key={toChannel(record).id ?? index}
          channel={toChannel(record)}
        />
      ))}
    </RowList>
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
        <MessageRow
          key={toMessage(record).id ?? index}
          message={toMessage(record)}
        />
      ))}
    </RowList>
  );
};

export const UsersDetail: FC<{
  block: ToolCallBlock;
  emptyLabel: string;
  executingLabel?: string;
}> = ({ block, emptyLabel, executingLabel = "Fetching…" }) => {
  const error = errorOf(block.output);
  if (error) return <ErrorNote>{error}</ErrorNote>;

  if (block.state === "executing") return <EmptyNote>{executingLabel}</EmptyNote>;

  const users = usersOf(block.output);
  if (users.length === 0) return <EmptyNote>{emptyLabel}</EmptyNote>;

  return (
    <RowList maxHeightClass="max-h-72">
      {users.map((record, index) => (
        <UserRow key={toUser(record).id ?? index} user={toUser(record)} />
      ))}
    </RowList>
  );
};
