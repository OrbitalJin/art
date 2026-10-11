import type { Session } from "@/lib/store/session/types";
import { toolFamily } from "./registry";

export const toolkitEnabled = (
  session: Session | undefined,
  key: string,
): boolean => {
  if (!session) return false;
  const explicit = session.toolkits?.[key];
  if (explicit !== undefined) return explicit;
  return toolFamily(key)?.defaultEnabled(session) ?? false;
};
