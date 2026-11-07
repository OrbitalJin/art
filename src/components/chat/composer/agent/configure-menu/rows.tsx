import { Check, ChevronRight } from "lucide-react";
import { useHasKey, useKeysLoading } from "@/lib/store/use-settings-store";
import { useKeyNotice } from "../../use-key-notice";
import type { SessionMeta } from "@/lib/store/session/types";
import { CATEGORY_LABELS, type Category, type ToolGroup } from "./groups";
import { groupActive, groupsInCategory, selectableRowClasses } from "./helpers";
import { cn } from "@/lib/utils";

const RowText: React.FC<{
  label: string;
  subtitle: string;
  active?: boolean;
}> = ({ label, subtitle, active = false }) => {
  const labelClassName = cn(
    "truncate text-[13px] font-medium transition-colors duration-150",
    active ? "text-foreground" : "text-foreground/80",
  );

  return (
    <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
      <span className={labelClassName}>{label}</span>
      <span className="truncate text-[11px] text-muted-foreground">
        {subtitle}
      </span>
    </span>
  );
};

const ToggleMark: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  const markClassName = cn(
    "flex size-4 shrink-0 items-center justify-center rounded-md border",
    "transition-colors duration-150",
    enabled
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border/60 bg-transparent text-transparent",
  );

  return (
    <span aria-hidden className={markClassName}>
      <Check strokeWidth={3} className="size-2.5" />
    </span>
  );
};

const Summary: React.FC<{ active: boolean; children: React.ReactNode }> = ({
  active,
  children,
}) => {
  const summaryClassName = cn(
    "shrink-0 tabular-nums transition-colors duration-150",
    active
      ? "rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary"
      : "text-[11px] text-muted-foreground/60",
  );

  return <span className={summaryClassName}>{children}</span>;
};

export const ToolRow: React.FC<{
  label: string;
  subtitle: string;
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}> = ({ label, subtitle, enabled, onToggle, disabled }) => {
  const rowClassName = cn(
    selectableRowClasses(enabled),
    disabled && "opacity-60",
  );

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      disabled={disabled}
      className={rowClassName}
    >
      <RowText label={label} subtitle={subtitle} active={enabled} />
      <ToggleMark enabled={enabled} />
    </button>
  );
};

const LinkRow: React.FC<{
  label: string;
  subtitle: string;
  active: boolean;
  trailing: React.ReactNode;
  onOpen: () => void;
}> = ({ label, subtitle, active, trailing, onOpen }) => {
  const rowClassName = cn(selectableRowClasses(active), "group/row relative");

  const chevronClassName = cn(
    "shrink-0 text-muted-foreground/60 transition-transform duration-200",
    "group-hover/row:translate-x-0.5 group-focus-visible/row:translate-x-0.5",
  );

  return (
    <button type="button" onClick={onOpen} className={rowClassName}>
      <RowText label={label} subtitle={subtitle} active={active} />
      <Summary active={active}>{trailing}</Summary>
      <ChevronRight
        size={14}
        strokeWidth={1.75}
        aria-hidden
        className={chevronClassName}
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

export const GroupRow: React.FC<{
  group: ToolGroup;
  session: SessionMeta;
  onOpenFiles: () => void;
  onToggle: (key: string, value: boolean) => void;
}> = ({ group, session, onOpenFiles, onToggle }) => {
  const hasKey = useHasKey(group.requiresKey);
  const keysLoading = useKeysLoading();
  const keyNotice = useKeyNotice();

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

  const enabled = hasKey && session.groups?.[group.key] === true;
  const showDescription = hasKey || !group.requiresKey || keysLoading;
  const subtitle = showDescription ? group.description : keyNotice;

  return (
    <ToolRow
      label={group.label}
      subtitle={subtitle}
      enabled={enabled}
      disabled={!hasKey}
      onToggle={() => onToggle(group.key, !enabled)}
    />
  );
};

export const CategoryLink: React.FC<{
  category: Category;
  session: SessionMeta;
  onOpen: () => void;
}> = ({ category, session, onOpen }) => {
  const groups = groupsInCategory(category);
  const activeGroups = groups.filter((group) => groupActive(session, group));

  const active = activeGroups.length > 0;
  const subtitleGroups = active ? activeGroups : groups;
  const subtitle = subtitleGroups.map((group) => group.label).join(", ");
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
