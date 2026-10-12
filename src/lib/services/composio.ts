import { useSettingsStore } from "@/lib/store/use-settings-store";
import { nativeFetch } from "@/lib/native-fetch";
import { SEARCH_TOOLKITS, SUPPORTED_TOOLKITS } from "@/lib/services/toolkits";

/**
 * Minimal Composio REST client.
 *
 * The app talks to the v3.1 HTTP API directly instead of pulling in the
 * `@composio/*` SDKs. Requests go through `nativeFetch` (Tauri's HTTP plugin),
 * so no global `fetch` patch is needed. Each tool owns its own input/output
 * schema; this module only handles transport.
 */

const BASE_URL = "https://backend.composio.dev/api/v3.1";

export class ComposioApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status = 0, body: unknown = null) {
    super(message);
    this.name = "ComposioApiError";
    this.status = status;
    this.body = body;
  }
}

const parseJson = (text: string): unknown => {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const stringOf = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value : null;

const errorMessageOf = (body: unknown, status: number): string => {
  if (typeof body === "string" && body.trim()) return body;

  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    const direct = stringOf(record.message) ?? stringOf(record.detail);
    if (direct) return direct;

    const nested = record.error;
    const nestedString = stringOf(nested);
    if (nestedString) return nestedString;
    if (nested && typeof nested === "object") {
      const nestedMessage = stringOf(
        (nested as Record<string, unknown>).message,
      );
      if (nestedMessage) return nestedMessage;
    }

    try {
      return JSON.stringify(body);
    } catch {
      // fall through
    }
  }

  return `Composio request failed (${status})`;
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const apiKey = useSettingsStore.getState().composioApiKey;
  if (!apiKey) {
    throw new ComposioApiError(
      "Add a Composio key in Settings > Chat.",
    );
  }

  const response = await nativeFetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      ...(init?.headers ?? {}),
    },
  });

  const body = parseJson(await response.text());
  if (!response.ok) {
    throw new ComposioApiError(
      errorMessageOf(body, response.status),
      response.status,
      body,
    );
  }
  return body as T;
};

interface SessionCreateResponse {
  session_id: string;
}

interface SessionExecuteResponse {
  data: Record<string, unknown> | null;
  error: string | null;
  successful?: boolean;
  log_id: string;
}

interface SessionLinkResponse {
  redirect_url: string;
  connected_account_id: string;
}

interface SessionToolkitsResponse {
  items?: Array<{
    slug: string;
    connected_account: { id: string; status: string } | null;
  }>;
}

export interface ComposioExecuteResult {
  data: Record<string, unknown>;
  error: string | null;
  logId: string;
}

export interface ToolkitConnection {
  toolkit: string;
  status: string;
  connectedAccountId?: string;
}

/**
 * Cached search session, tagged with the API key that created it. A session is
 * only valid for the key it was created under, so changing the key in Settings
 * must not reuse the old one.
 */
let searchSession: { key: string; id: string } | null = null;

export const createSession = async (userId: string): Promise<string> => {
  const body = await request<SessionCreateResponse>("/tool_router/session", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId,
      toolkits: { enable: [...SUPPORTED_TOOLKITS] },
    }),
  });
  return body.session_id;
};

const createSearchSession = async (userId: string): Promise<string> => {
  const body = await request<SessionCreateResponse>("/tool_router/session", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId,
      toolkits: { enable: [...SEARCH_TOOLKITS] },
    }),
  });
  return body.session_id;
};

export const ensureSearchSession = async (): Promise<string> => {
  const apiKey = useSettingsStore.getState().composioApiKey;
  if (searchSession && searchSession.key === apiKey) return searchSession.id;

  const userId = useSettingsStore.getState().ensureComposioUserId();
  const id = await createSearchSession(userId);
  searchSession = { key: apiKey, id };
  return id;
};

export const executeTool = async (
  session: string,
  slug: string,
  args: Record<string, unknown>,
): Promise<ComposioExecuteResult> => {
  const body = await request<SessionExecuteResponse>(
    `/tool_router/session/${session}/execute`,
    {
      method: "POST",
      body: JSON.stringify({ tool_slug: slug, arguments: args }),
    },
  );

  // Composio can report a failed execution with HTTP 200 and no `error`
  // string, so `successful === false` must be treated as a failure too.
  const error =
    body.error ??
    (body.successful === false
      ? `${slug} did not complete successfully.`
      : null);

  return {
    data: body.data ?? {},
    error,
    logId: body.log_id ?? "",
  };
};

export const authorize = async (
  session: string,
  toolkit: string,
): Promise<string> => {
  const body = await request<SessionLinkResponse>(
    `/tool_router/session/${session}/link`,
    {
      method: "POST",
      body: JSON.stringify({ toolkit }),
    },
  );
  return body.redirect_url;
};

export const listConnections = async (
  session: string,
): Promise<ToolkitConnection[]> => {
  const body = await request<SessionToolkitsResponse>(
    `/tool_router/session/${session}/toolkits`,
  );
  return (body.items ?? []).map((item) => ({
    toolkit: item.slug,
    status: item.connected_account?.status ?? "NOT_CONNECTED",
    connectedAccountId: item.connected_account?.id,
  }));
};

export const disconnect = async (connectedAccountId: string): Promise<void> => {
  await request(`/connected_accounts/${connectedAccountId}`, {
    method: "DELETE",
  });
};
