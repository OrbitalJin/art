import { Edit3, Eye, FileText, Hash, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useJournalEditor } from "@/contexts/note-editor-context";
import { useCopy } from "@/hooks/use-copy";
import { useJournalStore } from "@/lib/store/use-journal-store";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const SidebarFooter = () => {
  const {
    isEditable,
    isDisabled,
    wordCount,
    charCount,
    toggleEditable,
  } = useJournalEditor();
  const currentNote = useJournalStore((s) => s.getFn(s.activeId ?? ""));
  const { copy, copied } = useCopy(currentNote?.content as string);

  return (
    <div
      className={cn(
        "border-t bg-muted/30",
        isDisabled && "pointer-events-none opacity-80",
      )}
    >
      <div className="flex items-center justify-around px-4 py-3 text-xs">
        <StatItem icon={FileText} value={wordCount} label="words" />
        <StatItem icon={Hash} value={charCount} label="chars" />
      </div>

      <div className="flex items-center gap-2 p-2 border-t">
        <Button
          variant={"outline"}
          onClick={toggleEditable}
          className="flex-1 transition-all"
        >
          {isEditable ? (
            <Edit3 className="h-3.5 w-3.5 mr-1.5" />
          ) : (
            <Eye className="h-3.5 w-3.5 mr-1.5" />
          )}
          {isEditable ? "Editing" : "Reading"}
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="outline" onClick={copy}>
              {copied ? <Check /> : <Copy />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Copy content</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

interface StatItemProps {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
}

const StatItem = ({ icon: Icon, value, label }: StatItemProps) => {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
      <span className="font-medium text-foreground">
        {value.toLocaleString()}
      </span>
      <span>{label}</span>
    </div>
  );
};
