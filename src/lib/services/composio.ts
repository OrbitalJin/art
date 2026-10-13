import { Composio, SessionPreset } from "@composio/core";
import { VercelProvider } from "@composio/vercel";
import { nativeFetch } from "@/lib/native-fetch";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import {
  CONNECTED_SERVICES,
  SERVICES,
  SERVICE_TOOL_IDS,
} from "@/lib/services/catalog";

/**
 * Composio SDK wrapper.
 *
 * The SDK talks to `*.composio.dev` through `globalThis.fetch`, which the
 * packaged Tauri webview cannot use (the API does not return CORS headers for
 * the `tauri://` origin). We route only Composio traffic through Tauri's HTTP
 * plugin; everything else keeps the native fetch.
 */

const COMPOSIO_HOST = "composio.dev";
const originalFetch = globalThis.fetch;

globalThis.fetch = ((input, init) => {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url;

  let host = "";
  try {
    host = new URL(url, "http://tauri.localhost").hostname;
  } catch {
    host = "";
  }

  if (host === COMPOSIO_HOST || host.endsWith(`.${COMPOSIO_HOST}`)) {
    return nativeFetch(input as string, init);
  }
  return originalFetch(input, init);
}) as typeof fetch;

type ComposioClient = Composio<VercelProvider>;

export type ComposioSession = Awaited<
  ReturnType<ComposioClient["sessions"]["create"]>
>;

export interface ServiceConnection {
  service: string;
  isActive: boolean;
  status?: string;
  connectedAccountId?: string;
}

/** The session access policy derived from the app's enabled services. */
export interface SessionPolicy {
  toolkits: { enable: string[] };
  tools: Record<string, { enable: string[] }>;
}

let instance: { key: string; composio: ComposioClient } | null = null;

export const getComposio = async (): Promise<ComposioClient | null> => {
  const apiKey = useSettingsStore.getState().composioApiKey;
  if (!apiKey) return null;
  if (instance?.key === apiKey) return instance.composio;

  const composio = new Composio({
    apiKey,
    provider: new VercelProvider({}),
    allowTracking: false,
    disableVersionCheck: true,
  });
  instance = { key: apiKey, composio };
  return composio;
};

/**
 * Builds the session policy for a set of enabled tool ids. Composio keys tools
 * by service (its "toolkit"), so enabled ids are grouped under their service.
 * Only the enabled ids are exposed, so the model can never reach a scope we did
 * not explicitly enable.
 */
export const policyFor = (enabledToolIds: readonly string[]): SessionPolicy => {
  const toolkits: string[] = [];
  const tools: Record<string, { enable: string[] }> = {};

  for (const service of Object.values(SERVICES)) {
    const enabled = Object.values(service.tools).filter((toolId) =>
      enabledToolIds.includes(toolId),
    );
    if (enabled.length === 0) continue;
    toolkits.push(service.id);
    tools[service.id] = { enable: enabled };
  }

  return { toolkits: { enable: toolkits }, tools };
};

export const getOrCreateCSession = async (
  userId: string,
  sessionId: string | null,
): Promise<ComposioSession | null> => {
  const composio = await getComposio();
  if (!composio) return null;

  if (sessionId) {
    try {
      return await composio.sessions.use(sessionId);
    } catch {
      // The persisted session is gone (or was created under another key);
      // fall through and create a fresh one.
    }
  }

  return composio.sessions.create(userId, {
    ...policyFor(SERVICE_TOOL_IDS),
    sessionPreset: SessionPreset.DIRECT_TOOLS,
    manageConnections: { enable: false },
    sandbox: { enable: false },
  });
};

export const getCSession = async (
  sessionId: string,
): Promise<ComposioSession | null> => {
  const composio = await getComposio();
  if (!composio) return null;
  try {
    return await composio.sessions.use(sessionId);
  } catch {
    return null;
  }
};

/**
 * The dedicated, no-auth search session. Search tools never depend on a
 * connected account, so this session is created lazily and cached per API key
 * (a session is only valid for the key that created it).
 */
let searchSession: { key: string; session: ComposioSession } | null = null;

export const resetSearchSession = (): void => {
  searchSession = null;
};

export const ensureSearchSession = async (): Promise<ComposioSession | null> => {
  const apiKey = useSettingsStore.getState().composioApiKey;
  if (!apiKey) return null;
  if (searchSession?.key === apiKey) return searchSession.session;

  const composio = await getComposio();
  if (!composio) return null;

  try {
    const session = await composio.sessions.create(
      useSettingsStore.getState().ensureComposioUserId(),
      {
        toolkits: { enable: [SERVICES.search.id] },
        sessionPreset: SessionPreset.DIRECT_TOOLS,
        manageConnections: { enable: false },
        sandbox: { enable: false },
      },
    );
    searchSession = { key: apiKey, session };
    return session;
  } catch {
    return null;
  }
};

const appliedPolicies = new Map<string, string>();

/**
 * Applies the session policy derived from the app's enabled services. The
 * update is skipped when the policy already matches what we last sent for this
 * session, so repeated turns do not churn the remote config.
 */
export const applyCSessionPolicy = async (
  csession: ComposioSession,
  policy: SessionPolicy,
): Promise<void> => {
  const key = JSON.stringify(policy);
  if (appliedPolicies.get(csession.sessionId) === key) return;

  await csession.update(policy);
  appliedPolicies.set(csession.sessionId, key);
};

/**
 * Returns the session's tools, formatted by the configured Vercel provider.
 * Each tool carries its own `execute`, so the AI SDK runs calls directly.
 */
export const csessionTools = (csession: ComposioSession) => csession.tools();

/**
 * Reads the connection state of the connected services through the session,
 * which is the single source of truth for what the agent can actually call.
 */
export const listConnections = async (
  csession: ComposioSession,
): Promise<ServiceConnection[]> => {
  const response = await csession.toolkits({
    toolkits: CONNECTED_SERVICES.map((service) => service.id),
  });

  return (response.items ?? [])
    .filter((item) => item.slug)
    .map((item) => ({
      service: item.slug,
      isActive: item.connection?.isActive === true,
      status: item.connection?.connectedAccount?.status,
      connectedAccountId: item.connection?.connectedAccount?.id,
    }));
};

/**
 * Starts an authorization flow for a toolkit through the existing session.
 *
 * `composio.toolkits.authorize()` is unusable: it ends with the retired
 * `connectedAccounts.initiate` endpoint. `session.authorize()` uses the
 * session link endpoint instead, which takes the toolkit slug directly.
 */
export const authorizeService = async (
  sessionId: string,
  service: string,
): Promise<string> => {
  const csession = await getCSession(sessionId);
  if (!csession) {
    throw new Error("No Composio session. Add a key in Settings > Chat.");
  }

  const request = await csession.authorize(service);
  const url = request.redirectUrl;
  if (!url) throw new Error("Composio did not return an authorization URL.");
  return url;
};

export const disconnect = async (connectedAccountId: string): Promise<void> => {
  const composio = await getComposio();
  if (!composio) return;
  await composio.connectedAccounts.delete(connectedAccountId);
};
