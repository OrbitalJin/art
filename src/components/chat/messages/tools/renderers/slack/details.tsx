import type { FC } from "react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import { Chip, EmptyNote } from "../../primitives";
import {
  conversationOf,
  toChannel,
  toIdentity,
  toUser,
  userOf,
} from "./helpers";
import {
  ChannelsDetail,
  DetailGate,
  DetailSubtitle,
  DetailTitle,
  HeaderLine,
  MessagesDetail,
  UsersDetail,
} from "./parts";

const WhoAmIBody: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const identity = toIdentity(block.output);

  const hasIdentity =
    identity.userName !== null ||
    identity.teamName !== null ||
    identity.userId !== null;
  if (!hasIdentity) return <EmptyNote>No identity returned.</EmptyNote>;

  const subtitle = identity.teamName ?? identity.domain;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-0.5">
        <DetailTitle title={identity.userName ?? "Unknown user"} />
        {subtitle ? <DetailSubtitle>{subtitle}</DetailSubtitle> : null}
      </div>

      <div className="flex flex-col gap-1">
        {identity.url ? (
          <HeaderLine label="URL">
            <a
              href={identity.url}
              target="_blank"
              rel="noreferrer"
              className="outline-none hover:text-primary hover:underline focus-visible:underline"
            >
              {identity.url}
            </a>
          </HeaderLine>
        ) : null}
        {identity.userId ? (
          <HeaderLine label="User ID" mono>
            {identity.userId}
          </HeaderLine>
        ) : null}
        {identity.teamId ? (
          <HeaderLine label="Team ID" mono>
            {identity.teamId}
          </HeaderLine>
        ) : null}
      </div>
    </div>
  );
};

const ChannelInfoBody: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const channel = toChannel(conversationOf(block.output));

  if (!channel.name && !channel.id) {
    return <EmptyNote>Channel not found.</EmptyNote>;
  }

  const title = `#${channel.name ?? channel.id}`;

  return (
    <div className="flex flex-col gap-2.5">
      <DetailTitle title={title}>
        {channel.isPrivate ? <Chip>private</Chip> : null}
        {channel.isArchived ? <Chip>archived</Chip> : null}
      </DetailTitle>

      <div className="flex flex-col gap-1">
        {channel.memberCount !== null ? (
          <HeaderLine label="Members">
            {channel.memberCount.toLocaleString()}
          </HeaderLine>
        ) : null}
        {channel.topic ? (
          <HeaderLine label="Topic">{channel.topic}</HeaderLine>
        ) : null}
        {channel.purpose ? (
          <HeaderLine label="Purpose">{channel.purpose}</HeaderLine>
        ) : null}
        {channel.id ? (
          <HeaderLine label="ID" mono>
            {channel.id}
          </HeaderLine>
        ) : null}
      </div>
    </div>
  );
};

const UserBody: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const user = toUser(userOf(block.output));

  const name = user.realName ?? user.displayName ?? user.name;
  if (!name && !user.id && !user.email) {
    return <EmptyNote>User not found.</EmptyNote>;
  }

  const handle = user.name && user.name !== name ? `@${user.name}` : null;
  const showDisplayName =
    user.displayName !== null &&
    user.displayName !== name &&
    user.displayName !== user.name;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-0.5">
        <DetailTitle title={name ?? user.email ?? user.id ?? "Unknown user"}>
          {user.isBot ? <Chip>bot</Chip> : null}
          {user.deleted ? <Chip>deactivated</Chip> : null}
        </DetailTitle>
        {handle ? <DetailSubtitle>{handle}</DetailSubtitle> : null}
      </div>

      <div className="flex flex-col gap-1">
        {showDisplayName ? (
          <HeaderLine label="Display">{user.displayName}</HeaderLine>
        ) : null}
        {user.title ? (
          <HeaderLine label="Title">{user.title}</HeaderLine>
        ) : null}
        {user.email ? (
          <HeaderLine label="Email">{user.email}</HeaderLine>
        ) : null}
        {user.id ? (
          <HeaderLine label="ID" mono>
            {user.id}
          </HeaderLine>
        ) : null}
      </div>
    </div>
  );
};

export const WhoAmIDetail: FC<{ block: ToolCallBlock }> = ({ block }) => (
  <DetailGate block={block} executingLabel="Loading…">
    <WhoAmIBody block={block} />
  </DetailGate>
);

export const ChannelsListDetail: FC<{ block: ToolCallBlock }> = ({ block }) => (
  <ChannelsDetail
    block={block}
    emptyLabel="No channels found."
    executingLabel="Fetching channels…"
  />
);

export const ChannelInfoDetail: FC<{ block: ToolCallBlock }> = ({ block }) => (
  <DetailGate block={block} executingLabel="Loading…">
    <ChannelInfoBody block={block} />
  </DetailGate>
);

export const ConversationHistoryDetail: FC<{ block: ToolCallBlock }> = ({
  block,
}) => (
  <MessagesDetail
    block={block}
    emptyLabel="No messages found."
    executingLabel="Reading messages…"
  />
);

export const SearchDetail: FC<{ block: ToolCallBlock }> = ({ block }) => (
  <MessagesDetail
    block={block}
    emptyLabel="No matches found."
    executingLabel="Searching…"
  />
);

export const UsersListDetail: FC<{ block: ToolCallBlock }> = ({ block }) => (
  <UsersDetail
    block={block}
    emptyLabel="No users found."
    executingLabel="Fetching users…"
  />
);

export const UserDetail: FC<{ block: ToolCallBlock }> = ({ block }) => (
  <DetailGate block={block} executingLabel="Loading…">
    <UserBody block={block} />
  </DetailGate>
);
