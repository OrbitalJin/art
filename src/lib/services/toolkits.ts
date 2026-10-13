export const SUPPORTED_TOOLKITS = ["gmail"] as const;
export type SupportedToolkit = (typeof SUPPORTED_TOOLKITS)[number];

export const TOOLKIT_LABELS: Record<SupportedToolkit, string> = {
  gmail: "Gmail",
};

export const TOOLKIT_DESCRIPTIONS: Record<SupportedToolkit, string> = {
  gmail: "Read-only access to Gmail",
};

/**
 * The underlying Composio slugs a toolkit is allowed to execute. The session
 * enables only these, and we never hand `session.tools()` to the model, so the
 * raw slugs stay hidden behind our own app-owned tools.
 */
export const TOOLKIT_TOOL_ALLOWLIST: Record<SupportedToolkit, readonly string[]> =
  {
    gmail: [
      "GMAIL_FETCH_EMAILS",
      "GMAIL_LIST_MESSAGES",
      "GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID",
      "GMAIL_LIST_LABELS",
    ],
  };
