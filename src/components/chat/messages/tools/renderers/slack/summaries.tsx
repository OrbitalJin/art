import type { FC } from "react";
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
  errorOf,
  messagesOf,
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

export const WhoAmISummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const error = errorOf(block.output);
  const input = asRecord(block.input);
  const summary = getString(input, "user") ?? getSummaryText(block.input);

  return (
    <SummaryRow>
      {summary ? <SummaryText title={summary}>{summary}</SummaryText> : null}
      {error ? (
        <ResultBadge tone="error">failed</ResultBadge>
      ) : block.state !== "executing" ? (
        <ResultBadge>read</ResultBadge>
      ) : null}
    </SummaryRow>
  );
};

export const ChannelsSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const query = getSummaryText(block.input);
  const error = errorOf(block.output);
  const channels = channelsOf(block.output);

  return (
    <SummaryRow>
      {query ? <SummaryText title={query}>{query}</SummaryText> : null}
      {error ? (
        <ResultBadge tone="error">failed</ResultBadge>
      ) : block.state !== "executing" ? (
        <ResultBadge>{formatCount(channels.length, "channel")}</ResultBadge>
      ) : null}
    </SummaryRow>
  );
};

export const ChannelInfoSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const ref = channelRefOf(block.input);
  const error = errorOf(block.output);

  return (
    <SummaryRow>
      {ref ? <SummaryText mono title={ref}>{ref}</SummaryText> : null}
      {error ? (
        <ResultBadge tone="error">failed</ResultBadge>
      ) : block.state !== "executing" ? (
        <ResultBadge>read</ResultBadge>
      ) : null}
    </SummaryRow>
  );
};

export const MessagesSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const ref = channelRefOf(block.input);
  const error = errorOf(block.output);
  const messages = messagesOf(block.output);

  return (
    <SummaryRow>
      {ref ? <SummaryText title={ref}>#{ref}</SummaryText> : null}
      {error ? (
        <ResultBadge tone="error">failed</ResultBadge>
      ) : block.state !== "executing" ? (
        <ResultBadge>{formatCount(messages.length, "message")}</ResultBadge>
      ) : null}
    </SummaryRow>
  );
};

export const SearchSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const query =
    getString(asRecord(block.input), "query") ?? getSummaryText(block.input);
  const error = errorOf(block.output);
  const messages = messagesOf(block.output);

  return (
    <SummaryRow>
      {query ? <SummaryText title={query}>{query}</SummaryText> : null}
      {error ? (
        <ResultBadge tone="error">failed</ResultBadge>
      ) : block.state !== "executing" ? (
        <ResultBadge>{formatCount(messages.length, "match")}</ResultBadge>
      ) : null}
    </SummaryRow>
  );
};

export const UsersSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const query = getSummaryText(block.input);
  const error = errorOf(block.output);
  const users = usersOf(block.output);

  return (
    <SummaryRow>
      {query ? <SummaryText title={query}>{query}</SummaryText> : null}
      {error ? (
        <ResultBadge tone="error">failed</ResultBadge>
      ) : block.state !== "executing" ? (
        <ResultBadge>{formatCount(users.length, "user")}</ResultBadge>
      ) : null}
    </SummaryRow>
  );
};

export const UserSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const ref = userRefOf(block.input);
  const error = errorOf(block.output);
  const user = toUser(userOf(block.output));
  const name = user.realName ?? user.displayName ?? user.name;

  return (
    <SummaryRow>
      {name ?? ref ? (
        <SummaryText title={name ?? ref ?? undefined}>{name ?? ref}</SummaryText>
      ) : null}
      {error ? (
        <ResultBadge tone="error">failed</ResultBadge>
      ) : user.id && block.state !== "executing" ? (
        <ResultBadge>read</ResultBadge>
      ) : null}
    </SummaryRow>
  );
};
