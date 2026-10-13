export const SearchTools = {
  web: "COMPOSIO_SEARCH_WEB",
  fetch: "COMPOSIO_SEARCH_FETCH_URL_CONTENT",
  news: "COMPOSIO_SEARCH_NEWS",
  flights: "COMPOSIO_SEARCH_FLIGHTS",
  hotels: "COMPOSIO_SEARCH_HOTELS",
  maps: "COMPOSIO_SEARCH_GOOGLE_MAPS",
} as const;

export const GmailTools = {
  fetchEmails: "GMAIL_FETCH_EMAILS",
  listMessages: "GMAIL_LIST_MESSAGES",
  fetchMessageById: "GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID",
  listLabels: "GMAIL_LIST_LABELS",
} as const;

/** A Composio tool id, e.g. `GMAIL_FETCH_EMAILS`. */
export type ToolId = string;

/**
 * A Composio integration. Owns a connection (unless `noAuth`) and a set of
 * tools. `id` is the Composio toolkit slug, used for the session policy and the
 * connection state.
 */
export interface Service {
  id: string;
  label: string;
  description: string;
  noAuth: boolean;
  tools: Record<string, ToolId>;
}

export const SERVICES: Record<string, Service> = {
  search: {
    id: "composio_search",
    label: "Search",
    description: "Web search and lookup",
    noAuth: true,
    tools: SearchTools,
  },
  gmail: {
    id: "gmail",
    label: "Gmail",
    description: "Read-only access to Gmail",
    noAuth: false,
    tools: GmailTools,
  },
};

/** Services that require a connection (everything except the no-auth ones). */
export const CONNECTED_SERVICES: Service[] = Object.values(SERVICES).filter(
  (service) => !service.noAuth,
);

export const SERVICE_TOOL_IDS: ToolId[] = Object.values(GmailTools);

export const serviceById = (id: string): Service | undefined =>
  Object.values(SERVICES).find((service) => service.id === id);
