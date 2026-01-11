import { Download, Upload } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTradeNote } from "@/hooks/use-trade-notes";
import { SidebarHeader } from "@/components/notes/sidebar/header";
import { EntryList } from "@/components/notes/sidebar/entry/list";

interface Props {
  onClose: (open: boolean) => void;
}

export const SidebarContent: React.FC<Props> = ({ onClose }) => {
  const [query, setQuery] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { importNote, exportCurrentNote } = useTradeNote();

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl">
      <SidebarHeader
        onClose={onClose}
        query={query}
        setQuery={setQuery}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
      />
      <EntryList query={query} selectedTags={selectedTags} />

      <div className="flex gap-2 p-2 border-t bg-card/50">
        <Button
          className="flex-1"
          variant="outline"
          onClick={exportCurrentNote}
        >
          <Upload className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button className="flex-1" variant="outline" onClick={importNote}>
          <Download className="h-4 w-4 mr-2" />
          Import
        </Button>
      </div>
    </div>
  );
};
