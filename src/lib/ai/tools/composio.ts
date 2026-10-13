import type { ToolSet } from "ai";
import type { Session } from "@/lib/store/session/types";
import { SUPPORTED_TOOLKITS } from "@/lib/services/toolkits";
import {
  applyCSessionPolicy,
  getCSession,
  policyFor,
  csessionTools,
} from "@/lib/services/composio";
import { useConnectionsStore } from "@/lib/store/use-connections-store";

/**
 * The enabled service toolkits, derived strictly from the chat session's
 * stored configuration. No local enable map: what the session says is what the
 * Composio session is told to expose.
 */
export const enabledToolkits = (session: Session): string[] =>
  SUPPORTED_TOOLKITS.filter((toolkit) => session.toolkits?.[toolkit] === true);

/**
 * Composio tools for a chat session, sourced from the shared Composio session
 * and formatted by the Vercel provider. The session policy is updated to match
 * the enabled toolkits before the tools are read, so the model only ever sees
 * the read-only scopes we allow.
 */
export const composioTools = async (session: Session): Promise<ToolSet> => {
  const enabled = enabledToolkits(session);
  if (enabled.length === 0) return {};

  const sessionId = await useConnectionsStore.getState().ensureSession();
  if (!sessionId) return {};

  const csession = await getCSession(sessionId);
  if (!csession) return {};

  await applyCSessionPolicy(csession, policyFor(enabled));
  return csessionTools(csession);
};
