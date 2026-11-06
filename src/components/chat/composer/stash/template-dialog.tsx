import { useMemo, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { StashEntry } from "@/lib/store/use-stash-store";
import {
  extractPlaceholders,
  fillPlaceholders,
} from "@/lib/stash/placeholders";
import {
  StashDialogBody,
  StashDialogFooter,
  StashDialogHeader,
  StashField,
  stashDialogContentClassName,
} from "./stash-dialog-parts";

interface Props {
  entry: StashEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (text: string) => void;
}

const TemplatePreview: React.FC<{ text: string }> = ({ text }) => {
  const previewClassName = cn(
    "max-h-40 overflow-auto rounded-lg border border-border/40 bg-muted/30 px-3 py-2",
    "font-mono text-xs leading-relaxed whitespace-pre-wrap text-foreground/80",
  );

  return <pre className={previewClassName}>{text}</pre>;
};

const TemplateFields: React.FC<{
  entry: StashEntry;
  onCancel: () => void;
  onInsert: (text: string) => void;
}> = ({ entry, onCancel, onInsert }) => {
  const placeholders = useMemo(
    () => extractPlaceholders(entry.content),
    [entry.content],
  );
  const [values, setValues] = useState<Record<string, string>>({});

  const preview = fillPlaceholders(entry.content, values);

  return (
    <>
      <StashDialogHeader
        title={entry.title}
        description="Fill in the placeholders before inserting."
      />

      <StashDialogBody>
        {placeholders.map((name) => (
          <StashField key={name} label={name} htmlFor={`stash-ph-${name}`}>
            <Input
              id={`stash-ph-${name}`}
              value={values[name] ?? ""}
              placeholder={`Value for ${name}`}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [name]: e.target.value }))
              }
            />
          </StashField>
        ))}

        <StashField label="Preview">
          <TemplatePreview text={preview} />
        </StashField>
      </StashDialogBody>

      <StashDialogFooter>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={() => onInsert(preview)}>
          Insert
        </Button>
      </StashDialogFooter>
    </>
  );
};

const DiscardDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}> = ({ open, onOpenChange, onConfirm }) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent size="sm">
      <AlertDialogHeader>
        <AlertDialogTitle>Close without inserting?</AlertDialogTitle>
        <AlertDialogDescription>
          Any values you entered won't be inserted.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction variant="destructive" onClick={onConfirm}>
          Discard
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export const TemplateDialog = ({
  entry,
  open,
  onOpenChange,
  onInsert,
}: Props) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const requestClose = () => setConfirmOpen(true);

  const confirmClose = () => {
    setConfirmOpen(false);
    onOpenChange(false);
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      requestClose();
      return;
    }
    onOpenChange(true);
  };

  const handleInsert = (text: string) => {
    onInsert(text);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className={stashDialogContentClassName}
          onPointerDownOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => event.preventDefault()}
        >
          {open && entry && (
            <TemplateFields
              key={entry.id}
              entry={entry}
              onCancel={requestClose}
              onInsert={handleInsert}
            />
          )}
        </DialogContent>
      </Dialog>

      <DiscardDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={confirmClose}
      />
    </>
  );
};
