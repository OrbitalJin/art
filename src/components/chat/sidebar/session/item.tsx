import { useState } from "react";
import { GitBranch, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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
import { useSessionStore } from "@/lib/store/use-session-store";
import { useIsStreaming } from "@/lib/store/use-stream-store";
import { useSessionAttention } from "@/hooks/use-session-attention";
import { useCreatePageFromSession } from "@/hooks/use-create-page-from-session";
import { useTradeSession } from "@/hooks/use-trade-session";
import type { Session } from "@/lib/store/session/types";

interface Props {
  item: Session;
  active: boolean;
  onSwitch?: () => void;
}

const stopPropagation = (event: React.SyntheticEvent) => {
  event.stopPropagation();
};

const StatusDot: React.FC<{ streaming: boolean }> = ({ streaming }) => (
  <span className="relative flex size-1.5 shrink-0">
    <span className="relative inline-flex size-1.5 rounded-full bg-amber-500" />
    {streaming && (
      <span
        aria-hidden
        className="absolute inline-flex size-full animate-ping rounded-full bg-amber-500/60 motion-reduce:animate-none"
      />
    )}
    <span className="sr-only">{streaming ? "Working" : "Needs attention"}</span>
  </span>
);

const BranchLink: React.FC<{
  parentTitle?: string;
  onOpen: () => void;
}> = ({ parentTitle, onOpen }) => {
  const label = parentTitle
    ? `Branched from ${parentTitle}`
    : "Original session no longer exists";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          onClick={(event) => {
            event.stopPropagation();
            onOpen();
          }}
          className={cn(
            "shrink-0 cursor-pointer rounded-sm text-muted-foreground/50 outline-none",
            "transition-colors duration-150 hover:text-foreground",
            "focus-visible:ring-2 focus-visible:ring-ring/50",
          )}
        >
          <GitBranch className="size-3" />
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

  return (
    <input
      type="text"
      value={value}
      autoFocus
      aria-label="Session title"
      onChange={(event) => onChange(event.target.value)}
      onBlur={onCancel}
      onKeyDown={handleKeyDown}
      className="-mx-1.5 h-6 min-w-0 flex-1 rounded bg-background/60 px-1.5 text-[13px] text-foreground ring-1 ring-ring/40 outline-none"
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
          “{title}” will be permanently deleted. This can't be undone.
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

const SessionMenu: React.FC<{ item: Session; onRename: () => void }> = ({
  item,
  onRename,
}) => {
  const togglePinned = useSessionStore((state) => state.togglePinned);
  const toggleArchived = useSessionStore((state) => state.toggleArchived);
  const deleteFn = useSessionStore((state) => state.deleteFn);
  const branch = useSessionStore((state) => state.branch);

  const { creating, create } = useCreatePageFromSession();
  const { exportSession } = useTradeSession();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleRegenerateTitle = () => {
    void generateSessionTitle(item.id);
  };

  const handleGenerateNotes = async (event: Event) => {
    event.preventDefault();
    await create(item.id);
    setOpen(false);
  };

  const handleBranch = () => {
    const success = branch(item.id);
    if (success) {
      toast.success("Session branched successfully");
    } else {
      toast.error("Failed to branch session");
    }
  };

  const handleDeleteSelect = (event: Event) => {
    event.preventDefault();
    setOpen(false);
    requestAnimationFrame(() => setConfirmOpen(true));
  };

  const handleDelete = () => {
    setConfirmOpen(false);
    if (item.id === useSessionStore.getState().activeId) {
      navigate(`/session/${item.type ?? "chat"}`, { replace: true });
    }
    deleteFn(item.id);
    toast.success("Session deleted successfully.");
  };

  const triggerClasses = cn(
    "size-6 text-muted-foreground/70 opacity-0 transition-opacity duration-150",
    "group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100",
    "hover:bg-transparent hover:text-foreground",
  );

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className={triggerClasses}
          >
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Session options</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-44">
          {!item.archived && (
            <>
              <DropdownMenuGroup>
                <DropdownMenuItem onSelect={() => togglePinned(item.id)}>
                  {item.pinned ? "Unpin" : "Pin"}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onRename}>Rename</DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem onSelect={handleRegenerateTitle}>
                  Regenerate title
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={creating}
                  onSelect={handleGenerateNotes}
                >
                  {creating ? "Creating notes…" : "Generate notes"}
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={handleBranch}>Branch</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => exportSession(item.id)}>
              Export
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => toggleArchived(item.id)}>
              {item.archived ? "Unarchive" : "Archive"}
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
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

export const SessionListItem: React.FC<Props> = ({
  item,
  active,
  onSwitch,
}) => {
  const { title, id, branchOf } = item;

  const isTitleGenerating = useSessionStore((state) =>
    state.titleGeneratingIds.includes(id),
  );
  const updateTitle = useSessionStore((state) => state.updateTitle);
  const getFn = useSessionStore((state) => state.getFn);
  const navigate = useNavigate();

  const isStreaming = useIsStreaming(id);
  const needsAttention = useSessionAttention(id);

  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(title);

  const parentSession = branchOf ? getFn(branchOf) : undefined;
  const canOpen = !editing && !isTitleGenerating;
  const showStatus = isStreaming || needsAttention;
  const showMenu = !editing && !isTitleGenerating && !isStreaming;

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

  const rowClasses = cn(
    "group relative flex w-full max-w-full min-w-0 items-center gap-2 overflow-hidden",
    "rounded-md px-2.5 py-1.5 text-[13px] select-none outline-none",
    "transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring/50",
    canOpen ? "cursor-pointer" : "cursor-default",
    active
      ? "bg-accent/40 text-foreground"
      : "text-foreground/70 hover:bg-accent/20 hover:text-foreground",
  );

  const titleClasses = cn(
    "block min-w-0 flex-1 truncate",
    isStreaming && "shimmer",
    isTitleGenerating && "shimmer text-muted-foreground",
  );

  const titleLabel = isTitleGenerating ? "Generating title…" : title;

  return (
    <div
      tabIndex={0}
      aria-current={active ? "page" : undefined}
      onClick={handleOpen}
      onKeyDown={handleRowKeyDown}
      className={rowClasses}
    >
      {showStatus && <StatusDot streaming={isStreaming} />}

      {branchOf && (
        <BranchLink
          parentTitle={parentSession?.title}
          onOpen={handleOpenParent}
        />
      )}

      {editing ? (
        <TitleInput
          value={text}
          onChange={setText}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      ) : (
        <span title={titleLabel} className={titleClasses}>
          {titleLabel}
        </span>
      )}

      <div
        className="flex size-6 shrink-0 items-center justify-center"
        onClick={stopPropagation}
        onKeyDown={stopPropagation}
      >
        {showMenu && <SessionMenu item={item} onRename={handleStartEditing} />}
      </div>
    </div>
  );
};
