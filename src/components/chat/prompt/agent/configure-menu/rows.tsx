import { ChevronRight } from "lucide-react";
import { useConnectionsStore } from "@/lib/store/use-connections-store";
import { KEY_LABELS, useHasKey } from "@/lib/store/use-settings-store";
import type { Session } from "@/lib/store/session/types";
import { serviceById } from "@/lib/services/catalog";
import { CATEGORY_LABELS, type Category, type ToolGroup } from "./groups";
import {
  groupActive,
  groupsInCategory,
  isConnected,
  selectableRowClasses,
} from "./helpers";
import { cn } from "@/lib/utils";

const RowText: React.FC<{
  label: string;
  subtitle: string;
  active?: boolean;
}> = ({ label, subtitle, active = false }) => (
  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
    <span
      className={cn(
        "truncate text-[13px] font-medium",
        active ? "text-foreground" : "text-foreground/80",
      )}
    >
      {label}
    </span>
    <span className="truncate text-[11px] text-muted-foreground">
      {subtitle}
    </span>
  </span>
);

export const ToolRow: React.FC<{
  label: string;
  subtitle: string;
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}> = ({ label, subtitle, enabled, onToggle, disabled }) => (
  <button
    type="button"
    onClick={onToggle}
    disabled={disabled}
    className={cn(selectableRowClasses(enabled), disabled && "opacity-60")}
  >
    <RowText label={label} subtitle={subtitle} active={enabled} />
  </button>
);

const LinkRow: React.FC<{
  label: string;
  subtitle: string;
  active: boolean;
  trailing: React.ReactNode;
  onOpen: () => void;
}> = ({ label, subtitle, active, trailing, onOpen }) => {
  const trailingClasses = cn(
    "flex shrink-0 items-center gap-1.5 text-xs",
    active ? "text-foreground/80" : "text-muted-foreground",
  );

  return (
    <button
      type="button"
      onClick={onOpen}
      className={selectableRowClasses(active)}
    >
      <RowText label={label} subtitle={subtitle} active={active} />
      <span className={trailingClasses}>{trailing}</span>
      <ChevronRight
        size={14}
        aria-hidden
        className="shrink-0 text-muted-foreground/60"
      />
    </button>
  );
};

const FilesLink: React.FC<{
  folderCount: number;
  enabled: boolean;
  onOpen: () => void;
}> = ({ folderCount, enabled, onOpen }) => {
  const summary =
    folderCount > 0
      ? `${folderCount} ${folderCount === 1 ? "folder" : "folders"}`
      : "Connect";

  return (
    <LinkRow
      label="Files"
      subtitle="Read & write local folders"
      active={enabled}
      trailing={summary}
      onOpen={onOpen}
    />
  );
};

const ConnectionRow: React.FC<{
  group: ToolGroup;
  session: Session;
  onToggle: (key: string, value: boolean) => void;
}> = ({ group, session, onToggle }) => {
  const connections = useConnectionsStore((state) => state.connections);
  const service = group.service ? serviceById(group.service) : undefined;
  const connected = service ? isConnected(connections, service.id) : false;
  const enabled = connected && session.groups?.[group.key] === true;

  const subtitle = connected
    ? group.description
    : `${service?.label ?? "Service"} not connected — configure in Settings`;

  const rowClasses = cn(
    selectableRowClasses(enabled),
    !connected && "opacity-60",
  );

  return (
    <button
      type="button"
      disabled={!connected}
      aria-pressed={enabled}
      onClick={() => onToggle(group.key, !enabled)}
      className={rowClasses}
    >
      <RowText label={group.label} subtitle={subtitle} active={enabled} />
    </button>
  );
};

export const GroupRow: React.FC<{
  group: ToolGroup;
  session: Session;
  onOpenFiles: () => void;
  onToggle: (key: string, value: boolean) => void;
}> = ({ group, session, onOpenFiles, onToggle }) => {
  const hasKey = useHasKey(group.requiresKey);

  if (group.source === "files") {
    const folderCount = (session.folders ?? []).length;
    return (
      <FilesLink
        folderCount={folderCount}
        enabled={session.groups?.[group.key] === true}
        onOpen={onOpenFiles}
      />
    );
  }

  if (group.source === "service" && group.service) {
    const service = serviceById(group.service);
    if (service && !service.noAuth) {
      return (
        <ConnectionRow group={group} session={session} onToggle={onToggle} />
      );
    }
  }

  const enabled = hasKey && session.groups?.[group.key] === true;

  return (
    <ToolRow
      label={group.label}
      subtitle={
        hasKey || !group.requiresKey
          ? group.description
          : `Add a ${KEY_LABELS[group.requiresKey]} key in Settings`
      }
      enabled={enabled}
      disabled={!hasKey}
      onToggle={() => onToggle(group.key, !enabled)}
    />
  );
};

export const CategoryLink: React.FC<{
  category: Category;
  session: Session;
  onOpen: () => void;
}> = ({ category, session, onOpen }) => {
  const connections = useConnectionsStore((state) => state.connections);

  const groups = groupsInCategory(category);
  const activeGroups = groups.filter((group) =>
    groupActive(session, group, connections),
  );

  const active = activeGroups.length > 0;
  const subtitle = active
    ? activeGroups.map((group) => group.label).join(", ")
    : groups.map((group) => group.label).join(", ");
  const summary = active
    ? `${activeGroups.length} of ${groups.length}`
    : `${groups.length}`;

  return (
    <LinkRow
      label={CATEGORY_LABELS[category]}
      subtitle={subtitle}
      active={active}
      trailing={summary}
      onOpen={onOpen}
    />
  );
};
