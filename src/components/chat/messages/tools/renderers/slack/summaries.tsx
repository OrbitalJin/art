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
  ResultBadge,
  SummaryRow,
  SummaryStatus,
  SummaryText,
} from "../../primitives";
import { asRecord, formatCount, getString, getSummaryText } from "../../helpers";
import { looksLikeId } from "./helpers";

const channelRefOf = (input: unknown): string | null =>
  getString(asRecord(input), "channel");

const userRefOf = (input: unknown): string | null =>
  getString(asRecord(input), "user") ?? getString(asRecord(input), "email");

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
  block: RendererProps["block"];
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

export const WhoAmISummary: FC<RendererProps<SlackIdentityOutput>> = ({
  block,
  output,
}) => {
  const identity = output?.identity ?? null;
  const label = identity?.userName ?? null;

  return (
    <SummaryRow>
      {label ? <SummaryText title={label}>{label}</SummaryText> : null}
      <SummaryStatus block={block}>
        <ResultBadge>{identity?.teamName ?? "read"}</ResultBadge>
      </SummaryStatus>
    </SummaryRow>
  );
};

export const ChannelsSummary: FC<RendererProps<SlackChannelsOutput>> = ({
  block,
  output,
}) => (
  <CountSummary
    block={block}
    label={getSummaryText(block.input)}
    count={output?.channels.length ?? 0}
    noun="channel"
  />
);

export const ChannelInfoSummary: FC<RendererProps<SlackChannelOutput>> = ({
  block,
  output,
}) => {
  const ref = channelRefOf(block.input);
  const channel = output?.channel ?? null;
  const name = channel?.name ? `#${channel.name}` : null;
  const memberCount = channel?.memberCount ?? null;
  const badge =
    memberCount !== null ? formatCount(memberCount, "member") : "read";

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

export const MessagesSummary: FC<RendererProps<SlackMessagesOutput>> = ({
  block,
  output,
}) => {
  const ref = channelRefOf(block.input);
  const messages = output?.messages ?? [];

  return (
    <SummaryRow>
      {ref ? <ChannelRefText channelRef={ref} /> : null}
      <SummaryStatus block={block}>
        <ResultBadge>{formatCount(messages.length, "message")}</ResultBadge>
      </SummaryStatus>
    </SummaryRow>
  );
};

export const SearchSummary: FC<RendererProps<SlackMessagesOutput>> = ({
  block,
  output,
}) => {
  const query =
    getString(asRecord(block.input), "query") ?? getSummaryText(block.input);

  return (
    <CountSummary
      block={block}
      label={query}
      count={output?.messages.length ?? 0}
      noun="match"
    />
  );
};

export const UsersSummary: FC<RendererProps<SlackUsersOutput>> = ({
  block,
  output,
}) => (
  <CountSummary
    block={block}
    label={getSummaryText(block.input)}
    count={output?.users.length ?? 0}
    noun="user"
  />
);

export const UserSummary: FC<RendererProps<SlackUserOutput>> = ({
  block,
  output,
}) => {
  const ref = userRefOf(block.input);
  const user = output?.user ?? null;
  const label = user?.realName ?? user?.displayName ?? user?.name ?? ref;

  return (
    <SummaryRow>
      {label ? <SummaryText title={label}>{label}</SummaryText> : null}
      <SummaryStatus block={block}>
        {user?.id ? <ResultBadge>read</ResultBadge> : null}
      </SummaryStatus>
    </SummaryRow>
  );
};
