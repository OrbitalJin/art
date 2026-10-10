export const SUPPORTED_TOOLKITS = ["gmail"] as const;
export type SupportedToolkit = (typeof SUPPORTED_TOOLKITS)[number];

export const TOOLKIT_LABELS: Record<SupportedToolkit, string> = {
  gmail: "Gmail",
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
]);
