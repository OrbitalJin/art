import { Composio, SessionPreset } from "@composio/core";
import { VercelProvider } from "@composio/vercel";
import { nativeFetch } from "@/lib/native-fetch";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import {
  SUPPORTED_TOOLKITS,
  TOOLKIT_TOOL_ALLOWLIST,
} from "@/lib/services/toolkits";

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

export interface ToolkitConnection {
  toolkit: string;
  status: string;
  connectedAccountId?: string;
}

/** The session access policy derived from the app's enabled toolkits. */
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
 * Builds the session policy for a set of enabled toolkits. Only supported
 * toolkits are considered, and each contributes its read-only allowlist, so
 * the model can never reach a scope we did not explicitly enable.
 */
export const policyFor = (enabled: readonly string[]): SessionPolicy => {
  const active = SUPPORTED_TOOLKITS.filter((toolkit) => enabled.includes(toolkit));

  return {
    toolkits: { enable: [...active] },
    tools: Object.fromEntries(
      active.map((toolkit) => [
        toolkit,
        { enable: [...TOOLKIT_TOOL_ALLOWLIST[toolkit]] },
      ]),
    ),
  };
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
    toolkits: { enable: [...SUPPORTED_TOOLKITS] },
    tools: Object.fromEntries(
      SUPPORTED_TOOLKITS.map((toolkit) => [
        toolkit,
        { enable: [...TOOLKIT_TOOL_ALLOWLIST[toolkit]] },
      ]),
    ),
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

const appliedPolicies = new Map<string, string>();

/**
 * Applies the session policy derived from the app's enabled toolkits. The
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
 * Reads the connection state of the supported toolkits through the session,
 * which is the single source of truth for what the agent can actually call.
 */
export const listConnections = async (
  csession: ComposioSession,
): Promise<ToolkitConnection[]> => {
  const response = await csession.toolkits({
    toolkits: [...SUPPORTED_TOOLKITS],
  });

  return (response.items ?? [])
    .map((item) => ({
      toolkit: item.slug,
      status: item.connection?.isActive
        ? "ACTIVE"
        : (item.connection?.connectedAccount?.status ?? "NOT_CONNECTED"),
      connectedAccountId: item.connection?.connectedAccount?.id,
    }))
    .filter((entry) => entry.toolkit);
};

/**
 * Starts an authorization flow for a toolkit through the existing session.
 *
 * `composio.toolkits.authorize()` is unusable: it ends with the retired
 * `connectedAccounts.initiate` endpoint. `session.authorize()` uses the
 * session link endpoint instead, which takes the toolkit slug directly.
 */
export const authorizeToolkit = async (
  sessionId: string,
  toolkit: string,
): Promise<string> => {
  const csession = await getCSession(sessionId);
  if (!csession) {
    throw new Error("No Composio session. Add a key in Settings > Chat.");
  }

  const request = await csession.authorize(toolkit);
  const url = request.redirectUrl;
  if (!url) throw new Error("Composio did not return an authorization URL.");
  return url;
};

export const disconnect = async (connectedAccountId: string): Promise<void> => {
  const composio = await getComposio();
  if (!composio) return;
  await composio.connectedAccounts.delete(connectedAccountId);
};
