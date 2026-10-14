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

/** The `session.groups` keys that back a group (children for service groups). */
export const groupToolKeys = (group: ToolGroup): string[] =>
  group.children?.length ? group.children.map((child) => child.key) : [group.key];

export const serviceConnected = (
  group: ToolGroup,
  connections: Connections,
): boolean => {
  const service = group.service ? serviceById(group.service) : undefined;
  if (!service || service.noAuth) return true;
  return isConnected(connections, service.id);
};

export const groupEnabled = (
  session: Session,
  group: ToolGroup,
  connections: Connections,
): boolean => {
  if (!serviceConnected(group, connections)) return false;
  return groupToolKeys(group).every(
    (key) => session.groups?.[key] === true,
  );
};

/** True when at least one tool of the group is enabled. */
export const groupAnyEnabled = (
  session: Session,
  group: ToolGroup,
  connections: Connections,
): boolean => {
  if (!serviceConnected(group, connections)) return false;
  return groupToolKeys(group).some((key) => session.groups?.[key] === true);
};

/** True when some but not all tools of the group are enabled. */
export const groupPartiallyEnabled = (
  session: Session,
  group: ToolGroup,
  connections: Connections,
): boolean => {
  if (!serviceConnected(group, connections)) return false;
  const keys = groupToolKeys(group);
  const on = keys.filter((key) => session.groups?.[key] === true).length;
  return on > 0 && on < keys.length;
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
