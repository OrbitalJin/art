import { SUPPORTED_TOOLKITS } from "@/lib/services/composio";
import type { Session } from "@/lib/store/session/types";

const CONNECTION_TOOLKITS = new Set<string>(SUPPORTED_TOOLKITS);

export const toolkitEnabled = (session: Session, key: string): boolean => {
  const explicit = session.toolkits?.[key];
  if (explicit !== undefined) return explicit;
  if (CONNECTION_TOOLKITS.has(key)) return true;
  if (key === "askUser" || key === "todo") return session.type === "agent";
  return false;
};
