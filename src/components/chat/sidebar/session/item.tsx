import { useState } from "react";
import { GitBranch, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn, formatDateAsAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { generateSessionTitle } from "@/lib/ai/generate-session-title";
import { useSessionIndex } from "@/lib/store/session/index-store";
import { branchSession, deleteSession } from "@/lib/store/session/commands";
import { useIsStreaming } from "@/lib/store/use-stream-store";
import { useSessionAttention } from "@/hooks/use-session-attention";
import type { SessionMeta } from "@/lib/store/session/types";
import { Spinner } from "@/components/ui/spinner";

interface Props {
  item: SessionMeta;
  active: boolean;
  onSwitch?: () => void;
}

const stopPropagation = (event: React.SyntheticEvent) => {
  event.stopPropagation();
};

const AttentionDot: React.FC = () => {
  const haloClassName = cn(
    "absolute inline-flex size-full animate-ping rounded-full bg-amber-500/60",
    "motion-reduce:animate-none",
  );

  return (
    <span
      role="status"
      aria-label="Needs your attention"
      className="relative flex size-1.5 shrink-0"
    >
      <span className="relative inline-flex size-1.5 rounded-full bg-amber-500" />
      <span className={haloClassName} />
    </span>
  );
};

const StatusMark: React.FC<{ streaming: boolean; attention: boolean }> = ({
  streaming,
  attention,
}) => {
  if (streaming) return <Spinner />;
  if (attention) return <AttentionDot />;
  return null;
};

const BranchLink: React.FC<{
  parentTitle?: string;
  onOpen: () => void;
}> = ({ parentTitle, onOpen }) => {
  const label = parentTitle
    ? `Branched from ${parentTitle}`
    : "Original session no longer exists";

  const buttonClassName = cn(
    "shrink-0 cursor-pointer rounded-sm text-muted-foreground/50 outline-none",
    "transition-colors duration-150 hover:text-foreground",
    "focus-visible:ring-2 focus-visible:ring-ring/50",
  );

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onOpen();
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          onClick={handleClick}
          className={buttonClassName}
        >
          <GitBranch strokeWidth={1.75} className="size-3" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
};

const TitleInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}> = ({ value, onChange, onSubmit, onCancel }) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter") onSubmit();
    if (event.key === "Escape") onCancel();
  };

  const inputClassName = cn(
    "-mx-1.5 h-6 min-w-0 flex-1 rounded-md bg-background/60 px-1.5",
    "text-[13px] text-foreground ring-1 ring-ring/40 outline-none",
  );

  return (
    <input
      type="text"
      value={value}
      autoFocus
      aria-label="Session title"
      onChange={(event) => onChange(event.target.value)}
      onBlur={onCancel}
      onKeyDown={handleKeyDown}
      className={inputClassName}
    />
  );
};

const DeleteDialog: React.FC<{
  open: boolean;
  title: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}> = ({ open, title, onOpenChange, onConfirm }) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent size="sm">
      <AlertDialogHeader>
        <AlertDialogTitle>Delete this session?</AlertDialogTitle>
        <AlertDialogDescription className="break-words">
          <span className="font-medium text-foreground">“{title}”</span> will be
          permanently deleted. This can't be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction variant="destructive" onClick={onConfirm}>
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

const MenuTrigger: React.FC = () => {
  const triggerClassName = cn(
    "size-6 rounded-md text-muted-foreground/70 opacity-0 transition-opacity duration-150",
    "group-hover:opacity-100 group-focus-within:opacity-100",
    "focus-visible:opacity-100 data-[state=open]:opacity-100",
    "hover:bg-accent/60 hover:text-foreground",
  );

  return (
    <DropdownMenuTrigger asChild>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className={triggerClassName}
      >
        <MoreHorizontal strokeWidth={1.75} className="size-4" />
        <span className="sr-only">Session options</span>
      </Button>
    </DropdownMenuTrigger>
  );
};

const SessionMenu: React.FC<{
  item: SessionMeta;
  onRename: () => void;
  onOpenChange?: (open: boolean) => void;
}> = ({ item, onRename, onOpenChange }) => {
  const togglePinned = useSessionIndex((state) => state.togglePinned);
  const toggleArchived = useSessionIndex((state) => state.toggleArchived);

  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };

  const handleRegenerateTitle = () => {
    void generateSessionTitle(item.id);
  };

  const handleBranch = async () => {
    const success = await branchSession(item.id);
    if (success) {
      toast.success("Session branched successfully");
    } else {
      toast.error("Failed to branch session");
    }
  };

  const handleDeleteSelect = (event: Event) => {
    event.preventDefault();
    handleOpenChange(false);
    requestAnimationFrame(() => setConfirmOpen(true));
  };

  const handleDelete = () => {
    setConfirmOpen(false);
    if (item.id === useSessionIndex.getState().activeId) {
      navigate(`/session/${item.type ?? "chat"}`, { replace: true });
    }
    deleteSession(item.id);
    toast.success("Session deleted successfully.");
  };

  const contentClassName = cn(
    "w-44 rounded-xl border-border/40 bg-popover/80 p-1",
    "shadow-lg shadow-black/10 backdrop-blur-2xl",
  );

  const itemClassName = "rounded-lg";

  const deleteClassName = cn(
    itemClassName,
    "text-destructive focus:bg-destructive/10 focus:text-destructive",
  );

  return (
    <>
      <DropdownMenu open={open} onOpenChange={handleOpenChange}>
        <MenuTrigger />

        <DropdownMenuContent align="end" className={contentClassName}>
          {!item.archived && (
            <>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className={itemClassName}
                  onSelect={() => togglePinned(item.id)}
                >
                  {item.pinned ? "Unpin" : "Pin"}
                </DropdownMenuItem>
                <DropdownMenuItem className={itemClassName} onSelect={onRename}>
                  Rename
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem
                  className={itemClassName}
                  onSelect={handleRegenerateTitle}
                >
                  Regenerate title
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuGroup>
            <DropdownMenuItem className={itemClassName} onSelect={handleBranch}>
              Branch
            </DropdownMenuItem>
            <DropdownMenuItem
              className={itemClassName}
              onSelect={() => toggleArchived(item.id)}
            >
              {item.archived ? "Unarchive" : "Archive"}
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className={deleteClassName}
            onSelect={handleDeleteSelect}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteDialog
        open={confirmOpen}
        title={item.title}
        onOpenChange={setConfirmOpen}
        onConfirm={handleDelete}
      />
    </>
  );
};

// pointer-events-none: the label fades out on hover but would otherwise keep
// intercepting clicks meant for the menu button underneath it.
const RowTime: React.FC<{
  label: string;
  swapWithMenu: boolean;
  hidden: boolean;
}> = ({ label, swapWithMenu, hidden }) => {
  const timeClassName = cn(
    "pointer-events-none col-start-1 row-start-1",
    "text-[11px] tabular-nums text-muted-foreground/70",
    "transition-opacity duration-150",
    swapWithMenu && "group-hover:opacity-0 group-focus-within:opacity-0",
    hidden && "opacity-0",
  );

  return <span className={timeClassName}>{label}</span>;
};

export const SessionListItem: React.FC<Props> = ({
  item,
  active,
  onSwitch,
}) => {
  const { title, id, branchOf } = item;

  const isTitleGenerating = useSessionIndex((state) =>
    state.titleGeneratingIds.includes(id),
  );
  const updateTitle = useSessionIndex((state) => state.updateTitle);
  const getMeta = useSessionIndex((state) => state.getMeta);
  const navigate = useNavigate();

  const isStreaming = useIsStreaming(id);
  const needsAttention = useSessionAttention(id);

  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(title);
  const [menuOpen, setMenuOpen] = useState(false);

  const parentSession = branchOf ? getMeta(branchOf) : undefined;
  const canOpen = !editing && !isTitleGenerating;
  const showMenu = !editing && !isTitleGenerating && !isStreaming;
  const hideTime = showMenu && menuOpen;
  const timeLabel = formatDateAsAgo(item.updatedAt);

  const handleStartEditing = () => {
    setText(title);
    setEditing(true);
  };

  const handleCancel = () => {
    setText(title);
    setEditing(false);
  };

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (trimmed && trimmed !== title) {
      updateTitle(id, trimmed);
    }
    setEditing(false);
  };

  const handleOpen = () => {
    if (!canOpen) return;
    navigate(`/session/${item.type ?? "chat"}/${id}`);
    onSwitch?.();
  };

  const handleOpenParent = () => {
    if (!parentSession) return;
    navigate(`/session/${parentSession.type ?? "chat"}/${parentSession.id}`);
  };

  const handleRowKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpen();
    }
  };

  const rowClassName = cn(
    "group relative flex w-full max-w-full min-w-0 items-center gap-2 overflow-hidden",
    "rounded-lg px-2.5 py-1.5 text-[13px] select-none outline-none",
    "transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring/50",
    canOpen ? "cursor-pointer" : "cursor-default",
    active
      ? "bg-accent/50 text-foreground"
      : "text-foreground/70 hover:bg-accent/30 hover:text-foreground",
  );

  const titleClassName = cn(
    "block min-w-0 flex-1 truncate",
    isStreaming && "shimmer",
    isTitleGenerating && "shimmer text-muted-foreground",
  );

  const trailingClassName = cn(
    "relative grid shrink-0 items-center justify-items-end",
  );

  const titleLabel = isTitleGenerating ? "Generating title…" : title;

  return (
    <div
      tabIndex={0}
      aria-current={active ? "page" : undefined}
      onClick={handleOpen}
      onKeyDown={handleRowKeyDown}
      className={rowClassName}
    >
      {branchOf && (
        <BranchLink
          parentTitle={parentSession?.title}
          onOpen={handleOpenParent}
        />
      )}

      <StatusMark streaming={isStreaming} attention={needsAttention} />

      {editing ? (
        <TitleInput
          value={text}
          onChange={setText}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      ) : (
        <span title={titleLabel} className={titleClassName}>
          {titleLabel}
        </span>
      )}

      <div
        className={trailingClassName}
        onClick={stopPropagation}
        onKeyDown={stopPropagation}
      >
        <RowTime label={timeLabel} swapWithMenu={showMenu} hidden={hideTime} />

        {showMenu && (
          <div className="relative col-start-1 row-start-1">
            <SessionMenu
              item={item}
              onRename={handleStartEditing}
              onOpenChange={setMenuOpen}
            />
          </div>
        )}
      </div>
    </div>
  );
};
