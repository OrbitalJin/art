import type { Composio } from "@composio/core";
import type { VercelProvider } from "@composio/vercel";
import type { ToolSet } from "ai";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { nativeFetch } from "@/lib/native-fetch";
import {
  READ_ONLY_TOOLS,
  SEARCH_TOOLKITS,
  SUPPORTED_TOOLKITS,
} from "@/lib/services/toolkits";

const COMPOSIO_HOST_SUFFIX = ".composio.dev";
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
  if (host === "composio.dev" || host.endsWith(COMPOSIO_HOST_SUFFIX)) {
    return nativeFetch(input as string, init);
  }
  return originalFetch(input, init);
}) as typeof fetch;

export type ComposioClient = Composio<VercelProvider>;
export type ComposioSession = Awaited<
  ReturnType<ComposioClient["sessions"]["create"]>
>;

let instance: { key: string; composio: ComposioClient } | null = null;
let searchSession: ComposioSession | null = null;
const sessionCache = new Map<string, ComposioSession>();

export interface ToolCache {
  sessionId: string;
  tools: ToolSet;
  slugs: string[];
}

const toolCaches = new Map<string, ToolCache>();

const clearCaches = (): void => {
  sessionCache.clear();
  toolCaches.clear();
  searchSession = null;
};

export const getComposio = async (): Promise<ComposioClient | null> => {
  const apiKey = useSettingsStore.getState().composioApiKey;
  if (!apiKey) return null;
  if (instance?.key === apiKey) return instance.composio;
  const [{ Composio }, { VercelProvider }] = await Promise.all([
    import("@composio/core"),
    import("@composio/vercel"),
  ]);
  const composio = new Composio({
    apiKey,
    provider: new VercelProvider(),
    allowTracking: false,
    disableVersionCheck: true,
  });
  instance = { key: apiKey, composio };
  clearCaches();
  return composio;
};

export const createSession = async (
  userId: string,
): Promise<ComposioSession | null> => {
  const composio = await getComposio();
  if (!composio) return null;
  const { SessionPreset } = await import("@composio/core");
  const session = await composio.sessions.create(userId, {
    sessionPreset: SessionPreset.DIRECT_TOOLS,
    toolkits: { enable: [...SUPPORTED_TOOLKITS] },
  });
  sessionCache.set(session.sessionId, session);
  return session;
};

/**
 * A dedicated, no-auth session scoped to the search toolkits. Search tools
 * invoke slugs directly (`session.execute`) instead of enumerating and
 * filtering the toolkit's tools, so this session never surfaces tool schemas
 * to the model on its own.
 */
export const getSearchSession = async (): Promise<ComposioSession | null> => {
  const composio = await getComposio();
  if (!composio) return null;
  if (searchSession) return searchSession;
  const { SessionPreset } = await import("@composio/core");
  try {
    searchSession = await composio.sessions.create(
      useSettingsStore.getState().ensureComposioUserId(),
      {
        sessionPreset: SessionPreset.DIRECT_TOOLS,
        toolkits: { enable: [...SEARCH_TOOLKITS] },
      },
    );
    return searchSession;
  } catch {
    return null;
  }
};

export const getOrCreateSession = async (
  sessionId: string,
): Promise<ComposioSession | null> => {
  const cached = sessionCache.get(sessionId);
  if (cached) return cached;
  const composio = await getComposio();
  if (!composio) return null;
  try {
    const session = await composio.sessions.use(sessionId);
    sessionCache.set(session.sessionId, session);
    return session;
  } catch {
    sessionCache.delete(sessionId);
    return null;
  }
};

const MAX_STRING = 8000;

export const trimStrings = (value: unknown): unknown => {
  if (typeof value === "string")
    return value.length > MAX_STRING
      ? `${value.slice(0, MAX_STRING)}\n…[truncated ${value.length - MAX_STRING} chars]`
      : value;
  if (Array.isArray(value)) return value.map(trimStrings);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      out[key] = trimStrings(entry);
    }
    return out;
  }
  return value;
};

export const getToolCache = (sessionId: string): ToolCache | null =>
  toolCaches.get(sessionId) ?? null;

export const clearToolCache = (sessionId?: string): void => {
  if (sessionId) toolCaches.delete(sessionId);
  else toolCaches.clear();
};

type WrappedTool = ToolSet[string] & {
  execute?: (input: unknown, options: unknown) => unknown;
};

export const refreshComposioTools = async (
  sessionId: string,
): Promise<ToolCache | null> => {
  const session = await getOrCreateSession(sessionId);
  if (!session) {
    clearToolCache(sessionId);
    return null;
  }

  const wrapped = (await session.tools()) as Record<string, WrappedTool>;
  const tools: ToolSet = {};
  const slugs: string[] = [];

  for (const [slug, entry] of Object.entries(wrapped)) {
    if (!READ_ONLY_TOOLS.has(slug)) continue;
    slugs.push(slug);
    const original = entry.execute;
    tools[slug] = {
      ...entry,
      execute: original
        ? async (input: unknown, options: unknown) =>
            trimStrings(await original(input, options))
        : undefined,
    } as ToolSet[string];
  }

  const cache: ToolCache = { sessionId, tools, slugs };
  toolCaches.set(sessionId, cache);
  return cache;
};
