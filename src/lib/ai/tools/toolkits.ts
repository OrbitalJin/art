import { SUPPORTED_TOOLKITS } from "@/lib/services/toolkits";
import type { Session } from "@/lib/store/session/types";

const CONNECTION_TOOLKITS = new Set<string>(SUPPORTED_TOOLKITS);

export const toolkitEnabled = (
  session: Session | undefined,
  key: string,
): boolean => {
  if (!session) return false;
  const explicit = session.toolkits?.[key];
  if (explicit !== undefined) return explicit;
  if (CONNECTION_TOOLKITS.has(key)) return true;
  if (key === "files") return (session.folders?.length ?? 0) > 0;
  if (key === "askUser" || key === "todo") return session.type === "agent";
  return false;
};
