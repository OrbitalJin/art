import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Trash2,
  MoreVertical,
  Loader2,
  Pin,
  PinOff,
  GitBranch,
  Wand2,
  BookDashed,
  TextCursor,
  Archive,
  ArchiveRestore,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ShimmerText } from "@/components/ui/shimmer-text";
import { useGenerateSessionTitle } from "@/hooks/use-generate-session-title";
import { useSessionStore } from "@/lib/store/use-session-store";
import { useStreamingState } from "@/hooks/use-streaming-state";
import { toast } from "sonner";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useCreatePageFromSession } from "@/hooks/use-create-page-from-session";
import type { Session } from "@/lib/store/session/types";
import { MODELS } from "@/lib/llm/common/types";
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

interface Props {
  item: Session;
  active: boolean;
  onSwitch?: () => void;
}

export const SessionListItem: React.FC<Props> = ({
  item,
  active,
  onSwitch,
}) => {
  const { generating, generateTitle } = useGenerateSessionTitle();
  const { isSessionStreaming } = useStreamingState();

  const setActive = useSessionStore((s) => s.setActive);
  const updateTitle = useSessionStore((s) => s.updateTitle);

  const getFn = useSessionStore((state) => state.getFn);

  const { title, id, branchOf } = item;

  const parentSession = branchOf ? getFn(branchOf) : undefined;

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

  useEffect(() => {
    setText(title);
  }, [title]);

  return (
    <div
      tabIndex={0}
      className={cn(
        "group relative flex items-center w-full gap-2 rounded-md px-3 py-2",
        "text-sm select-none transition-all outline-none",
        "hover:bg-accent/30 hover:text-accent-foreground",
        active &&
          "bg-accent/20 font-medium text-accent-foreground ring-1 ring-inset ring-foreground/5",
      )}
      onClick={() => {
        if (!editing && !generating) {
          setActive(id);
          onSwitch?.();
        }
      }}
    >
      {branchOf && (
        <HoverCard openDelay={300} closeDelay={150}>
          <HoverCardTrigger
            asChild
            onClick={(e) => {
              e.stopPropagation();
              if (parentSession) {
                setActive(parentSession?.id);
              }
            }}
          >
            <span className="shrink-0 cursor-pointer">
              <GitBranch className="h-4 w-4 text-muted-foreground/60" />
            </span>
          </HoverCardTrigger>
          <HoverCardContent
            align="center"
            side="right"
            className="w-64 overflow-hidden border-muted-foreground/20 p-0 shadow-xl"
          >
            <div className="flex items-center justify-between border-b bg-muted/30 p-2 px-3">
              <p className="text-sm font-medium">Branched From</p>
            </div>
            <div className="p-3">
              {parentSession ? (
                <>
                  <p className="text-xs font-medium text-foreground/80 truncate">
                    {parentSession.title}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground/80">
                    Model:{" "}
                    {MODELS.find((m) => m.id === parentSession.modelId)
                      ?.displayName ?? parentSession.modelId}
                  </p>
                  <p className="text-[11px] text-muted-foreground/80">
                    Created:{" "}
                    {new Date(parentSession.createdAt).toLocaleDateString()}
                  </p>
                </>
              ) : (
                <p className="text-[11px] text-muted-foreground/80">
                  Original session no longer exists.
                </p>
              )}
            </div>
          </HoverCardContent>
        </HoverCard>
      )}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {generating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
            <ShimmerText className="truncate">Generating title...</ShimmerText>
          </>
        ) : editing ? (
          <input
            type="text"
            value={text}
            autoFocus
            onChange={(e) => setText(e.target.value)}
            onBlur={cancel}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
              if (e.key === "Escape") cancel();
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-transparent border-none outline-none focus:ring-0 p-0"
          />
        ) : isSessionStreaming(id) ? (
          <ShimmerText>{title}</ShimmerText>
        ) : (
          <>
            <span className="wrap-break-word text-left text-foreground/80">
              {title}
            </span>
          </>
        )}
      </div>

      <div className="flex h-7 w-7 shrink-0 items-center justify-center">
        {isSessionStreaming(id) ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
        ) : (
          !editing &&
          !generating && (
            <Menu
              item={item}
              setText={setText}
              setEditing={setEditing}
              generateTitle={generateTitle}
            />
          )
        )}
      </div>
    </div>
  );
};

interface MenuProps {
  item: Session;
  setText: (text: string) => void;
  setEditing: (value: boolean) => void;
  generateTitle: (id: string) => Promise<string | void>;
}

const Menu: React.FC<MenuProps> = ({
  item,
  setText,
  setEditing,
  generateTitle,
}) => {
  const togglePinned = useSessionStore((s) => s.togglePinned);
  const deleteFn = useSessionStore((s) => s.deleteFn);
  const toggleArchived = useSessionStore((s) => s.toggleArchived);

  const { creating, create } = useCreatePageFromSession();
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    deleteFn(item.id);
    toast.success("Session deleted successfully.");
    setOpen(false);
  };

  const handleGenerate = async (e: Event) => {
    e.preventDefault();
    setOpen(false);
    const title = await generateTitle(item.id);
    if (title) {
      setText(title);
    }
  };

  const handleCreate = async (e: Event) => {
    e.preventDefault();
    await create(item.id);
    setOpen(false);
  };

  return (
    <AlertDialog>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="link"
            size="icon"
            className="
            h-7 w-7 opacity-0 group-hover:opacity-100 
            focus-visible:opacity-100 data-[state=open]:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-56"
          onClick={(e) => e.stopPropagation()}
        >
          {!item.archived && (
            <>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  disabled={creating}
                  onSelect={handleCreate}
                  className="gap-2 focus:text-primary focus:bg-primary/10"
                >
                  {creating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <BookDashed className="h-4 w-4" />
                  )}
                  <span>{creating ? "Generating..." : "Generate Notes"}</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={handleGenerate}
                  className="gap-2 focus:text-primary focus:bg-primary/10"
                >
                  <Wand2 className="h-4 w-4" />
                  <span>Generate Title</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />
            </>
          )}

          {!item.archived && (
            <>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onSelect={() => togglePinned(item.id)}
                  className="gap-2"
                >
                  {item.pinned ? (
                    <PinOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Pin className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span>{item.pinned ? "Unpin Session" : "Pin Session"}</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  disabled={creating}
                  onSelect={() => setEditing(true)}
                  className="gap-2"
                >
                  <TextCursor className="h-4 w-4 text-muted-foreground" />
                  <span>Rename</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuGroup>
            <DropdownMenuItem
              onSelect={() => toggleArchived(item.id)}
              className="gap-2"
            >
              {item.archived ? (
                <>
                  <ArchiveRestore className="h-4 w-4 text-muted-foreground" />
                  <span>Unarchive</span>
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4 text-muted-foreground" />
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
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Session</span>
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setOpen(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
