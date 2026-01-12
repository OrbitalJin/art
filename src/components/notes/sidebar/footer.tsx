import {
  Download,
  Upload,
  Edit3,
  Eye,
  FileText,
  Hash,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNoteEditor } from "@/contexts/note-editor-context";
import { useTradeNote } from "@/hooks/use-trade-notes";
import { useCopy } from "@/hooks/use-copy";
import { useNoteStore } from "@/lib/store/use-note-store";
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
    isSaving,
    toggleEditable,
  } = useNoteEditor();
  const currentNote = useNoteStore((s) => s.getFn(s.activeId ?? ""));

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
          variant={isEditable ? "default" : "outline"}
          onClick={toggleEditable}
          className="flex-1 transition-all"
        >
          {isSaving ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin opacity-70" />
          ) : isEditable ? (
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
      <ExportButton />
    </div>
  );
};

export const ExportButton = () => {
  const { importNote, exportCurrentNote } = useTradeNote();

  return (
    <div className="flex items-center gap-2 p-2 border-t">
      <Button variant="outline" onClick={exportCurrentNote} className="flex-1">
        <Upload className="h-3.5 w-3.5" />
        Export
      </Button>
      <Button variant="outline" onClick={importNote} className="flex-1">
        <Download className="h-3.5 w-3.5" />
        Import
      </Button>
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
