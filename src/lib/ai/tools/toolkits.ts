import type { Session } from "@/lib/store/session/types";

/**
 * Whether a toolkit is enabled for a session. The session's stored `toolkits`
 * map is the single source of truth; defaults are seeded at session creation
 * (see `use-session-store`).
 */
export const toolkitEnabled = (
  session: Session | undefined,
  key: string,
): boolean => session?.toolkits?.[key] === true;
