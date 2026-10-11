import { asArray, asRecord, getString } from "../../helpers";

export const errorOf = (output: unknown): string | null =>
  getString(asRecord(output), "error");

/**
 * Composio tools return `{ data, error, successful }`. The renderer only cares
 * about the payload, so unwrap `data` when present and fall back to the raw
 * value for defensiveness.
 */
export const dataOf = (output: unknown): unknown => {
  const record = asRecord(output);
  if (!record) return output;
  return "data" in record ? record.data : output;
};

const recordsOf = (value: unknown): Record<string, unknown>[] =>
  asArray(value)
    .map((item) => asRecord(item))
    .filter((item): item is Record<string, unknown> => item !== null);

const payloadOf = (output: unknown): Record<string, unknown> | null => {
  const data = dataOf(output);
  return asRecord(data) ?? asRecord(output);
};

export const channelsOf = (output: unknown): Record<string, unknown>[] => {
  const payload = payloadOf(output);
  if (!payload) return [];
  return recordsOf(payload.channels);
};

export const conversationOf = (
  output: unknown,
): Record<string, unknown> | null => {
  const payload = payloadOf(output);
  if (!payload) return null;
  return asRecord(payload.channel) ?? payload;
};

export const messagesOf = (output: unknown): Record<string, unknown>[] => {
  const payload = payloadOf(output);
  if (!payload) return [];

  const direct = recordsOf(payload.messages);
  if (direct.length > 0) return direct;

  const matches = recordsOf(asRecord(payload.messages)?.matches);
  return matches;
};

export const usersOf = (output: unknown): Record<string, unknown>[] => {
  const payload = payloadOf(output);
  if (!payload) return [];

  const members = recordsOf(payload.members);
  if (members.length > 0) return members;

  return recordsOf(payload.users);
};

export const userOf = (output: unknown): Record<string, unknown> | null => {
  const payload = payloadOf(output);
  if (!payload) return null;

  const user = asRecord(payload.user) ?? asRecord(payload.profile);
  if (user) return user;

  return usersOf(output)[0] ?? null;
};

export interface Identity {
  userName: string | null;
  teamName: string | null;
  domain: string | null;
  url: string | null;
  userId: string | null;
  teamId: string | null;
}

export const toIdentity = (output: unknown): Identity => {
  const payload = payloadOf(output) ?? {};
  const user = asRecord(payload.user);
  const team = asRecord(payload.team);

  return {
    userName:
      getString(payload, "user") ??
      getString(user, "real_name") ??
      getString(user, "name"),
    teamName: getString(payload, "team") ?? getString(team, "name"),
    domain: getString(team, "domain"),
    url: getString(payload, "url"),
    userId: getString(payload, "user_id") ?? getString(user, "id"),
    teamId: getString(payload, "team_id") ?? getString(team, "id"),
  };
};

export interface Channel {
  id: string | null;
  name: string | null;
  isPrivate: boolean;
  isArchived: boolean;
  isMember: boolean;
  memberCount: number | null;
  topic: string | null;
  purpose: string | null;
}

export const toChannel = (item: unknown): Channel => {
  const record = asRecord(item) ?? {};
  const topic = asRecord(record.topic);
  const purpose = asRecord(record.purpose);

  return {
    id: getString(record, "id") ?? getString(record, "channel_id"),
    name: getString(record, "name") ?? getString(record, "channel_name"),
    isPrivate: record.is_private === true,
    isArchived: record.is_archived === true,
    isMember: record.is_member === true,
    memberCount:
      typeof record.num_members === "number" ? record.num_members : null,
    topic: getString(record, "topic") ?? getString(topic, "value"),
    purpose: getString(record, "purpose") ?? getString(purpose, "value"),
  };
};

export interface SlackMessage {
  id: string | null;
  user: string | null;
  username: string | null;
  text: string | null;
  ts: string | null;
  channel: string | null;
  permalink: string | null;
  replyCount: number | null;
}

export const toMessage = (item: unknown): SlackMessage => {
  const record = asRecord(item) ?? {};
  const channel = asRecord(record.channel);

  return {
    id: getString(record, "ts") ?? getString(record, "id"),
    user: getString(record, "user") ?? getString(record, "user_id"),
    username: getString(record, "username") ?? getString(record, "user_name"),
    text: getString(record, "text"),
    ts: getString(record, "ts"),
    channel:
      getString(record, "channel") ??
      getString(channel, "name") ??
      getString(channel, "id"),
    permalink: getString(record, "permalink"),
    replyCount:
      typeof record.reply_count === "number" ? record.reply_count : null,
  };
};

export interface SlackUser {
  id: string | null;
  name: string | null;
  realName: string | null;
  displayName: string | null;
  email: string | null;
  title: string | null;
  image: string | null;
  isBot: boolean;
  deleted: boolean;
}

export const toUser = (item: unknown): SlackUser => {
  const record = asRecord(item) ?? {};
  const profile = asRecord(record.profile) ?? record;

  return {
    id: getString(record, "id") ?? getString(record, "user_id"),
    name: getString(record, "name") ?? getString(profile, "display_name"),
    realName: getString(record, "real_name") ?? getString(profile, "real_name"),
    displayName: getString(profile, "display_name"),
    email: getString(profile, "email") ?? getString(record, "email"),
    title: getString(profile, "title"),
    image:
      getString(profile, "image_72") ??
      getString(profile, "image_48") ??
      getString(profile, "image_192"),
    isBot: record.is_bot === true,
    deleted: record.deleted === true,
  };
};

/** Slack ids look like `C01234ABCDE`, `U…`, `G…`, `D…`, `W…`. */
export const looksLikeId = (value: string): boolean =>
  /^[CGDUW][A-Z0-9]{8,}$/.test(value);

/**
 * Turns Slack mrkdwn tokens into readable text: `<@U1>` -> `@U1`,
 * `<#C1|general>` -> `#general`, `<https://x|label>` -> `label`, and decodes
 * the three HTML entities Slack escapes.
 */
export const cleanSlackText = (text: string): string =>
  text
    .replace(
      /<@([A-Z0-9]+)(?:\|([^>]+))?>/g,
      (_match, id: string, label?: string) => `@${label ?? id}`,
    )
    .replace(/<#[A-Z0-9]+\|([^>]+)>/g, "#$1")
    .replace(/<#([A-Z0-9]+)>/g, "#$1")
    .replace(/<!(here|channel|everyone)[^>]*>/g, "@$1")
    .replace(/<(https?:[^|>]+)\|([^>]+)>/g, "$2")
    .replace(/<(https?:[^>]+)>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

/** Gmail-style: time today, "Mar 4" this year, "Mar 4, 2024" otherwise. */
export const formatSlackTs = (value: string | null): string | null => {
  if (!value) return null;

  const seconds = Number.parseFloat(value);
  if (!Number.isFinite(seconds)) return null;

  const date = new Date(seconds * 1000);
  if (Number.isNaN(date.getTime())) return null;

  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
