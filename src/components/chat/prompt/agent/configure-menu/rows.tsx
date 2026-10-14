import { ChevronRight } from "lucide-react";
import { useConnectionsStore } from "@/lib/store/use-connections-store";
import type { Session } from "@/lib/store/session/types";
import { serviceById } from "@/lib/services/catalog";
import { CATEGORY_LABELS, type Category, type ToolGroup } from "./groups";
import {
  groupActive,
  groupAnyEnabled,
  groupEnabled,
  groupPartiallyEnabled,
  groupToolKeys,
  groupsInCategory,
  isConnected,
  selectableRowClasses,
  serviceConnected,
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
}> = ({ label, subtitle, enabled, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className={selectableRowClasses(enabled)}
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

const ServiceGroupRow: React.FC<{
  group: ToolGroup;
  session: Session;
  onOpenTools: () => void;
  onToggle: (key: string, value: boolean) => void;
}> = ({ group, session, onOpenTools, onToggle }) => {
  const connections = useConnectionsStore((state) => state.connections);
  const connected = serviceConnected(group, connections);
  const keys = groupToolKeys(group);
  const allOn = groupEnabled(session, group, connections);
  const anyOn = groupAnyEnabled(session, group, connections);
  const partial = groupPartiallyEnabled(session, group, connections);
  const onCount = keys.filter((key) => session.groups?.[key] === true).length;

  const service = group.service ? serviceById(group.service) : undefined;
  const subtitle = connected
    ? group.description
    : `${service?.label ?? "Service"} not connected — configure in Settings`;

  const rowClasses = cn(
    selectableRowClasses(anyOn),
    "gap-1 pr-1",
    !connected && "opacity-60",
  );

  const toggleButtonClasses = cn(
    "flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left outline-none",
    "disabled:pointer-events-none",
  );

  const moreButtonClasses = cn(
    "flex shrink-0 cursor-pointer items-center justify-center rounded-md p-1",
    "text-muted-foreground/60 transition-colors hover:bg-muted/60 hover:text-foreground",
    "outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
  );

  const handleToggle = () => {
    if (!connected) return;
    const value = !allOn;
    for (const key of keys) onToggle(key, value);
  };

  return (
    <div className={rowClasses}>
      <button
        type="button"
        disabled={!connected}
        aria-pressed={allOn}
        onClick={handleToggle}
        className={toggleButtonClasses}
      >
        <RowText label={group.label} subtitle={subtitle} active={anyOn} />
        {partial && (
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {onCount}/{keys.length}
          </span>
        )}
      </button>

      <button
        type="button"
        aria-label={`${group.label} tools`}
        onClick={onOpenTools}
        className={moreButtonClasses}
      >
        <ChevronRight size={14} aria-hidden />
      </button>
    </div>
  );
};

export const GroupRow: React.FC<{
  group: ToolGroup;
  session: Session;
  onOpenFiles: () => void;
  onOpenTools: () => void;
  onToggle: (key: string, value: boolean) => void;
}> = ({ group, session, onOpenFiles, onOpenTools, onToggle }) => {
  if (group.children?.length) {
    return (
      <ServiceGroupRow
        group={group}
        session={session}
        onOpenTools={onOpenTools}
        onToggle={onToggle}
      />
    );
  }

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

  const enabled = session.groups?.[group.key] === true;

  return (
    <ToolRow
      label={group.label}
      subtitle={group.description}
      enabled={enabled}
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
