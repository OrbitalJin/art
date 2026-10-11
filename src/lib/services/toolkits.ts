export const SUPPORTED_TOOLKITS = ["gmail", "slack", "googlesheets"] as const;
export type SupportedToolkit = (typeof SUPPORTED_TOOLKITS)[number];

export const TOOLKIT_LABELS: Record<SupportedToolkit, string> = {
  gmail: "Gmail",
  slack: "Slack",
  googlesheets: "Google Sheets",
};

/**
 * Connections are read-only. Only these non-destructive actions are exposed to
 * the agent; every other Composio action is filtered out in
 * `refreshComposioTools`.
 */
export const READ_ONLY_TOOLS: ReadonlySet<string> = new Set([
  "GMAIL_GET_PROFILE",
  "GMAIL_LIST_LABELS",
  "GMAIL_GET_LABEL",
  "GMAIL_FETCH_EMAILS",
  "GMAIL_LIST_MESSAGES",
  "GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID",
  "GMAIL_LIST_THREADS",
  "GMAIL_FETCH_MESSAGE_BY_THREAD_ID",
  "GMAIL_LIST_DRAFTS",
  "GMAIL_GET_DRAFT",
  "GMAIL_GET_CONTACTS",
  "GMAIL_SEARCH_PEOPLE",
  // Slack — identity
  "SLACK_WHO_AM_I",
  // Slack — channels
  "SLACK_LIST_ALL_CHANNELS",
  "SLACK_LIST_CONVERSATIONS",
  "SLACK_FIND_CHANNELS",
  "SLACK_RETRIEVE_CONVERSATION_INFORMATION",
  "SLACK_RETRIEVE_CONVERSATION_MEMBERS_LIST",
  // Slack — messages
  "SLACK_FETCH_CONVERSATION_HISTORY",
  "SLACK_FETCH_MESSAGE_THREAD_FROM_A_CONVERSATION",
  "SLACK_SEARCH_MESSAGES",
  "SLACK_SEARCH_ALL",
  "SLACK_LIST_PINNED_ITEMS",
  "SLACK_LIST_STARRED_ITEMS",
  // Slack — users
  "SLACK_LIST_ALL_USERS",
  "SLACK_FIND_USERS",
  "SLACK_FIND_USER_BY_EMAIL_ADDRESS",
  "SLACK_RETRIEVE_DETAILED_USER_INFORMATION",
  "SLACK_RETRIEVE_USER_PROFILE_INFORMATION",
  "SLACK_GET_USER_PRESENCE",
  "SLACK_GET_USER_DND_STATUS",
  // Slack — files / workspace
  "SLACK_LIST_FILES_WITH_FILTERS_IN_SLACK",
  "SLACK_FETCH_TEAM_INFO",
  // Google Sheets — metadata
  "GOOGLESHEETS_GET_SPREADSHEET_INFO",
  "GOOGLESHEETS_GET_SHEET_NAMES",
  // Google Sheets — values
  "GOOGLESHEETS_VALUES_GET",
  "GOOGLESHEETS_BATCH_GET",
]);
