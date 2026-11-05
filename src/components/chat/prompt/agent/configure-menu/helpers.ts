import type { SessionMeta } from "@/lib/store/session/types";
import { TOOL_GROUPS, type Category, type ToolGroup } from "./groups";
import { cn } from "@/lib/utils";

export const selectableRowClasses = (active: boolean): string =>
  cn(
    "flex w-full cursor-pointer items-center gap-3 rounded-lg border px-2.5 py-2 text-left outline-none",
    "transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring/50",
    "disabled:pointer-events-none",
    active
      ? "border-foreground/15 bg-muted/50"
      : "border-transparent hover:bg-muted/40",
  );

/** The `session.groups` key that backs a group. */
export const groupToolKeys = (group: ToolGroup): string[] => [group.key];

export const groupEnabled = (
  session: SessionMeta,
  group: ToolGroup,
): boolean =>
  groupToolKeys(group).every((key) => session.groups?.[key] === true);

/** True when at least one tool of the group is enabled. */
export const groupAnyEnabled = (
  session: SessionMeta,
  group: ToolGroup,
): boolean =>
  groupToolKeys(group).some((key) => session.groups?.[key] === true);

export const groupActive = (
  session: SessionMeta,
  group: ToolGroup,
): boolean => groupEnabled(session, group);

export const groupsInCategory = (category: Category): ToolGroup[] =>
  TOOL_GROUPS.filter((group) => group.category === category);

export const basename = (path: string): string => {
  const parts = path.split(/[\\/]/).filter(Boolean);
  return parts[parts.length - 1] ?? path;
};
