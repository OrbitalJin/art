import { z } from "zod";
import { composioTool } from "./composio/define";
import { failed } from "./composio/output";
import {
  asNumber,
  asRecord,
  asString,
  recordsOf,
} from "@/lib/utils/coerce";

/**
 * Slack tools backed by Composio. Each tool declares its input and output
 * schema and normalizes Composio's raw Slack payload into the output shape.
 */

export const slackIdentitySchema = z.object({
  userName: z.string().nullable(),
  teamName: z.string().nullable(),
  domain: z.string().nullable(),
  url: z.string().nullable(),
  userId: z.string().nullable(),
  teamId: z.string().nullable(),
});

export type SlackIdentity = z.infer<typeof slackIdentitySchema>;

export const slackChannelSchema = z.object({
  id: z.string().nullable(),
  name: z.string().nullable(),
  isPrivate: z.boolean(),
  isArchived: z.boolean(),
  isMember: z.boolean(),
  memberCount: z.number().nullable(),
  topic: z.string().nullable(),
  purpose: z.string().nullable(),
});

export type SlackChannel = z.infer<typeof slackChannelSchema>;

export const slackMessageSchema = z.object({
  id: z.string().nullable(),
  user: z.string().nullable(),
  username: z.string().nullable(),
  text: z.string().nullable(),
  ts: z.string().nullable(),
  channel: z.string().nullable(),
  permalink: z.string().nullable(),
  replyCount: z.number().nullable(),
});

export type SlackMessage = z.infer<typeof slackMessageSchema>;

export const slackUserSchema = z.object({
  id: z.string().nullable(),
  name: z.string().nullable(),
  realName: z.string().nullable(),
  displayName: z.string().nullable(),
  email: z.string().nullable(),
  title: z.string().nullable(),
  image: z.string().nullable(),
  isBot: z.boolean(),
  deleted: z.boolean(),
});

export type SlackUser = z.infer<typeof slackUserSchema>;

export const slackIdentityOutput = z.object({
  identity: slackIdentitySchema.nullable(),
  error: z.string().optional(),
});

export const slackChannelsOutput = z.object({
  channels: z.array(slackChannelSchema),
  error: z.string().optional(),
});

export const slackChannelOutput = z.object({
  channel: slackChannelSchema.nullable(),
  error: z.string().optional(),
});

export const slackMessagesOutput = z.object({
  messages: z.array(slackMessageSchema),
  error: z.string().optional(),
});

export const slackUsersOutput = z.object({
  users: z.array(slackUserSchema),
  error: z.string().optional(),
});

export const slackUserOutput = z.object({
  user: slackUserSchema.nullable(),
  error: z.string().optional(),
});

export type SlackIdentityOutput = z.infer<typeof slackIdentityOutput>;
export type SlackChannelsOutput = z.infer<typeof slackChannelsOutput>;
export type SlackChannelOutput = z.infer<typeof slackChannelOutput>;
export type SlackMessagesOutput = z.infer<typeof slackMessagesOutput>;
export type SlackUsersOutput = z.infer<typeof slackUsersOutput>;
export type SlackUserOutput = z.infer<typeof slackUserOutput>;

const channelsOf = (data: Record<string, unknown>): Record<string, unknown>[] =>
  recordsOf(data.channels);

const conversationOf = (
  data: Record<string, unknown>,
): Record<string, unknown> => asRecord(data.channel) ?? data;

const messagesOf = (
  data: Record<string, unknown>,
): Record<string, unknown>[] => {
  const direct = recordsOf(data.messages);
  if (direct.length > 0) return direct;
  return recordsOf(asRecord(data.messages)?.matches);
};

const usersOf = (data: Record<string, unknown>): Record<string, unknown>[] => {
  const members = recordsOf(data.members);
  if (members.length > 0) return members;
  return recordsOf(data.users);
};

const userOf = (
  data: Record<string, unknown>,
): Record<string, unknown> | null => {
  const user = asRecord(data.user) ?? asRecord(data.profile);
  if (user) return user;
  return usersOf(data)[0] ?? null;
};

const toIdentity = (data: Record<string, unknown>): SlackIdentity => {
  const user = asRecord(data.user);
  const team = asRecord(data.team);

  return {
    userName:
      asString(data.user) ?? asString(user?.real_name) ?? asString(user?.name),
    teamName: asString(data.team) ?? asString(team?.name),
    domain: asString(team?.domain),
    url: asString(data.url),
    userId: asString(data.user_id) ?? asString(user?.id),
    teamId: asString(data.team_id) ?? asString(team?.id),
  };
};

const toChannel = (item: unknown): SlackChannel => {
  const record = asRecord(item) ?? {};
  const topic = asRecord(record.topic);
  const purpose = asRecord(record.purpose);

  return {
    id: asString(record.id) ?? asString(record.channel_id),
    name: asString(record.name) ?? asString(record.channel_name),
    isPrivate: record.is_private === true,
    isArchived: record.is_archived === true,
    isMember: record.is_member === true,
    memberCount: asNumber(record.num_members),
    topic: asString(record.topic) ?? asString(topic?.value),
    purpose: asString(record.purpose) ?? asString(purpose?.value),
  };
};

const toMessage = (item: unknown): SlackMessage => {
  const record = asRecord(item) ?? {};
  const channel = asRecord(record.channel);

  return {
    id: asString(record.ts) ?? asString(record.id),
    user: asString(record.user) ?? asString(record.user_id),
    username: asString(record.username) ?? asString(record.user_name),
    text: asString(record.text),
    ts: asString(record.ts),
    channel:
      asString(record.channel) ??
      asString(channel?.name) ??
      asString(channel?.id),
    permalink: asString(record.permalink),
    replyCount: asNumber(record.reply_count),
  };
};

const toUser = (item: unknown): SlackUser => {
  const record = asRecord(item) ?? {};
  const profile = asRecord(record.profile) ?? record;

  return {
    id: asString(record.id) ?? asString(record.user_id),
    name: asString(record.name) ?? asString(profile.display_name),
    realName: asString(record.real_name) ?? asString(profile.real_name),
    displayName: asString(profile.display_name),
    email: asString(profile.email) ?? asString(record.email),
    title: asString(profile.title),
    image:
      asString(profile.image_72) ??
      asString(profile.image_48) ??
      asString(profile.image_192),
    isBot: record.is_bot === true,
    deleted: record.deleted === true,
  };
};

const channelHint = "Slack channel id (e.g. C01234ABCDE) or name.";

export const slackTools = () => ({
  slack_who_am_i: composioTool({
    slug: "SLACK_WHO_AM_I",
    title: "Who Am I",
    description: "Identify the connected Slack account and workspace.",
    inputSchema: z.object({}),
    outputSchema: slackIdentityOutput,
    map: (data) => ({ identity: toIdentity(data) }),
    errorResult: failed({ identity: null }),
  }),

  slack_list_channels: composioTool({
    slug: "SLACK_LIST_ALL_CHANNELS",
    title: "List Channels",
    description: "List the Slack channels the connected account can see.",
    inputSchema: z.object({
      types: z
        .string()
        .optional()
        .describe(
          "Comma-separated channel types, e.g. 'public_channel,private_channel'.",
        ),
      exclude_archived: z
        .boolean()
        .optional()
        .describe("Exclude archived channels."),
      limit: z.number().int().min(1).max(200).optional(),
      cursor: z.string().optional(),
    }),
    outputSchema: slackChannelsOutput,
    map: (data) => ({ channels: channelsOf(data).map(toChannel) }),
    errorResult: failed({ channels: [] }),
  }),

  slack_list_conversations: composioTool({
    slug: "SLACK_LIST_CONVERSATIONS",
    title: "List Conversations",
    description: "List Slack conversations the connected account is part of.",
    inputSchema: z.object({
      types: z
        .string()
        .optional()
        .describe("Comma-separated conversation types."),
      limit: z.number().int().min(1).max(200).optional(),
      cursor: z.string().optional(),
    }),
    outputSchema: slackChannelsOutput,
    map: (data) => ({ channels: channelsOf(data).map(toChannel) }),
    errorResult: failed({ channels: [] }),
  }),

  slack_find_channels: composioTool({
    slug: "SLACK_FIND_CHANNELS",
    title: "Find Channels",
    description: "Search Slack channels by name.",
    inputSchema: z.object({
      query: z.string().describe("Channel name to search for."),
      limit: z.number().int().min(1).max(200).optional(),
    }),
    outputSchema: slackChannelsOutput,
    map: (data) => ({ channels: channelsOf(data).map(toChannel) }),
    errorResult: failed({ channels: [] }),
  }),

  slack_conversation_info: composioTool({
    slug: "SLACK_RETRIEVE_CONVERSATION_INFORMATION",
    title: "Channel Info",
    description: "Get details about a Slack channel.",
    inputSchema: z.object({
      channel: z.string().describe(channelHint),
    }),
    outputSchema: slackChannelOutput,
    map: (data) => ({ channel: toChannel(conversationOf(data)) }),
    errorResult: failed({ channel: null }),
  }),

  slack_conversation_history: composioTool({
    slug: "SLACK_FETCH_CONVERSATION_HISTORY",
    title: "Read Messages",
    description: "Read recent messages from a Slack channel.",
    inputSchema: z.object({
      channel: z.string().describe(channelHint),
      limit: z.number().int().min(1).max(200).optional(),
      oldest: z
        .string()
        .optional()
        .describe("Start of the time range (Slack ts)."),
      latest: z.string().optional().describe("End of the time range (Slack ts)."),
      cursor: z.string().optional(),
    }),
    outputSchema: slackMessagesOutput,
    map: (data) => ({ messages: messagesOf(data).map(toMessage) }),
    errorResult: failed({ messages: [] }),
  }),

  slack_thread_replies: composioTool({
    slug: "SLACK_FETCH_MESSAGE_THREAD_FROM_A_CONVERSATION",
    title: "Read Thread",
    description: "Read the replies in a Slack message thread.",
    inputSchema: z.object({
      channel: z.string().describe(channelHint),
      ts: z.string().describe("The `ts` of the parent message."),
      limit: z.number().int().min(1).max(200).optional(),
    }),
    outputSchema: slackMessagesOutput,
    map: (data) => ({ messages: messagesOf(data).map(toMessage) }),
    errorResult: failed({ messages: [] }),
  }),

  slack_search_messages: composioTool({
    slug: "SLACK_SEARCH_MESSAGES",
    title: "Search Messages",
    description: "Search Slack messages. Supports Slack search modifiers.",
    inputSchema: z.object({
      query: z.string().describe("Slack search query."),
      count: z.number().int().min(1).max(100).optional(),
      sort: z.enum(["score", "timestamp"]).optional(),
      sort_dir: z.enum(["asc", "desc"]).optional(),
    }),
    outputSchema: slackMessagesOutput,
    map: (data) => ({ messages: messagesOf(data).map(toMessage) }),
    errorResult: failed({ messages: [] }),
  }),

  slack_search_all: composioTool({
    slug: "SLACK_SEARCH_ALL",
    title: "Search Slack",
    description: "Search across Slack messages, files, and channels.",
    inputSchema: z.object({
      query: z.string().describe("Slack search query."),
      count: z.number().int().min(1).max(100).optional(),
    }),
    outputSchema: slackMessagesOutput,
    map: (data) => ({ messages: messagesOf(data).map(toMessage) }),
    errorResult: failed({ messages: [] }),
  }),

  slack_list_users: composioTool({
    slug: "SLACK_LIST_ALL_USERS",
    title: "List Users",
    description: "List the users in the connected Slack workspace.",
    inputSchema: z.object({
      limit: z.number().int().min(1).max(200).optional(),
      cursor: z.string().optional(),
    }),
    outputSchema: slackUsersOutput,
    map: (data) => ({ users: usersOf(data).map(toUser) }),
    errorResult: failed({ users: [] }),
  }),

  slack_find_users: composioTool({
    slug: "SLACK_FIND_USERS",
    title: "Find Users",
    description: "Search Slack users by name or handle.",
    inputSchema: z.object({
      search_query: z
        .string()
        .optional()
        .describe("Name or handle to search for."),
      limit: z.number().int().min(1).max(200).optional(),
    }),
    outputSchema: slackUsersOutput,
    map: (data) => ({ users: usersOf(data).map(toUser) }),
    errorResult: failed({ users: [] }),
  }),

  slack_find_user_by_email: composioTool({
    slug: "SLACK_FIND_USER_BY_EMAIL_ADDRESS",
    title: "Find User By Email",
    description: "Look up a Slack user by their email address.",
    inputSchema: z.object({
      email: z.string().describe("The user's email address."),
    }),
    outputSchema: slackUserOutput,
    map: (data) => ({ user: toUser(userOf(data)) }),
    errorResult: failed({ user: null }),
  }),

  slack_user_info: composioTool({
    slug: "SLACK_RETRIEVE_DETAILED_USER_INFORMATION",
    title: "Read User",
    description: "Get detailed information about a Slack user.",
    inputSchema: z.object({
      user: z.string().describe("Slack user id (e.g. U01234ABCDE)."),
    }),
    outputSchema: slackUserOutput,
    map: (data) => ({ user: toUser(userOf(data)) }),
    errorResult: failed({ user: null }),
  }),

  slack_user_profile: composioTool({
    slug: "SLACK_RETRIEVE_USER_PROFILE_INFORMATION",
    title: "Read Profile",
    description: "Get a Slack user's profile.",
    inputSchema: z.object({
      user: z.string().describe("Slack user id (e.g. U01234ABCDE)."),
    }),
    outputSchema: slackUserOutput,
    map: (data) => ({ user: toUser(userOf(data)) }),
    errorResult: failed({ user: null }),
  }),
});

export type SlackToolName = keyof ReturnType<typeof slackTools>;
