import { Hash, MessagesSquare, Search, UserRound, Users } from "lucide-react";
import type { ToolRenderer } from "../../types";
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

export const slackRenderers: Record<string, ToolRenderer> = {
  SLACK_WHO_AM_I: {
    icon: UserRound,
    title: "Identified account",
    Summary: WhoAmISummary,
    Detail: WhoAmIDetail,
  },
  SLACK_LIST_ALL_CHANNELS: {
    icon: Hash,
    title: "Listed channels",
    Summary: ChannelsSummary,
    Detail: ChannelsListDetail,
  },
  SLACK_LIST_CONVERSATIONS: {
    icon: Hash,
    title: "Listed channels",
    Summary: ChannelsSummary,
    Detail: ChannelsListDetail,
  },
  SLACK_FIND_CHANNELS: {
    icon: Hash,
    title: "Found channels",
    Summary: ChannelsSummary,
    Detail: ChannelsListDetail,
  },
  SLACK_RETRIEVE_CONVERSATION_INFORMATION: {
    icon: Hash,
    title: "Channel info",
    Summary: ChannelInfoSummary,
    Detail: ChannelInfoDetail,
  },
  SLACK_FETCH_CONVERSATION_HISTORY: {
    icon: MessagesSquare,
    title: "Read messages",
    Summary: MessagesSummary,
    Detail: ConversationHistoryDetail,
  },
  SLACK_FETCH_MESSAGE_THREAD_FROM_A_CONVERSATION: {
    icon: MessagesSquare,
    title: "Read thread",
    Summary: MessagesSummary,
    Detail: ConversationHistoryDetail,
  },
  SLACK_SEARCH_MESSAGES: {
    icon: Search,
    title: "Searched Slack",
    Summary: SearchSummary,
    Detail: SearchDetail,
  },
  SLACK_SEARCH_ALL: {
    icon: Search,
    title: "Searched Slack",
    Summary: SearchSummary,
    Detail: SearchDetail,
  },
  SLACK_LIST_ALL_USERS: {
    icon: Users,
    title: "Listed users",
    Summary: UsersSummary,
    Detail: UsersListDetail,
  },
  SLACK_FIND_USERS: {
    icon: Users,
    title: "Found users",
    Summary: UsersSummary,
    Detail: UsersListDetail,
  },
  SLACK_FIND_USER_BY_EMAIL_ADDRESS: {
    icon: UserRound,
    title: "Read user",
    Summary: UserSummary,
    Detail: UserDetail,
  },
  SLACK_RETRIEVE_DETAILED_USER_INFORMATION: {
    icon: UserRound,
    title: "Read user",
    Summary: UserSummary,
    Detail: UserDetail,
  },
  SLACK_RETRIEVE_USER_PROFILE_INFORMATION: {
    icon: UserRound,
    title: "Read profile",
    Summary: UserSummary,
    Detail: UserDetail,
  },
};
