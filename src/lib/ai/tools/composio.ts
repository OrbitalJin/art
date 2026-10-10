import type { ToolSet } from "ai";
import { getToolCache } from "@/lib/services/composio";
import { useConnectionsStore } from "@/lib/store/use-connections-store";
import type { Session } from "@/lib/store/session/types";
import { toolkitEnabled } from "./toolkits";

const toolkitOfSlug = (slug: string): string =>
  slug.split("_")[0]?.toLowerCase() ?? "";

export const composioTools = (session: Session): ToolSet => {
  const sessionId = useConnectionsStore.getState().sessionId;
  if (!sessionId) return {};

  const cache = getToolCache(sessionId);
  if (!cache) return {};

  const out: ToolSet = {};
  for (const slug of cache.slugs) {
    if (!toolkitEnabled(session, toolkitOfSlug(slug))) continue;
    const entry = cache.tools[slug];
    if (entry) out[slug] = entry;
  }
  return out;
};
