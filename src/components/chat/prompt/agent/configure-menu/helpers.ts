import type { Session } from "@/lib/store/session/types";
import { toolkitEnabled } from "@/lib/ai/tools/toolkits";
import {
  TOOL_FAMILIES,
  type ToolCategory,
  type ToolFamily,
} from "@/lib/ai/tools/registry";
import { cn } from "@/lib/utils";

export type Toolkits = Record<string, { status?: string } | undefined>;

export const selectableRowClasses = (active: boolean): string =>
  cn(
    "flex w-full cursor-pointer items-center gap-3 rounded-lg border px-2.5 py-2 text-left outline-none",
    "transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring/50",
    "disabled:pointer-events-none",
    active
      ? "border-foreground/15 bg-muted/50"
      : "border-transparent hover:bg-muted/40",
  );

export const isConnected = (toolkits: Toolkits, key: string): boolean =>
  toolkits[key]?.status === "ACTIVE";

export const familyEnabled = (
  session: Session,
  family: ToolFamily,
  toolkits: Toolkits,
): boolean =>
  toolkitEnabled(session, family.key) &&
  (family.source !== "composio" || isConnected(toolkits, family.key));

export const familyActive = (
  session: Session,
  family: ToolFamily,
  toolkits: Toolkits,
): boolean => familyEnabled(session, family, toolkits);

export const familiesInCategory = (category: ToolCategory): ToolFamily[] =>
  TOOL_FAMILIES.filter((family) => family.category === category);

export const basename = (path: string): string => {
  const parts = path.split(/[\\/]/).filter(Boolean);
  return parts[parts.length - 1] ?? path;
};
