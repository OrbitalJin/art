import { executeTool } from "@/lib/services/composio";
import { useConnectionsStore } from "@/lib/store/use-connections-store";
import { asRecord } from "@/lib/utils/coerce";

/**
 * The single transport path for every Composio tool. It resolves a session,
 * executes the slug, normalizes the payload, and reports failures in one
 * consistent shape so tool definitions and renderers never deal with raw
 * Composio envelopes.
 */

export type SessionResolver = () => string | null | Promise<string | null>;

export interface ComposioResult {
  ok: boolean;
  data: Record<string, unknown>;
  error: string | null;
}

const NO_SESSION =
  "No Composio session. Connect an account in Settings > Chat.";

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const isSessionError = (message: string): boolean =>
  /session/i.test(message) &&
  /(not found|invalid|expired|missing|unknown)/i.test(message);

/** Longest string kept from any single field before truncation. */
const MAX_STRING = 8000;

const truncate = (value: unknown): unknown => {
  if (typeof value === "string") {
    return value.length > MAX_STRING
      ? `${value.slice(0, MAX_STRING)}\n…[truncated ${value.length - MAX_STRING} chars]`
      : value;
  }
  if (Array.isArray(value)) return value.map(truncate);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      out[key] = truncate(entry);
    }
    return out;
  }
  return value;
};

/**
 * Some Composio tools wrap their payload as `{ data, successful }` (and may
 * stringify it). Peel those layers until the real payload surfaces.
 */
const unwrap = (value: unknown): unknown => {
  let current = value;
  for (let depth = 0; depth < 4; depth += 1) {
    if (typeof current === "string") {
      const trimmed = current.trim();
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        try {
          current = JSON.parse(trimmed) as unknown;
          continue;
        } catch {
          return current;
        }
      }
      return current;
    }

    const record = asRecord(current);
    if (!record) return current;

    const hasEnvelope = "data" in record && ("successful" in record || "error" in record);
    if (!hasEnvelope) return current;
    current = record.data;
  }
  return current;
};

const defaultSession = (): string | null =>
  useConnectionsStore.getState().sessionId;

export const runComposioTool = async (
  slug: string,
  args: Record<string, unknown>,
  session?: SessionResolver,
): Promise<ComposioResult> => {
  try {
    const resolve = session ?? defaultSession;
    let sessionId = await resolve();

    if (!sessionId && !session) {
      sessionId = await useConnectionsStore.getState().ensureSession();
    }
    if (!sessionId) return { ok: false, data: {}, error: NO_SESSION };

    let response = await executeTool(sessionId, slug, args);

    // A cached session can go stale. Recreate it once and retry.
    if (response.error && isSessionError(response.error) && !session) {
      const fresh = await useConnectionsStore.getState().ensureSession(true);
      if (fresh) response = await executeTool(fresh, slug, args);
    }

    if (response.error) {
      return { ok: false, data: {}, error: response.error };
    }

    const data = asRecord(unwrap(response.data)) ?? {};
    return { ok: true, data: truncate(data) as Record<string, unknown>, error: null };
  } catch (error) {
    return { ok: false, data: {}, error: messageOf(error) };
  }
};
