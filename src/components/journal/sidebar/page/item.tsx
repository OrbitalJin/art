import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn, formatDateAsAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
import { Spinner } from "@/components/ui/spinner";
import { useJournalIndex } from "@/lib/store/journal/index-store";
import { deletePage } from "@/lib/store/journal/commands";
import { WORKSPACES } from "@/lib/store/journal/types";
import { useGeneratePageTitle } from "@/hooks/use-generate-page-title";
import { useTradeJournal } from "@/hooks/use-trade-journal";

interface Props {
  id: string;
  title: string;
  pinned?: boolean;
  active: boolean;
  updatedAt: number;
  tags: string[];
  wordCount: number;
}

const MAX_VISIBLE_TAGS = 3;

const formatWords = (count: number) =>
  `${count.toLocaleString()} ${count === 1 ? "word" : "words"}`;

const stopPropagation = (event: React.SyntheticEvent) => {
  event.stopPropagation();
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
      aria-label="Page title"
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
        <AlertDialogTitle>Delete this page?</AlertDialogTitle>
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
        onClick={stopPropagation}
      >
        <MoreHorizontal strokeWidth={1.75} className="size-4" />
        <span className="sr-only">Page options</span>
      </Button>
    </DropdownMenuTrigger>
  );
};

const PageMenu: React.FC<{
  id: string;
  title: string;
  pinned: boolean;
  onRename: () => void;
  onGenerate: () => void;
  onOpenChange?: (open: boolean) => void;
}> = ({ id, title, pinned, onRename, onGenerate, onOpenChange }) => {
  const togglePinned = useJournalIndex((state) => state.togglePinned);
  const toggleArchived = useJournalIndex((state) => state.toggleArchived);
  const changeWorkspace = useJournalIndex((state) => state.changeWorkspace);
  const page = useJournalIndex((state) => state.getPage(id));
  const { exportPage } = useTradeJournal();

  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };

  const handleDeleteSelect = (event: Event) => {
    event.preventDefault();
    handleOpenChange(false);
    requestAnimationFrame(() => setConfirmOpen(true));
  };

  const handleDelete = () => {
    setConfirmOpen(false);
    if (id === useJournalIndex.getState().activeId) {
      navigate("/journal", { replace: true });
    }
    deletePage(id);
    toast.success("Page deleted successfully.");
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
          {!page?.archived && (
            <>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className={itemClassName}
                  onSelect={() => togglePinned(id)}
                >
                  {pinned ? "Unpin" : "Pin"}
                </DropdownMenuItem>
                <DropdownMenuItem className={itemClassName} onSelect={onRename}>
                  Rename
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem
                  className={itemClassName}
                  onSelect={onGenerate}
                >
                  Generate Title
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className={itemClassName}>
                    Move to
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className={contentClassName}>
                      {WORKSPACES.map(
                        (workspace) =>
                          workspace !== page?.workspace && (
                            <DropdownMenuItem
                              key={workspace}
                              className={itemClassName}
                              onSelect={() => changeWorkspace(id, workspace)}
                            >
                              {workspace.charAt(0).toUpperCase() +
                                workspace.slice(1)}
                            </DropdownMenuItem>
                          ),
                      )}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuGroup>
            <DropdownMenuItem
              className={itemClassName}
              onSelect={() => exportPage(id)}
            >
              Export
            </DropdownMenuItem>
            <DropdownMenuItem
              className={itemClassName}
              onSelect={() => toggleArchived(id)}
            >
              {page?.archived ? "Unarchive" : "Archive"}
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
        title={title}
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

const MetaLine: React.FC<{ wordCount: number }> = ({ wordCount }) => {
  const isEmpty = wordCount === 0;
  const label = isEmpty ? "Empty" : formatWords(wordCount);

  const metaClassName = cn(
    "text-[11px] tabular-nums",
    isEmpty ? "italic text-muted-foreground/40" : "text-muted-foreground/60",
  );

  return <p className={metaClassName}>{label}</p>;
};

const TagChips: React.FC<{ tags: string[]; hiddenCount: number }> = ({
  tags,
  hiddenCount,
}) => {
  const chipClassName = cn(
    "max-w-full truncate rounded-md bg-muted/50 px-1.5 py-0.5",
    "text-[10px] text-muted-foreground",
  );

  const overflowClassName = cn(
    "rounded-md px-1 py-0.5 text-[10px] tabular-nums text-muted-foreground/60",
  );

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1">
      {tags.map((tag) => (
        <span key={tag} className={chipClassName}>
          @{tag}
        </span>
      ))}
      {hiddenCount > 0 && (
        <span className={overflowClassName}>+{hiddenCount}</span>
      )}
    </div>
  );
};

export const PageListItem: React.FC<Props> = ({
  id,
  title,
  pinned,
  active,
  updatedAt,
  tags,
  wordCount,
}) => {
  const updateTitle = useJournalIndex((state) => state.updateTitle);
  const { generating, generateTitle } = useGeneratePageTitle();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(title);
  const [menuOpen, setMenuOpen] = useState(false);

  const canOpen = !editing && !generating;
  const showMenu = canOpen;
  const hideTime = showMenu && menuOpen;
  const timeLabel = formatDateAsAgo(updatedAt);

  const visibleTags = tags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenTagCount = Math.max(0, tags.length - MAX_VISIBLE_TAGS);
  const hasTags = tags.length > 0;

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
    navigate(`/journal/${id}`);
  };

  const handleGenerate = () => {
    void generateTitle(id);
  };

  const handleRowKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpen();
    }
  };

  const rowClassName = cn(
    "group relative flex w-full max-w-full min-w-0 flex-col gap-1.5 overflow-hidden",
    "rounded-lg px-3 py-2.5 text-[13px] select-none outline-none",
    "transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring/50",
    canOpen ? "cursor-pointer" : "cursor-default",
    active
      ? "bg-accent/50 text-foreground"
      : "text-foreground/70 hover:bg-accent/30 hover:text-foreground",
  );

  const titleClassName = cn(
    "block min-w-0 flex-1 truncate font-medium",
    active ? "text-foreground" : "text-foreground/85",
    generating && "shimmer font-normal text-muted-foreground",
  );

  const titleLabel = generating ? "Generating title…" : title;

  return (
    <div
      tabIndex={0}
      aria-current={active ? "page" : undefined}
      onClick={handleOpen}
      onKeyDown={handleRowKeyDown}
      className={rowClassName}
    >
      <div className="flex w-full min-w-0 items-center gap-2">
        {generating && <Spinner />}

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
          className="relative grid shrink-0 items-center justify-items-end"
          onClick={stopPropagation}
          onKeyDown={stopPropagation}
        >
          <RowTime
            label={timeLabel}
            swapWithMenu={showMenu}
            hidden={hideTime}
          />

          {showMenu && (
            <div className="relative col-start-1 row-start-1">
              <PageMenu
                id={id}
                title={title}
                pinned={!!pinned}
                onRename={handleStartEditing}
                onGenerate={handleGenerate}
                onOpenChange={setMenuOpen}
              />
            </div>
          )}
        </div>
      </div>

      <MetaLine wordCount={wordCount} />

      {hasTags && <TagChips tags={visibleTags} hiddenCount={hiddenTagCount} />}
    </div>
  );
};
