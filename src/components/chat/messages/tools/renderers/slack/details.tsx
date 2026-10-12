import type { FC } from "react";
import type {
  SlackChannelOutput,
  SlackChannelsOutput,
  SlackIdentityOutput,
  SlackMessagesOutput,
  SlackUserOutput,
  SlackUsersOutput,
} from "@/lib/ai/tools/slack";
import type { RendererProps } from "../../types";
import {
  Chip,
  DetailGate,
  DetailSubtitle,
  DetailTitle,
  EmptyNote,
  HeaderLine,
} from "../../primitives";
import {
  ChannelsDetail,
  MessagesDetail,
  UsersDetail,
} from "./parts";

const WhoAmIBody: FC<RendererProps<SlackIdentityOutput>> = ({ output }) => {
  const identity = output?.identity ?? null;

  const hasIdentity =
    identity !== null &&
    (identity.userName !== null ||
      identity.teamName !== null ||
      identity.userId !== null);
  if (!identity || !hasIdentity) {
    return <EmptyNote>No identity returned.</EmptyNote>;
  }

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

const ChannelInfoBody: FC<RendererProps<SlackChannelOutput>> = ({ output }) => {
  const channel = output?.channel ?? null;

  if (!channel || (!channel.name && !channel.id)) {
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

const UserBody: FC<RendererProps<SlackUserOutput>> = ({ output }) => {
  const user = output?.user ?? null;

  const name = user?.realName ?? user?.displayName ?? user?.name ?? null;
  if (!user || (!name && !user.id && !user.email)) {
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

export const WhoAmIDetail: FC<RendererProps<SlackIdentityOutput>> = ({
  block,
  output,
}) => (
  <DetailGate block={block} executingLabel="Loading…">
    <WhoAmIBody block={block} output={output} />
  </DetailGate>
);

export const ChannelsListDetail: FC<RendererProps<SlackChannelsOutput>> = ({
  block,
  output,
}) => (
  <ChannelsDetail
    block={block}
    output={output}
    emptyLabel="No channels found."
    executingLabel="Fetching channels…"
  />
);

export const ChannelInfoDetail: FC<RendererProps<SlackChannelOutput>> = ({
  block,
  output,
}) => (
  <DetailGate block={block} executingLabel="Loading…">
    <ChannelInfoBody block={block} output={output} />
  </DetailGate>
);

export const ConversationHistoryDetail: FC<
  RendererProps<SlackMessagesOutput>
> = ({ block, output }) => (
  <MessagesDetail
    block={block}
    output={output}
    emptyLabel="No messages found."
    executingLabel="Reading messages…"
  />
);

export const SearchDetail: FC<RendererProps<SlackMessagesOutput>> = ({
  block,
  output,
}) => (
  <MessagesDetail
    block={block}
    output={output}
    emptyLabel="No matches found."
    executingLabel="Searching…"
  />
);

export const UsersListDetail: FC<RendererProps<SlackUsersOutput>> = ({
  block,
  output,
}) => (
  <UsersDetail
    block={block}
    output={output}
    emptyLabel="No users found."
    executingLabel="Fetching users…"
  />
);

export const UserDetail: FC<RendererProps<SlackUserOutput>> = ({
  block,
  output,
}) => (
  <DetailGate block={block} executingLabel="Loading…">
    <UserBody block={block} output={output} />
  </DetailGate>
);
