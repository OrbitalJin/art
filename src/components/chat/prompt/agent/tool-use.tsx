// tool-use.tsx
import { useCallback, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useChatStream } from "@/contexts/chat-context";
import { useSessionStore } from "@/lib/store/use-session-store";
import type {
  Session,
  SessionCapabilities,
  ToolCallBlock,
} from "@/lib/store/session/types";
import { DONE_TOOL_NAME } from "@/lib/ai/tools/done";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  TOOL_FAMILIES,
} from "@/lib/ai/tools/registry";
import { makeRoot, selectDirectory, type FsRoot } from "@/lib/fs";
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

type MenuPage = "main" | "files";

const basename = (path: string): string => {
  const parts = path.split(/[\\/]/).filter(Boolean);
  return parts[parts.length - 1] ?? path;
};

const ToolTag: React.FC<{ label: string; value?: string }> = ({
  label,
  value,
}) => (
  <span
    className={cn(
      "flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5",
      "bg-foreground/5 text-xs whitespace-nowrap text-foreground/80 ring-1 ring-border/50",
    )}
  >
    <span className={value ? "text-muted-foreground/70" : ""}>{label}</span>
    {value ? <span className="font-medium">{value}</span> : null}
  </span>
);

const EnabledTools: React.FC<{ session: Session }> = ({ session }) => {
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
    } else if (session.capabilities[family.key]) {
      tags.push({ label: family.label });
    }
  }

  if (tags.length === 0) {
    return (
      <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground/40">
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
  <p className="px-2 pb-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground/60 uppercase">
    {children}
  </p>
);

const MainHeader: React.FC<{
  nothingToRevoke: boolean;
  onRevokeAll: () => void;
}> = ({ nothingToRevoke, onRevokeAll }) => (
  <div className="flex items-center justify-between gap-2 border-b bg-muted/30 py-1.5 pr-1.5 pl-3">
    <p className="text-sm font-medium">Configure agent</p>
    <Button
      variant="ghost"
      size="sm"
      className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
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
  <div className="flex items-center gap-1 border-b bg-muted/30 py-1.5 pr-3 pl-1.5">
    <button
      type="button"
      onClick={onBack}
      aria-label="Back"
      className="cursor-pointer rounded p-1 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
    >
      <ChevronLeft size={16} aria-hidden />
    </button>
    <p className="text-sm font-medium">{title}</p>
  </div>
);

const ToolRow: React.FC<{
  label: string;
  subtitle: string;
  enabled: boolean;
  onToggle: () => void;
}> = ({ label, subtitle, enabled, onToggle }) => {
  const rowClasses = cn(
    "flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-left outline-none",
    "transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring/50",
    enabled ? "bg-primary/5 ring-1 ring-primary/20" : "hover:bg-accent/20",
  );

  const labelClasses = cn(
    "shrink-0 text-sm font-medium",
    enabled ? "text-primary" : "text-foreground",
  );

  const stateClasses = cn(
    "shrink-0 text-[10px] font-medium",
    enabled ? "text-primary" : "text-muted-foreground/50",
  );

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={enabled}
      title={subtitle}
      className={rowClasses}
    >
      <span className={labelClasses}>{label}</span>
      <span className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground/70">
        {subtitle}
      </span>
      <span className={stateClasses}>{enabled ? "On" : "Off"}</span>
    </button>
  );
};

const FilesLink: React.FC<{
  folderCount: number;
  onOpen: () => void;
}> = ({ folderCount, onOpen }) => {
  const active = folderCount > 0;

  const rowClasses = cn(
    "flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-left outline-none",
    "transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring/50",
    active ? "bg-primary/5 ring-1 ring-primary/20" : "hover:bg-accent/20",
  );

  const labelClasses = cn(
    "shrink-0 text-sm font-medium",
    active ? "text-primary" : "text-foreground",
  );

  const summary = active
    ? `${folderCount} ${folderCount === 1 ? "folder" : "folders"}`
    : "Connect";

  return (
    <button type="button" onClick={onOpen} className={rowClasses}>
      <span className={labelClasses}>Files</span>
      <span className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground/70">
        Read &amp; write local folders
      </span>
      <span className="shrink-0 text-[10px] font-medium text-muted-foreground/50">
        {summary}
      </span>
      <ChevronRight
        size={14}
        aria-hidden
        className="shrink-0 text-muted-foreground/50"
      />
    </button>
  );
};

const FolderItem: React.FC<{
  folder: FsRoot;
  onRemove: (folderId: string) => void;
}> = ({ folder, onRemove }) => (
  <div className="flex items-center justify-between gap-2 rounded-md bg-primary/5 px-2.5 py-1.5 ring-1 ring-primary/20">
    <div className="flex min-w-0 flex-col">
      <span className="truncate text-sm font-medium text-primary">
        {folder.name}
      </span>
      <span
        title={folder.path}
        className="truncate text-[11px] leading-snug text-muted-foreground/70"
      >
        {folder.path}
      </span>
    </div>
    <button
      type="button"
      onClick={() => onRemove(folder.id)}
      aria-label={`Remove ${folder.name}`}
      className="shrink-0 cursor-pointer rounded p-1 text-muted-foreground transition-colors hover:text-destructive"
    >
      <X size={14} aria-hidden />
    </button>
  </div>
);

const MainPage: React.FC<{
  session: Session;
  onOpenFiles: () => void;
  onToggle: (key: keyof SessionCapabilities, value: boolean) => void;
  onRevokeAll: () => void;
}> = ({ session, onOpenFiles, onToggle, onRevokeAll }) => {
  const { capabilities } = session;
  const folderCount = (session.folders ?? []).length;
  const nothingToRevoke =
    !capabilities.journal && !capabilities.tasks && !capabilities.askUser;

  return (
    <>
      <MainHeader nothingToRevoke={nothingToRevoke} onRevokeAll={onRevokeAll} />

      {CATEGORY_ORDER.map((category, index) => {
        const families = TOOL_FAMILIES.filter(
          (family) => family.category === category,
        );
        if (families.length === 0) return null;

        return (
          <div
            key={category}
            className={cn(
              "flex flex-col gap-0.5 p-1.5",
              index > 0 && "border-t",
            )}
          >
            <MenuSectionLabel>{CATEGORY_LABELS[category]}</MenuSectionLabel>

            {families.map((family) => {
              if (family.key === "files") {
                return (
                  <FilesLink
                    key={family.key}
                    folderCount={folderCount}
                    onOpen={onOpenFiles}
                  />
                );
              }

              const capKey = family.key;
              const enabled = capabilities[capKey];

              return (
                <ToolRow
                  key={family.key}
                  label={family.label}
                  subtitle={family.description}
                  enabled={enabled}
                  onToggle={() => onToggle(capKey, !enabled)}
                />
              );
            })}
          </div>
        );
      })}
    </>
  );
};

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
        <p className="px-2.5 py-3 text-[11px] leading-snug text-muted-foreground/70">
          No folders connected. Connect a folder to let the agent read and write
          files in it.
        </p>
      ) : (
        folders.map((folder) => (
          <FolderItem key={folder.id} folder={folder} onRemove={onRemove} />
        ))
      )}
    </div>

    <div className="border-t p-1.5">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-full justify-start gap-1.5 text-xs text-muted-foreground hover:text-foreground"
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
  onToggle: (key: keyof SessionCapabilities, value: boolean) => void;
  onRevokeAll: () => void;
}> = ({
  disabled,
  session,
  onAddFolder,
  onRemoveFolder,
  onToggle,
  onRevokeAll,
}) => {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState<MenuPage>("main");

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setPage("main");
  };

  const triggerClasses = cn(
    "flex shrink-0 cursor-pointer items-center rounded-full px-2.5 py-0.5",
    "text-xs whitespace-nowrap text-muted-foreground/70 ring-1 ring-border/50 outline-none",
    "transition-colors duration-150 hover:bg-foreground/5 hover:text-foreground",
    "focus-visible:ring-2 focus-visible:ring-ring/50",
    "data-[state=open]:bg-foreground/10 data-[state=open]:text-foreground",
    "disabled:pointer-events-none disabled:opacity-50",
  );

  const contentClasses = cn(
    "w-80 max-w-[calc(100vw-2rem)] p-0 shadow-xl",
    "max-h-[var(--radix-dropdown-menu-content-available-height)] overflow-y-auto",
    "border-muted-foreground/20",
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
  const setCapability = useSessionStore((state) => state.setCapability);
  const disableAllCapabilities = useSessionStore(
    (state) => state.disableAllCapabilities,
  );
  const { isSending, toolCalls } = useChatStream();

  const handleAddFolder = useCallback(async () => {
    if (!activeId || !session) return;

    const path = await selectDirectory();
    if (!path) {
      toast.warning("No folder was selected.");
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
    (key: keyof SessionCapabilities, value: boolean) => {
      if (!activeId) return;
      setCapability(activeId, key, value);
    },
    [activeId, setCapability],
  );

  const handleRevokeAll = useCallback(() => {
    if (!activeId) return;
    disableAllCapabilities(activeId);
  }, [activeId, disableAllCapabilities]);

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
