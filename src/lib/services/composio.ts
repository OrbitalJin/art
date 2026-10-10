import type { Composio } from "@composio/core";
import type { VercelProvider } from "@composio/vercel";
import type { ToolSet } from "ai";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { READ_ONLY_TOOLS, SUPPORTED_TOOLKITS } from "@/lib/services/toolkits";

export type ComposioClient = Composio<VercelProvider>;
export type ComposioSession = Awaited<
  ReturnType<ComposioClient["sessions"]["create"]>
>;

let instance: { key: string; composio: ComposioClient } | null = null;
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
