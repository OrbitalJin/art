import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { StashEntry } from "@/lib/store/use-stash-store";
import {
  extractPlaceholders,
  fillPlaceholders,
} from "@/lib/stash/placeholders";

interface Props {
  entry: StashEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (text: string) => void;
}

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
      <DialogHeader>
        <DialogTitle>{entry.title}</DialogTitle>
        <DialogDescription>
          Fill in the placeholders before inserting.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-3">
        {placeholders.map((name) => (
          <div key={name} className="flex flex-col gap-2">
            <Label htmlFor={`stash-ph-${name}`}>{name}</Label>
            <Input
              id={`stash-ph-${name}`}
              value={values[name] ?? ""}
              placeholder={`Value for ${name}`}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [name]: e.target.value }))
              }
            />
          </div>
        ))}

        <div className="flex flex-col gap-2">
          <Label>Preview</Label>
          <pre className="max-h-40 overflow-auto rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-xs whitespace-pre-wrap text-foreground/80">
            {preview}
          </pre>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onInsert(preview)}>Insert</Button>
      </DialogFooter>
    </>
  );
};

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

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!value) {
            requestClose();
            return;
          }
          onOpenChange(true);
        }}
      >
        <DialogContent
          className="sm:max-w-[480px]"
          onPointerDownOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => event.preventDefault()}
        >
          {open && entry && (
            <TemplateFields
              key={entry.id}
              entry={entry}
              onCancel={requestClose}
              onInsert={(text) => {
                onInsert(text);
                onOpenChange(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Close without inserting?</AlertDialogTitle>
            <AlertDialogDescription>
              Any values you entered won't be inserted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmClose}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
