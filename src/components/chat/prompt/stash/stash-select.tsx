import { useMemo, useState } from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { Button } from "@/components/ui/button";
import { Bookmark, Braces, Pencil, Plus, Trash2 } from "lucide-react";
import { useHotkey } from "@tanstack/react-hotkeys";
import {
  useStashStore,
  type StashEntry,
  type StashKind,
} from "@/lib/store/use-stash-store";
import { extractPlaceholders } from "@/lib/stash/placeholders";
import { cn } from "@/lib/utils";
import { useInsertPrompt } from "./use-insert-prompt";
import { StashFormDialog } from "./stash-form-dialog";
import { TemplateDialog } from "./template-dialog";

interface Props {
  textAreaRef: React.RefObject<HTMLTextAreaElement | null>;
}

const truncate = (value: string, length: number) => {
  const single = value.replace(/\s+/g, " ").trim();
  if (single.length <= length) return single;
  return `${single.slice(0, length).trimEnd()}…`;
};

const stop = (e: React.SyntheticEvent) => e.stopPropagation();

const StashIcon: React.FC<{ kind: StashKind }> = ({ kind }) => {
  if (kind === "template") {
    return <Braces size={32} strokeWidth={1} />;
  }

  return <Bookmark size={32} strokeWidth={1} />;
};

interface StashItemProps {
  entry: StashEntry;
  onSelect: (entry: StashEntry) => void;
  onEdit: (entry: StashEntry) => void;
  onDelete: (entry: StashEntry) => void;
}

const StashItem: React.FC<StashItemProps> = ({
  entry,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const fieldCount =
    entry.kind === "template" ? extractPlaceholders(entry.content).length : 0;
  const preview = truncate(entry.content, 80) || "(empty)";

  const itemClasses = cn("group/item gap-2.5 rounded-md px-2 py-1.5");

  const actionsClasses = cn(
    "flex shrink-0 items-center opacity-0 transition-opacity",
    "group-hover/item:opacity-100 group-data-[selected=true]/item:opacity-100",
    "focus-within:opacity-100",
  );

  const actionButtonClasses = "size-6 text-muted-foreground/60";

  return (
    <CommandItem
      value={`${entry.title} ${entry.content}`}
      onSelect={() => onSelect(entry)}
      className={itemClasses}
    >
      <StashIcon kind={entry.kind} />

      <span className="max-w-[45%] shrink-0 truncate text-[13px] text-foreground">
        {entry.title || "Untitled"}
      </span>

      <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground/60">
        {preview}
      </span>

      {fieldCount > 0 && (
        <span className="shrink-0 text-[11px] text-muted-foreground/50">
          {fieldCount}
        </span>
      )}

      <span
        className={actionsClasses}
        onPointerDown={stop}
        onMouseDown={stop}
        onClick={stop}
      >
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Edit ${entry.title}`}
          className={cn(actionButtonClasses, "hover:text-foreground")}
          onClick={() => onEdit(entry)}
        >
          <Pencil size={6} strokeWidth={1} />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Delete ${entry.title}`}
          className={cn(actionButtonClasses, "hover:text-destructive")}
          onClick={() => onDelete(entry)}
        >
          <Trash2 size={6} strokeWidth={1} />
        </Button>
      </span>
    </CommandItem>
  );
};

const StashEmpty: React.FC<{ hasEntries: boolean }> = ({ hasEntries }) => (
  <CommandEmpty className="px-4 py-6 text-center text-xs text-muted-foreground/70">
    {hasEntries ? "No matches." : "Nothing saved yet. Use “New prompt” below."}
  </CommandEmpty>
);

const StashFooter: React.FC<{ onCreate: () => void }> = ({ onCreate }) => (
  <div className="flex items-center justify-between border-t border-border/40 py-1 pr-1.5 pl-2">
    <Button
      variant="ghost"
      size="sm"
      className="h-6 gap-1 px-1.5 text-[11px] text-muted-foreground/70 shadow-none hover:text-foreground"
      onClick={onCreate}
    >
      <Plus size={12} aria-hidden />
      New prompt
    </Button>
    <span className="text-[11px] text-muted-foreground/40">↵</span>
  </div>
);

export const StashSelect = ({ textAreaRef }: Props) => {
  const entries = useStashStore((state) => state.entries);
  const hydrated = useStashStore((state) => state.hydrated);
  const removeEntry = useStashStore((state) => state.removeEntry);
  const insertPrompt = useInsertPrompt(textAreaRef);

  const [open, setOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<StashEntry | null>(null);
  const [template, setTemplate] = useState<StashEntry | null>(null);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<StashEntry | null>(null);

  useHotkey("Mod+P", (e) => {
    e.preventDefault();
    setOpen((value) => !value);
  });

  const sorted = useMemo(
    () => [...entries].sort((a, b) => b.updatedAt - a.updatedAt),
    [entries],
  );

  const handleSelect = (entry: StashEntry) => {
    setOpen(false);
    if (
      entry.kind === "template" &&
      extractPlaceholders(entry.content).length
    ) {
      setTemplate(entry);
      setTemplateOpen(true);
      return;
    }
    insertPrompt(entry.content);
  };

  const handleEdit = (entry: StashEntry) => {
    setOpen(false);
    setEditing(entry);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setOpen(false);
    setEditing(null);
    setFormOpen(true);
  };

  const handleDelete = (entry: StashEntry) => {
    setOpen(false);
    setPendingDelete(entry);
  };

  const triggerClasses = cn("h-9 w-9 transition-colors", open && "bg-muted/60");

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={triggerClasses}
            onClick={() => setOpen(true)}
          >
            <Bookmark className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Prompt stash</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Prompt stash (Ctrl+P)</TooltipContent>
      </Tooltip>

      <CommandDialog
        title="Prompt stash"
        description="Insert a saved prompt or template."
        showCloseButton={false}
        open={open}
        onOpenChange={setOpen}
      >
        <Command
          filter={(value, search) =>
            value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
          }
        >
          <CommandInput placeholder="Search…" />
          <CommandList className="max-h-80 p-1">
            <StashEmpty hasEntries={hydrated && sorted.length > 0} />

            <CommandGroup className="p-0">
              {sorted.map((entry) => (
                <StashItem
                  key={entry.id}
                  entry={entry}
                  onSelect={handleSelect}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </CommandGroup>
          </CommandList>

          <StashFooter onCreate={handleCreate} />
        </Command>
      </CommandDialog>

      <StashFormDialog
        open={formOpen}
        onOpenChange={(value) => {
          setFormOpen(value);
          if (!value) setEditing(null);
        }}
        entry={editing}
      />

      <TemplateDialog
        entry={template}
        open={templateOpen}
        onOpenChange={(value) => {
          setTemplateOpen(value);
          if (!value) setTemplate(null);
        }}
        onInsert={insertPrompt}
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(value) => {
          if (!value) setPendingDelete(null);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete saved prompt?</AlertDialogTitle>
            <AlertDialogDescription>
              “{pendingDelete?.title}” will be removed from your stash. This
              can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (pendingDelete) removeEntry(pendingDelete.id);
                setPendingDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
