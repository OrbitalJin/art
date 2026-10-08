// sidebar-footer.tsx
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useJournalEditor } from "@/contexts/note-editor-context";
import { useCopy } from "@/hooks/use-copy";
import { useJournalStore } from "@/lib/store/use-journal-store";
import { cn } from "@/lib/utils";

const formatCount = (value: number, singular: string, plural: string) =>
  `${value.toLocaleString()} ${value === 1 ? singular : plural}`;

const ModeToggle: React.FC<{
  editable: boolean;
  disabled: boolean;
  onChange: (editable: boolean) => void;
}> = ({ editable, disabled, onChange }) => {
  const optionClasses = (selected: boolean) =>
    cn(
      "h-full flex-1 cursor-pointer rounded-full text-xs outline-none",
      "transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring/50",
      selected
        ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
        : "text-muted-foreground hover:text-foreground",
    );

  return (
    <div
      role="radiogroup"
      aria-label="Editor mode"
      className="flex h-8 flex-1 items-center rounded-full bg-foreground/5 p-0.5 ring-1 ring-border/50"
    >
      <button
        type="button"
        role="radio"
        aria-checked={editable}
        disabled={disabled}
        onClick={() => onChange(true)}
        className={optionClasses(editable)}
      >
        Edit
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={!editable}
        disabled={disabled}
        onClick={() => onChange(false)}
        className={optionClasses(!editable)}
      >
        Read
      </button>
    </div>
  );
};

export const SidebarFooter = () => {
  const { isEditable, isDisabled, wordCount, charCount, toggleEditable } =
    useJournalEditor();
  const currentNote = useJournalStore((state) =>
    state.getFn(state.activeId ?? ""),
  );
  const content = currentNote?.content ?? "";
  const { copy, copied } = useCopy(content);

  const handleModeChange = (editable: boolean) => {
    if (editable !== isEditable) toggleEditable();
  };

  const containerClasses = cn(
    "flex flex-col gap-3 border-t border-border/50 p-3",
    isDisabled && "pointer-events-none opacity-60",
  );

  return (
    <footer className={containerClasses}>
      <p className="text-[11px] text-muted-foreground/70 tabular-nums">
        {formatCount(wordCount, "word", "words")}
        <span aria-hidden className="mx-1.5">
          ·
        </span>
        {formatCount(charCount, "character", "characters")}
      </p>

      <div className="flex items-center gap-2">
        <ModeToggle
          editable={isEditable}
          disabled={isDisabled}
          onChange={handleModeChange}
        />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Copy note"
              disabled={isDisabled || !content}
              onClick={copy}
              className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
            >
              {copied ? (
                <Check className="size-4 text-emerald-500" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {copied ? "Copied" : "Copy note"}
          </TooltipContent>
        </Tooltip>
      </div>
    </footer>
  );
};
