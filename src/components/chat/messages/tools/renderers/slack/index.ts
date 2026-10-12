import { Hash, MessagesSquare, Search, UserRound, Users } from "lucide-react";
import type { ToolRenderer } from "../../types";
import {
  slackChannelOutput,
  slackChannelsOutput,
  slackIdentityOutput,
  slackMessagesOutput,
  slackUserOutput,
  slackUsersOutput,
  type SlackToolName,
} from "@/lib/ai/tools/slack";
import {
  ChannelInfoDetail,
  ChannelsListDetail,
  ConversationHistoryDetail,
  SearchDetail,
  UserDetail,
  UsersListDetail,
  WhoAmIDetail,
} from "./details";
import {
  ChannelInfoSummary,
  ChannelsSummary,
  MessagesSummary,
  SearchSummary,
  UserSummary,
  UsersSummary,
  WhoAmISummary,
} from "./summaries";

export const slackRenderers = {
  slack_who_am_i: {
    icon: UserRound,
    title: "Identified account",
    schema: slackIdentityOutput,
    Summary: WhoAmISummary,
    Detail: WhoAmIDetail,
  },
  slack_list_channels: {
    icon: Hash,
    title: "Listed channels",
    schema: slackChannelsOutput,
    Summary: ChannelsSummary,
    Detail: ChannelsListDetail,
  },
  slack_list_conversations: {
    icon: Hash,
    title: "Listed conversations",
    schema: slackChannelsOutput,
    Summary: ChannelsSummary,
    Detail: ChannelsListDetail,
  },
  slack_find_channels: {
    icon: Hash,
    title: "Found channels",
    schema: slackChannelsOutput,
    Summary: ChannelsSummary,
    Detail: ChannelsListDetail,
  },
  slack_conversation_info: {
    icon: Hash,
    title: "Channel info",
    schema: slackChannelOutput,
    Summary: ChannelInfoSummary,
    Detail: ChannelInfoDetail,
  },
  slack_conversation_history: {
    icon: MessagesSquare,
    title: "Read messages",
    schema: slackMessagesOutput,
    Summary: MessagesSummary,
    Detail: ConversationHistoryDetail,
  },
  slack_thread_replies: {
    icon: MessagesSquare,
    title: "Read thread",
    schema: slackMessagesOutput,
    Summary: MessagesSummary,
    Detail: ConversationHistoryDetail,
  },
  slack_search_messages: {
    icon: Search,
    title: "Searched Slack",
    schema: slackMessagesOutput,
    Summary: SearchSummary,
    Detail: SearchDetail,
  },
  slack_search_all: {
    icon: Search,
    title: "Searched Slack",
    schema: slackMessagesOutput,
    Summary: SearchSummary,
    Detail: SearchDetail,
  },
  slack_list_users: {
    icon: Users,
    title: "Listed users",
    schema: slackUsersOutput,
    Summary: UsersSummary,
    Detail: UsersListDetail,
  },
  slack_find_users: {
    icon: Users,
    title: "Found users",
    schema: slackUsersOutput,
    Summary: UsersSummary,
    Detail: UsersListDetail,
  },
  slack_find_user_by_email: {
    icon: UserRound,
    title: "Read user",
    schema: slackUserOutput,
    Summary: UserSummary,
    Detail: UserDetail,
  },
  slack_user_info: {
    icon: UserRound,
    title: "Read user",
    schema: slackUserOutput,
    Summary: UserSummary,
    Detail: UserDetail,
  },
  slack_user_profile: {
    icon: UserRound,
    title: "Read profile",
    schema: slackUserOutput,
    Summary: UserSummary,
    Detail: UserDetail,
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} satisfies Partial<Record<SlackToolName, ToolRenderer<any>>>;
