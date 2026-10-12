import { ChevronRight } from "lucide-react";
import { useConnectionsStore } from "@/lib/store/use-connections-store";
import type { Session } from "@/lib/store/session/types";
import { toolkitEnabled } from "@/lib/ai/tools/toolkits";
import {
  CATEGORY_LABELS,
  type ToolCategory,
  type ToolFamily,
} from "@/lib/ai/tools/registry";
import { cn } from "@/lib/utils";
import {
  familiesInCategory,
  familyActive,
  isConnected,
  selectableRowClasses,
  toolkitToolCount,
} from "./helpers";

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

const ToolRow: React.FC<{
  label: string;
  subtitle: string;
  enabled: boolean;
  onToggle: () => void;
}> = ({ label, subtitle, enabled, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-pressed={enabled}
    title={subtitle}
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
  onOpen: () => void;
}> = ({ folderCount, onOpen }) => {
  const active = folderCount > 0;

  const summary = active
    ? `${folderCount} ${folderCount === 1 ? "folder" : "folders"}`
    : "Connect";

  return (
    <LinkRow
      label="Files"
      subtitle="Read & write local folders"
      active={active}
      trailing={summary}
      onOpen={onOpen}
    />
  );
};

const ConnectionRow: React.FC<{
  family: ToolFamily;
  session: Session;
  onToggle: (key: string, value: boolean) => void;
}> = ({ family, session, onToggle }) => {
  const toolkits = useConnectionsStore((state) => state.toolkits);
  const toolCount = toolkitToolCount(family.key);

  const connected = isConnected(toolkits, family.key);
  const enabled = connected && toolkitEnabled(session, family.key);

  const subtitle = connected
    ? `Read-only · ${toolCount} tools`
    : "Not connected — configure in Settings";

  const rowClasses = cn(
    selectableRowClasses(enabled),
    !connected && "opacity-60",
  );

  return (
    <button
      type="button"
      disabled={!connected}
      aria-pressed={enabled}
      onClick={() => onToggle(family.key, !enabled)}
      className={rowClasses}
    >
      <RowText label={family.label} subtitle={subtitle} active={enabled} />
    </button>
  );
};

export const FamilyRow: React.FC<{
  family: ToolFamily;
  session: Session;
  onOpenFiles: () => void;
  onToggle: (key: string, value: boolean) => void;
}> = ({ family, session, onOpenFiles, onToggle }) => {
  if (family.source === "folders") {
    const folderCount = (session.folders ?? []).length;
    return <FilesLink folderCount={folderCount} onOpen={onOpenFiles} />;
  }

  if (family.source === "composio") {
    return (
      <ConnectionRow family={family} session={session} onToggle={onToggle} />
    );
  }

  const enabled = toolkitEnabled(session, family.key);

  return (
    <ToolRow
      label={family.label}
      subtitle={family.description}
      enabled={enabled}
      onToggle={() => onToggle(family.key, !enabled)}
    />
  );
};

export const CategoryLink: React.FC<{
  category: ToolCategory;
  session: Session;
  onOpen: () => void;
}> = ({ category, session, onOpen }) => {
  const toolkits = useConnectionsStore((state) => state.toolkits);

  const families = familiesInCategory(category);
  const activeFamilies = families.filter((family) =>
    familyActive(session, family, toolkits),
  );

  const active = activeFamilies.length > 0;
  const subtitle = active
    ? activeFamilies.map((family) => family.label).join(", ")
    : families.map((family) => family.label).join(", ");
  const summary = active
    ? `${activeFamilies.length} of ${families.length}`
    : `${families.length}`;

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
