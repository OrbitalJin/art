import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useChatStream } from "@/hooks/use-chat-stream";
import { useSessionStore } from "@/lib/store/use-session-store";
import { useConnectionsStore } from "@/lib/store/use-connections-store";
import type { Session, ToolCallBlock } from "@/lib/store/session/types";
import { DONE_TOOL_NAME } from "@/lib/ai/tools/done";
import { SUPPORTED_TOOLKITS, TOOLKIT_LABELS } from "@/lib/services/composio";
import { toolkitEnabled } from "@/lib/ai/tools/toolkits";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  TOOL_FAMILIES,
} from "@/lib/ai/tools/registry";
import { grantFolder, makeRoot, selectDirectory, type FsRoot } from "@/lib/fs";
import {
  CompactSummary,
  formatToolName,
} from "@/components/chat/messages/tool-call-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Toolkit = (typeof SUPPORTED_TOOLKITS)[number];
type MenuPage = "main" | "files";

const basename = (path: string): string => {
  const parts = path.split(/[\\/]/).filter(Boolean);
  return parts[parts.length - 1] ?? path;
};

const slugsForToolkit = (toolkit: string, slugs: string[]): string[] => {
  const prefix = `${toolkit.toLowerCase()}_`;
  return slugs.filter((slug) => slug.toLowerCase().startsWith(prefix));
};

const useToolkitToolCount = (toolkit: string): number => {
  const slugs = useConnectionsStore((state) => state.slugs);
  return slugsForToolkit(toolkit, slugs).length;
};

const ToolTag: React.FC<{ label: string; value?: string }> = ({
  label,
  value,
}) => {
  const tagClasses = cn(
    "flex shrink-0 items-center gap-1.5 rounded-md px-2 py-0.5",
    "bg-muted/50 text-xs whitespace-nowrap text-foreground/80 ring-1 ring-border/60",
  );

  return (
    <span className={tagClasses}>
      <span className={value ? "text-muted-foreground" : ""}>{label}</span>
      {value ? <span className="font-medium">{value}</span> : null}
    </span>
  );
};

const EnabledTools: React.FC<{ session: Session }> = ({ session }) => {
  const toolkits = useConnectionsStore((state) => state.toolkits);
  const connectedCount = SUPPORTED_TOOLKITS.filter(
    (toolkit) =>
      toolkits[toolkit]?.status === "ACTIVE" &&
      toolkitEnabled(session, toolkit),
  ).length;

  const tags: { label: string; value?: string }[] = [];
  for (const family of TOOL_FAMILIES) {
    if (family.key === "files") {
      const folders = session.folders ?? [];
      if (folders.length) {
        tags.push({
          label: "Files",
          value:
            folders.length === 1
              ? basename(folders[0].path)
              : `${folders.length} folders`,
        });
      }
    } else if (family.key === "connections") {
      continue;
    } else if (toolkitEnabled(session, family.key)) {
      tags.push({ label: family.label });
    }
  }

  if (connectedCount > 0) {
    tags.push({ label: "Connections", value: String(connectedCount) });
  }

  if (tags.length === 0) {
    return (
      <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground/50">
        No tools enabled
      </span>
    );
  }

  return (
    <span className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto scroll-fade-x">
      {tags.map((tag) => (
        <ToolTag key={tag.label} label={tag.label} value={tag.value} />
      ))}
    </span>
  );
};

const ActivityLine: React.FC<{
  toolCalls: ToolCallBlock[];
  running: number;
}> = ({ toolCalls, running }) => {
  const single = toolCalls.length === 1 ? toolCalls[0] : null;

  if (single) {
    const isDone = single.toolName === DONE_TOOL_NAME;
    const title = isDone ? "Wrapping up" : formatToolName(single.toolName);

    return (
      <span className="flex min-w-0 flex-1 items-center gap-2">
        <span className="shrink-0 text-xs text-foreground/80">{title}</span>
        {!isDone && <CompactSummary block={single} />}
      </span>
    );
  }

  const countLabel =
    running > 0
      ? `Running ${running} of ${toolCalls.length} tools…`
      : `Used ${toolCalls.length} tools`;

  return (
    <span className="flex min-w-0 flex-1 items-center">
      <span className="truncate text-xs text-foreground/80">{countLabel}</span>
    </span>
  );
};

const MenuSectionLabel: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <p className="px-2.5 pt-1.5 pb-1 text-xs font-medium text-muted-foreground">
    {children}
  </p>
);

const MainHeader: React.FC<{
  nothingToRevoke: boolean;
  onRevokeAll: () => void;
}> = ({ nothingToRevoke, onRevokeAll }) => (
  <div className="flex items-center justify-between gap-2 border-b border-border/50 py-2 pr-2 pl-3.5">
    <p className="text-[13px] font-medium text-foreground">Configure agent</p>
    <Button
      variant="ghost"
      size="sm"
      className="h-7 px-2 text-xs text-muted-foreground shadow-none hover:text-destructive"
      onClick={onRevokeAll}
      disabled={nothingToRevoke}
    >
      Revoke all
    </Button>
  </div>
);

const SubPageHeader: React.FC<{ title: string; onBack: () => void }> = ({
  title,
  onBack,
}) => (
  <div className="flex items-center gap-1 border-b border-border/50 py-2 pr-3.5 pl-2">
    <button
      type="button"
      onClick={onBack}
      aria-label="Back"
      className="cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
    >
      <ChevronLeft size={16} aria-hidden />
    </button>
    <p className="text-[13px] font-medium text-foreground">{title}</p>
  </div>
);

const selectableRowClasses = (active: boolean): string =>
  cn(
    "flex w-full cursor-pointer items-center gap-3 rounded-lg border px-2.5 py-2 text-left outline-none",
    "transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring/50",
    "disabled:pointer-events-none",
    active
      ? "border-foreground/15 bg-muted/50"
      : "border-transparent hover:bg-muted/40",
  );

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
  toolkit: Toolkit;
  session: Session;
  onToggle: (key: string, value: boolean) => void;
}> = ({ toolkit, session, onToggle }) => {
  const toolkits = useConnectionsStore((state) => state.toolkits);
  const toolCount = useToolkitToolCount(toolkit);

  const connected = toolkits[toolkit]?.status === "ACTIVE";
  const enabled = connected && toolkitEnabled(session, toolkit);

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
      onClick={() => onToggle(toolkit, !enabled)}
      className={rowClasses}
    >
      <RowText
        label={TOOLKIT_LABELS[toolkit]}
        subtitle={subtitle}
        active={enabled}
      />
    </button>
  );
};

const MainPage: React.FC<{
  session: Session;
  onOpenFiles: () => void;
  onToggle: (key: string, value: boolean) => void;
  onRevokeAll: () => void;
}> = ({ session, onOpenFiles, onToggle, onRevokeAll }) => {
  const toolkits = useConnectionsStore((state) => state.toolkits);
  const folderCount = (session.folders ?? []).length;
  const toggleFamilies = TOOL_FAMILIES.filter(
    (family) => family.key !== "files" && family.key !== "connections",
  );
  const nothingToRevoke =
    !toggleFamilies.some((family) => toolkitEnabled(session, family.key)) &&
    !SUPPORTED_TOOLKITS.some(
      (toolkit) =>
        toolkits[toolkit]?.status === "ACTIVE" &&
        toolkitEnabled(session, toolkit),
    );

  return (
    <>
      <MainHeader nothingToRevoke={nothingToRevoke} onRevokeAll={onRevokeAll} />

      {CATEGORY_ORDER.map((category) => {
        const families = TOOL_FAMILIES.filter(
          (family) => family.category === category,
        );
        const hasVisible = families.some(
          (family) => family.key !== "connections",
        );
        if (!hasVisible) return null;

        return (
          <div
            key={category}
            className="flex flex-col gap-0.5 border-b border-border/50 p-1.5"
          >
            <MenuSectionLabel>{CATEGORY_LABELS[category]}</MenuSectionLabel>

            {families.map((family) => {
              if (family.key === "connections") return null;

              if (family.key === "files") {
                return (
                  <FilesLink
                    key={family.key}
                    folderCount={folderCount}
                    onOpen={onOpenFiles}
                  />
                );
              }

              const enabled = toolkitEnabled(session, family.key);

              return (
                <ToolRow
                  key={family.key}
                  label={family.label}
                  subtitle={family.description}
                  enabled={enabled}
                  onToggle={() => onToggle(family.key, !enabled)}
                />
              );
            })}
          </div>
        );
      })}

      <div className="flex flex-col gap-0.5 p-1.5">
        <MenuSectionLabel>Connections</MenuSectionLabel>
        {SUPPORTED_TOOLKITS.map((toolkit) => (
          <ConnectionRow
            key={toolkit}
            toolkit={toolkit}
            session={session}
            onToggle={onToggle}
          />
        ))}
      </div>
    </>
  );
};

const FolderItem: React.FC<{
  folder: FsRoot;
  onRemove: (folderId: string) => void;
}> = ({ folder, onRemove }) => (
  <div className="flex items-center justify-between gap-2 rounded-lg border border-foreground/15 bg-muted/50 px-2.5 py-2">
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="truncate text-[13px] font-medium text-foreground">
        {folder.name}
      </span>
      <span
        title={folder.path}
        className="truncate text-[11px] leading-snug text-muted-foreground"
      >
        {folder.path}
      </span>
    </div>
    <button
      type="button"
      onClick={() => onRemove(folder.id)}
      aria-label={`Remove ${folder.name}`}
      className="shrink-0 cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:text-destructive"
    >
      <X size={14} aria-hidden />
    </button>
  </div>
);

const FilesPage: React.FC<{
  folders: FsRoot[];
  onBack: () => void;
  onAdd: () => void;
  onRemove: (folderId: string) => void;
}> = ({ folders, onBack, onAdd, onRemove }) => (
  <>
    <SubPageHeader title="Files" onBack={onBack} />

    <div className="flex flex-col gap-1 p-1.5">
      {folders.length === 0 ? (
        <p className="px-2.5 py-3 text-xs leading-snug text-muted-foreground">
          No folders connected. Connect a folder to let the agent read and write
          files in it.
        </p>
      ) : (
        folders.map((folder) => (
          <FolderItem key={folder.id} folder={folder} onRemove={onRemove} />
        ))
      )}
    </div>

    <div className="border-t border-border/50 p-1.5">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-full justify-start gap-1.5 text-xs text-muted-foreground shadow-none hover:text-foreground"
        onClick={onAdd}
      >
        <Plus size={13} aria-hidden />
        {folders.length === 0 ? "Connect folder" : "Add folder"}
      </Button>
    </div>
  </>
);

const ConfigureMenu: React.FC<{
  disabled: boolean;
  session: Session;
  onAddFolder: () => void;
  onRemoveFolder: (folderId: string) => void;
  onToggle: (key: string, value: boolean) => void;
  onRevokeAll: () => void;
}> = ({
  disabled,
  session,
  onAddFolder,
  onRemoveFolder,
  onToggle,
  onRevokeAll,
}) => {
  const syncConnections = useConnectionsStore((state) => state.syncConnections);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState<MenuPage>("main");

  useEffect(() => {
    if (open) void syncConnections();
  }, [open, syncConnections]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setPage("main");
  };

  const triggerClasses = cn(
    "flex shrink-0 cursor-pointer items-center rounded-md px-2 py-0.5 h-7",
    "text-xs whitespace-nowrap text-muted-foreground ring-1 ring-border/60 outline-none",
    "transition-colors duration-150 hover:bg-muted/60 hover:text-foreground",
    "focus-visible:ring-2 focus-visible:ring-ring/50",
    "data-[state=open]:bg-muted/60 data-[state=open]:text-foreground",
    "disabled:pointer-events-none disabled:opacity-50",
  );

  const contentClasses = cn(
    "w-80 max-w-[calc(100vw-2rem)] rounded-xl p-0 shadow-lg",
    "max-h-[var(--radix-dropdown-menu-content-available-height)] overflow-y-auto",
    "border-border/60",
  );

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button type="button" className={triggerClasses}>
          Configure
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="top"
        align="end"
        avoidCollisions={false}
        className={contentClasses}
      >
        {page === "main" ? (
          <MainPage
            session={session}
            onOpenFiles={() => setPage("files")}
            onToggle={onToggle}
            onRevokeAll={onRevokeAll}
          />
        ) : (
          <FilesPage
            folders={session.folders ?? []}
            onBack={() => setPage("main")}
            onAdd={onAddFolder}
            onRemove={onRemoveFolder}
          />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface ToolUseProps {
  active: boolean;
}

export const ToolUse: React.FC<ToolUseProps> = ({ active }) => {
  const activeId = useSessionStore((state) => state.activeId);
  const session = useSessionStore((state) =>
    state.sessions.find((s) => s.id === state.activeId),
  );
  const addFolder = useSessionStore((state) => state.addFolder);
  const removeFolder = useSessionStore((state) => state.removeFolder);
  const setToolkit = useSessionStore((state) => state.setToolkit);
  const disableAllToolkits = useSessionStore(
    (state) => state.disableAllToolkits,
  );
  const { isSending, toolCalls } = useChatStream();

  const handleAddFolder = useCallback(async () => {
    if (!activeId || !session) return;

    const path = await selectDirectory();
    if (!path) {
      toast.warning("No folder was selected.");
      return;
    }

    try {
      await grantFolder(path);
    } catch (error) {
      toast.error(`Cannot connect folder: ${String(error)}`);
      return;
    }

    const root = await makeRoot(path, session.folders ?? []);
    addFolder(activeId, root);
    toast.info(`Folder "${root.name}" connected`);
  }, [activeId, session, addFolder]);

  const handleRemoveFolder = useCallback(
    (folderId: string) => {
      if (!activeId) return;
      removeFolder(activeId, folderId);
    },
    [activeId, removeFolder],
  );

  const handleToggle = useCallback(
    (key: string, value: boolean) => {
      if (!activeId) return;
      setToolkit(activeId, key, value);
    },
    [activeId, setToolkit],
  );

  const handleRevokeAll = useCallback(() => {
    if (!activeId) return;
    disableAllToolkits(activeId);
  }, [activeId, disableAllToolkits]);

  if (!session) return null;

  const running = toolCalls.filter(
    (call) => call.state === "executing" && call.toolName !== DONE_TOOL_NAME,
  ).length;

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      {active ? (
        <ActivityLine toolCalls={toolCalls} running={running} />
      ) : (
        <EnabledTools session={session} />
      )}

      <ConfigureMenu
        disabled={isSending}
        session={session}
        onAddFolder={handleAddFolder}
        onRemoveFolder={handleRemoveFolder}
        onToggle={handleToggle}
        onRevokeAll={handleRevokeAll}
      />
    </div>
  );
};
