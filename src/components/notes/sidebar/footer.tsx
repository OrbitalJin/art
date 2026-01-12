import {
  Download,
  Upload,
  Edit3,
  Eye,
  FileText,
  Hash,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNoteEditor } from "@/contexts/note-editor-context";
import { useTradeNote } from "@/hooks/use-trade-notes";

export const SidebarFooter = () => {
  const { isEditable, wordCount, charCount, isSaving, toggleEditable } =
    useNoteEditor();

  return (
    <div className="border-t bg-muted/30">
      <div className="flex items-center justify-around px-4 py-3 text-xs">
        <StatItem icon={FileText} value={wordCount} label="words" />
        <StatItem icon={Hash} value={charCount} label="chars" />
      </div>

      <div className="flex items-center gap-2 p-2 border-t">
        <Button
          size="sm"
          variant={isEditable ? "default" : "outline"}
          onClick={toggleEditable}
          className="flex-1 h-8 transition-all"
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
