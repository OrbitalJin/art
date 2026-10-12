import { useMemo, useState } from "react";
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
}: Props) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-[480px]">
      {open && entry && (
        <TemplateFields
          key={entry.id}
          entry={entry}
          onCancel={() => onOpenChange(false)}
          onInsert={(text) => {
            onInsert(text);
            onOpenChange(false);
          }}
        />
      )}
    </DialogContent>
  </Dialog>
);
