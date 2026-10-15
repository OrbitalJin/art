import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bookmark, Braces } from "lucide-react";
import {
  useStashStore,
  type StashEntry,
  type StashKind,
} from "@/lib/store/use-stash-store";
import { extractPlaceholders, hasPlaceholders } from "@/lib/stash/placeholders";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: StashEntry | null;
  initialContent?: string;
}

interface KindOptionProps {
  label: string;
  hint: string;
  icon: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
}

const KindOption: React.FC<KindOptionProps> = ({
  label,
  hint,
  icon,
  selected,
  onSelect,
}) => {
  const optionClasses = cn(
    "flex flex-1 cursor-pointer items-center gap-3 rounded-lg border px-2.5 py-2 text-left",
    "outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring/50",
    selected
      ? "border-foreground/15 bg-muted/50"
      : "border-border/60 hover:bg-muted/40",
  );

  const tileClasses = cn(
    "flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors duration-150",
    selected
      ? "border-foreground/15 bg-foreground/[0.04] text-foreground"
      : "border-border/60 bg-muted/40 text-muted-foreground",
  );

  const labelClasses = cn(
    "text-[13px] font-medium",
    selected ? "text-foreground" : "text-foreground/80",
  );

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={optionClasses}
    >
      <span className={tileClasses}>{icon}</span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className={labelClasses}>{label}</span>
        <span className="truncate text-[11px] text-muted-foreground">
          {hint}
        </span>
      </span>
    </button>
  );
};

const PlaceholderHint: React.FC<{
  kind: StashKind;
  content: string;
  onUseTemplate: () => void;
}> = ({ kind, content, onUseTemplate }) => {
  const count = extractPlaceholders(content).length;

  if (kind === "template") {
    const text =
      count > 0
        ? `${count} ${count === 1 ? "placeholder" : "placeholders"} detected`
        : "Add {{name}} to create fillable fields.";

    return <p className="text-[11px] text-muted-foreground">{text}</p>;
  }

  if (count === 0) return null;

  return (
    <div className="flex items-center justify-between gap-2">
      <p className="text-[11px] text-muted-foreground">
        This prompt contains placeholders.
      </p>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-[11px] text-muted-foreground shadow-none hover:text-foreground"
        onClick={onUseTemplate}
      >
        Use template
      </Button>
    </div>
  );
};

const StashFormFields: React.FC<{
  entry?: StashEntry | null;
  initialContent: string;
  onDone: () => void;
}> = ({ entry, initialContent, onDone }) => {
  const addEntry = useStashStore((state) => state.addEntry);
  const updateEntry = useStashStore((state) => state.updateEntry);

  const [title, setTitle] = useState(entry?.title ?? "");
  const [content, setContent] = useState(entry?.content ?? initialContent);
  const [kind, setKind] = useState<StashKind>(
    entry?.kind ?? (hasPlaceholders(initialContent) ? "template" : "snippet"),
  );

  const canSave = content.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    if (entry) {
      updateEntry(entry.id, { title, content, kind });
    } else {
      addEntry({ title, content, kind });
    }
    onDone();
  };

  const handleContentKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      handleSave();
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {entry ? "Edit saved prompt" : "Save to stash"}
        </DialogTitle>
        <DialogDescription>Reuse prompts in agent mode.</DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="stash-title">Title</Label>
          <Input
            id="stash-title"
            value={title}
            placeholder="Untitled"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Type</Label>
          <div role="radiogroup" aria-label="Type" className="flex gap-2">
            <KindOption
              label="Snippet"
              hint="Inserted as-is"
              icon={<Bookmark className="size-4" aria-hidden />}
              selected={kind === "snippet"}
              onSelect={() => setKind("snippet")}
            />
            <KindOption
              label="Template"
              hint="Fill {{placeholders}} first"
              icon={<Braces className="size-4" aria-hidden />}
              selected={kind === "template"}
              onSelect={() => setKind("template")}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="stash-content">Prompt</Label>
          <Textarea
            id="stash-content"
            value={content}
            placeholder="Write a prompt you want to reuse…"
            className="max-h-56 min-h-24 resize-none"
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleContentKeyDown}
          />
          <PlaceholderHint
            kind={kind}
            content={content}
            onUseTemplate={() => setKind("template")}
          />
        </div>
      </div>

      <DialogFooter className="items-center sm:justify-between">
        <div />
        <div className="flex gap-2">
          <Button variant="outline" onClick={onDone}>
            Cancel
          </Button>
          <Button disabled={!canSave} onClick={handleSave}>
            {entry ? "Save changes" : "Save prompt"}
          </Button>
        </div>
      </DialogFooter>
    </>
  );
};

export const StashFormDialog = ({
  open,
  onOpenChange,
  entry,
  initialContent = "",
}: Props) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-[480px]">
      {open && (
        <StashFormFields
          key={entry?.id ?? "new"}
          entry={entry}
          initialContent={initialContent}
          onDone={() => onOpenChange(false)}
        />
      )}
    </DialogContent>
  </Dialog>
);
