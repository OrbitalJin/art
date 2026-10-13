import type { Session } from "@/lib/store/session/types";
import { serviceById } from "@/lib/services/catalog";
import { TOOL_GROUPS, type Category, type ToolGroup } from "./groups";
import { cn } from "@/lib/utils";

export type Connections = Record<string, { isActive?: boolean } | undefined>;

export const selectableRowClasses = (active: boolean): string =>
  cn(
    "flex w-full cursor-pointer items-center gap-3 rounded-lg border px-2.5 py-2 text-left outline-none",
    "transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring/50",
    "disabled:pointer-events-none",
    active
      ? "border-foreground/15 bg-muted/50"
      : "border-transparent hover:bg-muted/40",
  );

export const isConnected = (connections: Connections, service: string): boolean =>
  connections[service]?.isActive === true;

export const groupEnabled = (
  session: Session,
  group: ToolGroup,
  connections: Connections,
): boolean => {
  if (session.groups?.[group.key] !== true) return false;
  const service = group.service ? serviceById(group.service) : undefined;
  if (service && !service.noAuth) return isConnected(connections, service.id);
  return true;
};

export const groupActive = (
  session: Session,
  group: ToolGroup,
  connections: Connections,
): boolean => groupEnabled(session, group, connections);

export const groupsInCategory = (category: Category): ToolGroup[] =>
  TOOL_GROUPS.filter((group) => group.category === category);

export const basename = (path: string): string => {
  const parts = path.split(/[\\/]/).filter(Boolean);
  return parts[parts.length - 1] ?? path;
};
