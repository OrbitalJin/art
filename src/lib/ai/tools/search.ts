import type { ToolSet } from "ai";
import {
  csessionTools,
  ensureSearchSession,
  resetSearchSession,
} from "@/lib/services/composio";

/**
 * Reads the search session's tools, recreating the session once if it is stale.
 * Returns the full search set; selection is the caller's job.
 */
export const searchTools = async (): Promise<ToolSet> => {
  const session = await ensureSearchSession();
  if (!session) return {};

  try {
    return (await csessionTools(session)) as ToolSet;
  } catch {
    resetSearchSession();
    const fresh = await ensureSearchSession();
    if (!fresh) return {};
    try {
      return (await csessionTools(fresh)) as ToolSet;
    } catch {
      return {};
    }
  }
};
