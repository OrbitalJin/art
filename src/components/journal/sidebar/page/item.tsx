import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  ArrowRightLeft,
  MoreVertical,
  TextCursor,
  Trash2,
  Loader2,
  PinOff,
  Pin,
  Archive,
  ArchiveRestore,
  Wand2,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { useJournalStore } from "@/lib/store/use-journal-store";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { TagList } from "@/components/journal/sidebar/page/tag/list";
import { WORKSPACES } from "@/lib/store/journal/types";
import { ShimmerText } from "@/components/ui/shimmer-text";
import { useGeneratePageTitle } from "@/hooks/use-generate-page-title";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  title: string;
  pinned?: boolean;
  active: boolean;
  createdAt: number;
  tags: string[];
  onSwitch?: () => void;
}

export const PageListItem: React.FC<Props> = ({
  id,
  title,
  active,
  pinned,
  createdAt,
  tags,
}) => {
  const updateTitle = useJournalStore((state) => state.updateTitle);
  const setActive = useJournalStore((state) => state.setActive);
  const { generating, generateTitle } = useGeneratePageTitle();

  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(title);

  const cancel = () => {
    setText(title);
    setEditing(false);
  };

  const handleSubmit = () => {
    if (!text.trim()) {
      setText(title);
      setEditing(false);
      return;
    }
    updateTitle(id, text.trim());
    setEditing(false);
  };

  return (
    <div
      className={cn(
        "flex flex-row p-2 group items-center justify-between opacity-80",
        "transition-colors hover:bg-accent/30 rounded-md",
        editing && "text-accent-foreground",
        active &&
          "bg-accent/20 font-medium ring-1 ring-inset ring-foreground/5",
      )}
      onClick={() => {
        if (!editing && !generating) {
          setActive(id);
        }
      }}
    >
      <div className="flex-1 flex flex-col gap-2">
        {generating ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
            <ShimmerText className="text-sm truncate">
              Generating title...
            </ShimmerText>
          </div>
        ) : editing ? (
          <input
            autoFocus
            value={text}
            onBlur={cancel}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
              if (e.key === "Escape") cancel();
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-transparent border-none outline-none focus:ring-0 p-0 text-sm"
          />
        ) : (
          <p className="text-sm">{title}</p>
        )}
        <p className="text-xs text-foreground/70">{formatDate(createdAt)}</p>
        {tags.length > 0 && <TagList active={active} tags={tags} />}
      </div>

      {!editing && !generating && (
        <Menu
          id={id}
          pinned={!!pinned}
          setEditing={setEditing}
          setText={setText}
          updateTitle={updateTitle}
          generateTitle={generateTitle}
        />
      )}
    </div>
  );
};

interface MenuProps {
  id: string;
  pinned: boolean;
  setEditing: (val: boolean) => void;
  setText: (text: string) => void;
  updateTitle: (id: string, title: string) => void;
  generateTitle: (id: string) => Promise<string | void>;
}

const Menu: React.FC<MenuProps> = ({
  id,
  pinned,
  setEditing,
  setText,
  updateTitle,
  generateTitle,
}) => {
  const changeWorkspace = useJournalStore((state) => state.changeWorkspace);
  const deleteFn = useJournalStore((state) => state.deleteFn);
  const togglePin = useJournalStore((state) => state.togglePinned);
  const toggleArchived = useJournalStore((state) => state.toggleArchived);
  const setActive = useJournalStore((state) => state.setActive);
  const page = useJournalStore((state) => state.getFn(id));

  const [open, setOpen] = useState(false);

  const handleGenerate = async (e: Event) => {
    e.preventDefault();
    setOpen(false);
    const newTitle = await generateTitle(id);
    if (newTitle) {
      setText(newTitle);
      updateTitle(id, newTitle);
    }
  };

  const handleDelete = () => {
    deleteFn(id);
    toast.success("Page deleted successfully.");
    setOpen(false);
  };

  return (
    <AlertDialog>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="link"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-52"
          onClick={(e) => e.stopPropagation()}
        >
          {!page?.archived && (
            <>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="focus:text-primary focus:bg-primary/10 gap-2"
                  onSelect={handleGenerate}
                >
                  <Wand2 className="h-4 w-4" />
                  <span>Generate title</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />
            </>
          )}

          {!page?.archived && (
            <>
              <DropdownMenuGroup>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="gap-2">
                    <ArrowRightLeft className="h-4 w-4" />
                    <span>Move to</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      {WORKSPACES.map(
                        (workspace) =>
                          workspace !== page?.workspace && (
                            <DropdownMenuItem
                              key={workspace}
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

                <DropdownMenuItem
                  onSelect={() => togglePin(id)}
                  className="gap-2"
                >
                  {pinned ? (
                    <PinOff className="h-4 w-4" />
                  ) : (
                    <Pin className="h-4 w-4" />
                  )}
                  <span>{pinned ? "Unpin" : "Pin"}</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="gap-2"
                  onSelect={(e) => {
                    e.preventDefault();
                    setActive(id);
                    setEditing(true);
                    setOpen(false);
                  }}
                >
                  <TextCursor className="h-4 w-4" />
                  <span>Rename</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuGroup>
            <DropdownMenuItem
              onSelect={() => toggleArchived(id)}
              className="gap-2"
            >
              {page?.archived ? (
                <>
                  <ArchiveRestore className="h-4 w-4" />
                  <span>Unarchive</span>
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4" />
                  <span>Archive</span>
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive focus:bg-destructive/10 gap-2"
              onSelect={(e) => e.preventDefault()}
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent size="sm" onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            entry.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setOpen(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleDelete}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
