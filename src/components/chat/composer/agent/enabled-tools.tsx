import type { LucideIcon } from "lucide-react";
import { TOOL_GROUPS } from "./configure-menu/groups";
import type { SessionMeta } from "@/lib/store/session/types";
import { basename, groupAnyEnabled } from "./configure-menu/helpers";
import type { IconType } from "react-icons";
import { cn } from "@/lib/utils";

const MAX_VISIBLE = 5;

interface ToolEntry {
  key: string;
  label: string;
  title: string;
  icon: LucideIcon | IconType;
}

const ToolChip: React.FC<{ entry: ToolEntry }> = ({ entry }) => {
  const Icon = entry.icon;

  const chipClassName = cn(
    "flex size-6 shrink-0 items-center justify-center rounded-full",
    "text-muted-foreground/70 ring-1 ring-inset ring-transparent",
    "transition-all duration-150",
    "hover:bg-accent/60 hover:text-foreground hover:ring-foreground/10",
  );

  return (
    <span title={entry.title} className={chipClassName}>
      <Icon size={13} aria-hidden />
    </span>
  );
};

const OverflowChip: React.FC<{ hidden: ToolEntry[] }> = ({ hidden }) => {
  const chipClassName = cn(
    "ml-0.5 flex h-5 items-center rounded-full bg-muted/50 px-1.5",
    "text-[10px] font-medium tabular-nums text-muted-foreground/80",
    "transition-colors duration-150 hover:bg-muted hover:text-foreground",
  );

  const title = hidden.map((entry) => entry.label).join(", ");

  return (
    <span title={title} className={chipClassName}>
      +{hidden.length}
    </span>
  );
};

const NoTools: React.FC = () => {
  const textClassName = cn(
    "min-w-0 flex-1 truncate text-xs text-muted-foreground/50",
  );

  return (
    <span className="flex min-w-0 flex-1 items-center gap-2">
      <span
        aria-hidden
        className="size-1 shrink-0 rounded-full bg-muted-foreground/30"
      />
      <span className={textClassName}>No tools enabled</span>
    </span>
  );
};

export const EnabledTools: React.FC<{ session: SessionMeta }> = ({
  session,
}) => {
  const entries: ToolEntry[] = [];
  for (const group of TOOL_GROUPS) {
    if (group.source === "files") {
      const folders = session.folders ?? [];
      if (!folders.length || session.groups?.[group.key] !== true) continue;
      const summary =
        folders.length === 1
          ? basename(folders[0].path)
          : `${folders.length} folders`;
      entries.push({
        key: group.key,
        label: group.label,
        title: `${group.label} · ${summary}`,
        icon: group.icon,
      });
      continue;
    }

    if (groupAnyEnabled(session, group)) {
      entries.push({
        key: group.key,
        label: group.label,
        title: group.label,
        icon: group.icon,
      });
    }
  }

  if (entries.length === 0) return <NoTools />;

  const visible = entries.slice(0, MAX_VISIBLE);
  const hidden = entries.slice(MAX_VISIBLE);
  const noun = entries.length === 1 ? "tool" : "tools";
  const ariaLabel = `${entries.length} ${noun} enabled`;

  return (
    <span className="flex min-w-0 flex-1 items-center">
      <span className="flex items-center gap-0.5" aria-label={ariaLabel}>
        {visible.map((entry) => (
          <ToolChip key={entry.key} entry={entry} />
        ))}

        {hidden.length > 0 && <OverflowChip hidden={hidden} />}
      </span>
    </span>
  );
};
