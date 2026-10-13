import type { ToolSet } from "ai";
import {
  applyCSessionPolicy,
  getCSession,
  policyFor,
  csessionTools,
} from "@/lib/services/composio";
import { SERVICE_TOOL_IDS } from "@/lib/services/catalog";
import { useConnectionsStore } from "@/lib/store/use-connections-store";

/**
 * The connected-service tools, sourced from the shared Composio session and
 * formatted by the Vercel provider. Returns the full service set; selection is
 * the caller's job.
 */
export const composioTools = async (): Promise<ToolSet> => {
  const sessionId = await useConnectionsStore.getState().ensureSession();
  if (!sessionId) return {};

  const csession = await getCSession(sessionId);
  if (!csession) return {};

  await applyCSessionPolicy(csession, policyFor(SERVICE_TOOL_IDS));
  return csessionTools(csession);
};
