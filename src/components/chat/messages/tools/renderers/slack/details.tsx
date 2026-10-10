import type { FC } from "react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import { EmptyNote, ErrorNote, KeyValueList } from "../../primitives";
import { asRecord, getString } from "../../helpers";
import {
  conversationOf,
  dataOf,
  errorOf,
  toChannel,
  toUser,
  userOf,
} from "./helpers";
import { ChannelsDetail, MessagesDetail, UsersDetail } from "./parts";

export const WhoAmIDetail: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const error = errorOf(block.output);
  if (error) return <ErrorNote>{error}</ErrorNote>;

  if (block.state === "executing") return <EmptyNote>Loading…</EmptyNote>;

  const payload =
    asRecord(dataOf(block.output)) ?? asRecord(block.output) ?? {};
  const user = asRecord(payload.user);
  const team = asRecord(payload.team);

  const userName =
    getString(payload, "user") ??
    getString(user, "real_name") ??
    getString(user, "name");
  const teamName = getString(payload, "team") ?? getString(team, "name");
  const domain = getString(team, "domain");
  const url = getString(payload, "url");
  const userId = getString(payload, "user_id") ?? getString(user, "id");
  const teamId = getString(payload, "team_id") ?? getString(team, "id");

  const entries = [
    userName ? { label: "User", value: userName } : null,
    teamName ? { label: "Workspace", value: teamName } : null,
    domain ? { label: "Domain", value: domain } : null,
    url ? { label: "URL", value: url } : null,
    userId ? { label: "User ID", value: userId } : null,
    teamId ? { label: "Team ID", value: teamId } : null,
  ].filter((entry): entry is { label: string; value: string } => entry !== null);

  if (entries.length === 0) return <EmptyNote>No identity returned.</EmptyNote>;

  return <KeyValueList entries={entries} />;
};

export const ChannelsListDetail: FC<{ block: ToolCallBlock }> = ({ block }) => (
  <ChannelsDetail
    block={block}
    emptyLabel="No channels found."
    executingLabel="Fetching channels…"
  />
);

export const ChannelInfoDetail: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const error = errorOf(block.output);
  if (error) return <ErrorNote>{error}</ErrorNote>;

  if (block.state === "executing") return <EmptyNote>Loading…</EmptyNote>;

  const channel = toChannel(conversationOf(block.output));

  const entries = [
    channel.name ? { label: "Name", value: channel.name } : null,
    channel.id ? { label: "ID", value: channel.id } : null,
    channel.memberCount !== null
      ? { label: "Members", value: String(channel.memberCount) }
      : null,
    channel.isPrivate ? { label: "Private", value: "Yes" } : null,
    channel.isArchived ? { label: "Archived", value: "Yes" } : null,
    channel.topic ? { label: "Topic", value: channel.topic } : null,
    channel.purpose ? { label: "Purpose", value: channel.purpose } : null,
  ].filter((entry): entry is { label: string; value: string } => entry !== null);

  if (entries.length === 0) return <EmptyNote>Channel not found.</EmptyNote>;

  return <KeyValueList entries={entries} />;
};

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

export const UserDetail: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const error = errorOf(block.output);
  if (error) return <ErrorNote>{error}</ErrorNote>;

  if (block.state === "executing") return <EmptyNote>Loading…</EmptyNote>;

  const user = toUser(userOf(block.output));

  const entries = [
    user.realName ? { label: "Name", value: user.realName } : null,
    user.displayName ? { label: "Display name", value: user.displayName } : null,
    user.name ? { label: "Handle", value: `@${user.name}` } : null,
    user.email ? { label: "Email", value: user.email } : null,
    user.title ? { label: "Title", value: user.title } : null,
    user.isBot ? { label: "Bot", value: "Yes" } : null,
    user.deleted ? { label: "Deactivated", value: "Yes" } : null,
    user.id ? { label: "ID", value: user.id } : null,
  ].filter((entry): entry is { label: string; value: string } => entry !== null);

  if (entries.length === 0) return <EmptyNote>User not found.</EmptyNote>;

  return <KeyValueList entries={entries} />;
};
