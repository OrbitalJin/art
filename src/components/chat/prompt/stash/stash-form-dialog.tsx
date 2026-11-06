import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useStashStore,
  type StashEntry,
  type StashKind,
} from "@/lib/store/use-stash-store";
import { extractPlaceholders, hasPlaceholders } from "@/lib/stash/placeholders";
import {
  StashDialogBody,
  StashDialogFooter,
  StashDialogHeader,
  StashField,
  stashDialogContentClassName,
} from "./stash-dialog-parts";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: StashEntry | null;
  initialContent?: string;
  initialTitle?: string;
}

const KindOption: React.FC<{
  label: string;
  selected: boolean;
  onSelect: () => void;
}> = ({ label, selected, onSelect }) => {
  const optionClassName = cn(
    "rounded-md px-3 py-1 text-xs font-medium outline-none",
    "transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring/50",
    selected
      ? "bg-background text-foreground shadow-sm"
      : "text-muted-foreground hover:text-foreground",
  );

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={optionClassName}
    >
      {label}
    </button>
  );
};

const KindToggle: React.FC<{
  kind: StashKind;
  onChange: (kind: StashKind) => void;
}> = ({ kind, onChange }) => {
  const groupClassName = cn("inline-flex rounded-lg bg-muted/50 p-0.5");

  const hint =
    kind === "template"
      ? "Fill {{placeholders}} before inserting."
      : "Inserted as-is.";

  return (
    <div className="flex items-center gap-3">
      <div role="radiogroup" aria-label="Type" className={groupClassName}>
        <KindOption
          label="Snippet"
          selected={kind === "snippet"}
          onSelect={() => onChange("snippet")}
        />
        <KindOption
          label="Template"
          selected={kind === "template"}
          onSelect={() => onChange("template")}
        />
      </div>
      <span className="text-[11px] text-muted-foreground">{hint}</span>
    </div>
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

const SaveShortcut: React.FC = () => {
  const keysClassName = cn(
    "rounded-md border border-border/50 bg-background/40 px-1.5 py-0.5",
    "text-[10px] font-medium text-muted-foreground/70",
  );

  return (
    <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
      <kbd className={keysClassName}>Ctrl ↵</kbd>
      save
    </span>
  );
};

const StashFormFields: React.FC<{
  entry?: StashEntry | null;
  initialContent: string;
  initialTitle: string;
  onDone: () => void;
}> = ({ entry, initialContent, initialTitle, onDone }) => {
  const addEntry = useStashStore((state) => state.addEntry);
  const updateEntry = useStashStore((state) => state.updateEntry);

  const [title, setTitle] = useState(entry?.title ?? initialTitle);
  const [content, setContent] = useState(entry?.content ?? initialContent);
  const [kind, setKind] = useState<StashKind>(
    entry?.kind ?? (hasPlaceholders(initialContent) ? "template" : "snippet"),
  );

  const canSave = content.trim().length > 0;
  const heading = entry ? "Edit saved prompt" : "Save to stash";
  const saveLabel = entry ? "Save changes" : "Save prompt";

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
      <StashDialogHeader
        title={heading}
        description="Reuse prompts in agent mode."
      />

      <StashDialogBody>
        <StashField label="Title" htmlFor="stash-title">
          <Input
            id="stash-title"
            value={title}
            placeholder="Untitled"
            onChange={(e) => setTitle(e.target.value)}
          />
        </StashField>

        <StashField label="Type">
          <KindToggle kind={kind} onChange={setKind} />
        </StashField>

        <StashField label="Prompt" htmlFor="stash-content">
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
        </StashField>
      </StashDialogBody>

      <StashDialogFooter hint={<SaveShortcut />}>
        <Button variant="ghost" size="sm" onClick={onDone}>
          Cancel
        </Button>
        <Button size="sm" disabled={!canSave} onClick={handleSave}>
          {saveLabel}
        </Button>
      </StashDialogFooter>
    </>
  );
};

export const StashFormDialog = ({
  open,
  onOpenChange,
  entry,
  initialContent = "",
  initialTitle = "",
}: Props) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className={stashDialogContentClassName}>
      {open && (
        <StashFormFields
          key={entry?.id ?? "new"}
          entry={entry}
          initialContent={initialContent}
          initialTitle={initialTitle}
          onDone={() => onOpenChange(false)}
        />
      )}
    </DialogContent>
  </Dialog>
);
