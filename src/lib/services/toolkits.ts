export const SUPPORTED_TOOLKITS = ["gmail", "slack", "googlesheets"] as const;
export type SupportedToolkit = (typeof SUPPORTED_TOOLKITS)[number];

/**
 * Search toolkits are enabled on a dedicated, no-auth session and invoked by
 * slug directly. They are intentionally kept out of `SUPPORTED_TOOLKITS` so
 * they never appear in the Connections UI.
 */
export const SEARCH_TOOLKITS = ["composio_search"] as const;
export type SearchToolkit = (typeof SEARCH_TOOLKITS)[number];

export const TOOLKIT_LABELS: Record<SupportedToolkit, string> = {
  gmail: "Gmail",
  slack: "Slack",
  googlesheets: "Google Sheets",
};

export const TOOLKIT_DESCRIPTIONS: Record<SupportedToolkit, string> = {
  gmail: "Read-only access to Gmail",
  slack: "Read-only access to Slack",
  googlesheets: "Read-only access to Google Sheets",
};
