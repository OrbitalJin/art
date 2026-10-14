import type { LucideIcon } from "lucide-react";
import { TOOL_GROUPS } from "./configure-menu/groups";
import { useConnectionsStore } from "@/lib/store/use-connections-store";
import type { SessionMeta } from "@/lib/store/session/types";
import { basename, groupAnyEnabled } from "./configure-menu/helpers";
import type { IconType } from "react-icons";

const MAX_VISIBLE = 5;

interface ToolEntry {
  key: string;
  label: string;
  title: string;
  icon: LucideIcon | IconType;
}

const ToolChip: React.FC<{ entry: ToolEntry }> = ({ entry }) => {
  const Icon = entry.icon;

  return (
    <span
      title={entry.title}
      className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground/70 transition-colors duration-150 hover:bg-muted/60 hover:text-foreground"
    >
      <Icon size={13} aria-hidden />
    </span>
  );
};

export const EnabledTools: React.FC<{ session: SessionMeta }> = ({ session }) => {
  const connections = useConnectionsStore((state) => state.connections);

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

    if (groupAnyEnabled(session, group, connections)) {
      entries.push({
        key: group.key,
        label: group.label,
        title: group.label,
        icon: group.icon,
      });
    }
  }

  if (entries.length === 0) {
    return (
      <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground/50">
        No tools enabled
      </span>
    );
  }

  const visible = entries.slice(0, MAX_VISIBLE);
  const hidden = entries.slice(MAX_VISIBLE);

  return (
    <span className="flex min-w-0 flex-1 items-center">
      <span
        className="flex items-center gap-0.5"
        aria-label={`${entries.length} ${entries.length === 1 ? "tool" : "tools"} enabled`}
      >
        {visible.map((entry) => (
          <ToolChip key={entry.key} entry={entry} />
        ))}

        {hidden.length > 0 && (
          <span
            title={hidden.map((entry) => entry.label).join(", ")}
            className="px-1 text-[11px] tabular-nums text-muted-foreground/70"
          >
            +{hidden.length}
          </span>
        )}
      </span>
    </span>
  );
};
