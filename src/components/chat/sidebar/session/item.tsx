import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Trash2,
  MoreVertical,
  Loader2,
  Pin,
  PinOff,
  GitBranch,
  PencilSparkles,
  BookDashed,
  TextCursor,
  Archive,
  ArchiveRestore,
  Download,
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
import { generateSessionTitle } from "@/lib/ai/generate-session-title";
import { useSessionStore } from "@/lib/store/use-session-store";
import { toast } from "sonner";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useCreatePageFromSession } from "@/hooks/use-create-page-from-session";
import type { Session } from "@/lib/store/session/types";
import { MODELS } from "@/lib/ai/models";
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
import { useChatStream } from "@/contexts/chat-context";
import { useTradeSession } from "@/hooks/use-trade-session";
import { useNavigate } from "react-router-dom";

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
  const { title, id, branchOf } = item;

  const isTitleGenerating = useSessionStore((s) =>
    s.titleGeneratingIds.includes(id),
  );
  const updateTitle = useSessionStore((s) => s.updateTitle);
  const navigate = useNavigate();
  const getFn = useSessionStore((state) => state.getFn);
  const parentSession = branchOf ? getFn(branchOf) : undefined;

  const { streamingSessionId } = useChatStream();
  const isStreaming = streamingSessionId === id;

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
        isStreaming && "animate-pulse",
      )}
      onClick={() => {
        if (!editing && !isTitleGenerating) {
          navigate(`/chat/${id}`);
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
                navigate(`/chat/${parentSession.id}`);
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
      <div
        className={cn(
          "flex min-w-0 flex-1 items-center gap-2",
          isStreaming && "blur-xs",
        )}
      >
        {isTitleGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
            <p className="shimmer truncate">Generating title...</p>
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
        ) : isStreaming ? (
          <p className="shimmer">{title}</p>
        ) : (
          <>
            <span className="wrap-break-word text-left text-foreground/80">
              {title}
            </span>
          </>
        )}
      </div>

      <div className="flex h-7 w-7 shrink-0 items-center justify-center">
        {isStreaming ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
        ) : (
          !editing &&
          !isTitleGenerating && (
            <Menu
              item={item}
              setText={setText}
              setEditing={setEditing}
              generateTitle={generateSessionTitle}
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
  generateTitle: typeof generateSessionTitle;
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
  const branch = useSessionStore((s) => s.branch);

  const { creating, create } = useCreatePageFromSession();
  const { exportSession } = useTradeSession();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  const handleDelete = () => {
    setAlertOpen(false);
    if (item.id === useSessionStore.getState().activeId) {
      navigate("/chat", { replace: true });
    }
    deleteFn(item.id);
    toast.success("Session deleted successfully.");
  };

  const handleDeleteSelect = () => {
    setOpen(false);
    requestAnimationFrame(() => setAlertOpen(true));
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

  const handleBranch = (e: Event) => {
    e.preventDefault();
    setOpen(false);
    const success = branch(item.id);
    if (success) {
      toast.success("Session branched successfully");
    } else {
      toast.error("Failed to branch session");
    }
  };

  return (
    <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="link"
            size="icon"
            className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
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
          {/* Edit actions */}
          {!item.archived && (
            <>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onSelect={() => togglePinned(item.id)}
                  className="gap-2.5"
                >
                  {item.pinned ? (
                    <PinOff className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <Pin className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span>{item.pinned ? "Unpin" : "Pin"}</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={() => setEditing(true)}
                  className="gap-2.5"
                >
                  <TextCursor className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Rename</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              {/* AI actions */}
              <DropdownMenuGroup>
                <DropdownMenuItem onSelect={handleGenerate} className="gap-2.5">
                  <PencilSparkles className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Regenerate Title</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  disabled={creating}
                  onSelect={handleCreate}
                  className="gap-2.5"
                >
                  {creating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                  ) : (
                    <BookDashed className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span>{creating ? "Generating..." : "Generate Notes"}</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />
            </>
          )}

          {/* Session-level actions */}
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={handleBranch} className="gap-2.5">
              <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Branch</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onSelect={() => exportSession(item.id)}
              className="gap-2.5"
            >
              <Download className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Export</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onSelect={() => toggleArchived(item.id)}
              className="gap-2.5"
            >
              {item.archived ? (
                <ArchiveRestore className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <Archive className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span>{item.archived ? "Unarchive" : "Archive"}</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="gap-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive"
            onSelect={(e) => {
              e.preventDefault();
              handleDeleteSelect();
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete Session</span>
          </DropdownMenuItem>
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
          <AlertDialogCancel>Cancel</AlertDialogCancel>
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
