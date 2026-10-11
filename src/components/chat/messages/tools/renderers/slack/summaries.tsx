import type { FC, ReactNode } from "react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import { ResultBadge, SummaryRow, SummaryText } from "../../primitives";
import {
  asRecord,
  formatCount,
  getString,
  getSummaryText,
} from "../../helpers";
import {
  channelsOf,
  conversationOf,
  errorOf,
  looksLikeId,
  messagesOf,
  toChannel,
  toIdentity,
  toUser,
  userOf,
  usersOf,
} from "./helpers";

const channelRefOf = (input: unknown): string | null =>
  getString(asRecord(input), "channel") ??
  getString(asRecord(input), "channel_id");

const userRefOf = (input: unknown): string | null =>
  getString(asRecord(input), "user") ??
  getString(asRecord(input), "user_id") ??
  getString(asRecord(input), "email");

const SummaryStatus: FC<{ block: ToolCallBlock; children: ReactNode }> = ({
  block,
  children,
}) => {
  const failed = block.state === "error" || errorOf(block.output) !== null;
  if (failed) return <ResultBadge tone="error">failed</ResultBadge>;

  if (block.state === "executing") return null;

  return <>{children}</>;
};

const ChannelRefText: FC<{ channelRef: string }> = ({ channelRef }) => {
  if (looksLikeId(channelRef)) {
    return (
      <SummaryText mono title={channelRef}>
        {channelRef}
      </SummaryText>
    );
  }

  const label = `#${channelRef.replace(/^#/, "")}`;
  return <SummaryText title={label}>{label}</SummaryText>;
};

const CountSummary: FC<{
  block: ToolCallBlock;
  label: string | null;
  count: number;
  noun: string;
}> = ({ block, label, count, noun }) => (
  <SummaryRow>
    {label ? <SummaryText title={label}>{label}</SummaryText> : null}
    <SummaryStatus block={block}>
      <ResultBadge>{formatCount(count, noun)}</ResultBadge>
    </SummaryStatus>
  </SummaryRow>
);

export const WhoAmISummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const identity = toIdentity(block.output);
  const label = identity.userName;

  return (
    <SummaryRow>
      {label ? <SummaryText title={label}>{label}</SummaryText> : null}
      <SummaryStatus block={block}>
        <ResultBadge>{identity.teamName ?? "read"}</ResultBadge>
      </SummaryStatus>
    </SummaryRow>
  );
};

export const ChannelsSummary: FC<{ block: ToolCallBlock }> = ({ block }) => (
  <CountSummary
    block={block}
    label={getSummaryText(block.input)}
    count={channelsOf(block.output).length}
    noun="channel"
  />
);

export const ChannelInfoSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const ref = channelRefOf(block.input);
  const channel = toChannel(conversationOf(block.output));
  const name = channel.name ? `#${channel.name}` : null;
  const badge =
    channel.memberCount !== null
      ? formatCount(channel.memberCount, "member")
      : "read";

  return (
    <SummaryRow>
      {name ? (
        <SummaryText title={name}>{name}</SummaryText>
      ) : ref ? (
        <ChannelRefText channelRef={ref} />
      ) : null}
      <SummaryStatus block={block}>
        <ResultBadge>{badge}</ResultBadge>
      </SummaryStatus>
    </SummaryRow>
  );
};

export const MessagesSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const ref = channelRefOf(block.input);
  const messages = messagesOf(block.output);

  return (
    <SummaryRow>
      {ref ? <ChannelRefText channelRef={ref} /> : null}
      <SummaryStatus block={block}>
        <ResultBadge>{formatCount(messages.length, "message")}</ResultBadge>
      </SummaryStatus>
    </SummaryRow>
  );
};

export const SearchSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const query =
    getString(asRecord(block.input), "query") ?? getSummaryText(block.input);

  return (
    <CountSummary
      block={block}
      label={query}
      count={messagesOf(block.output).length}
      noun="match"
    />
  );
};

export const UsersSummary: FC<{ block: ToolCallBlock }> = ({ block }) => (
  <CountSummary
    block={block}
    label={getSummaryText(block.input)}
    count={usersOf(block.output).length}
    noun="user"
  />
);

export const UserSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const ref = userRefOf(block.input);
  const user = toUser(userOf(block.output));
  const label = user.realName ?? user.displayName ?? user.name ?? ref;

  return (
    <SummaryRow>
      {label ? <SummaryText title={label}>{label}</SummaryText> : null}
      <SummaryStatus block={block}>
        {user.id ? <ResultBadge>read</ResultBadge> : null}
      </SummaryStatus>
    </SummaryRow>
  );
};
