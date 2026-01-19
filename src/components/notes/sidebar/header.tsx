import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WORKSPACES, type Workspace } from "@/lib/store/notes/types";
import { PanelLeftClose, Plus, Search, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNoteStore } from "@/lib/store/use-note-store";
import { useMemo } from "react";
import { useNoteEditor } from "@/contexts/note-editor-context";
import { TagFilterDropdown } from "./entry/tag/filter-dropdown";

interface Props {
  onClose: (open: boolean) => void;
  setQuery: (query: string) => void;
  query: string;
  selectedTags: string[];
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
}

export const SidebarHeader: React.FC<Props> = ({
  query,
  selectedTags,
  setSelectedTags,
  setQuery,
  onClose,
}) => {
  const create = useNoteStore((state) => state.create);
  const entries = useNoteStore((state) => state.entries);
  const { currentTab, setCurrentTab } = useNoteEditor();

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    entries.forEach((entry) => {
      entry.tags.forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return counts;
  }, [entries]);

  const allTags = useMemo(() => {
    const allTags = entries.flatMap((entry) => entry.tags);
    return [...new Set(allTags)].sort();
  }, [entries]);

  const getTagCount = (tag: string) => tagCounts[tag] || 0;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };
  return (
    <div>
      <div className="flex flex-row p-2 gap-2 border-b">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => create(currentTab)}
        >
          <Plus />
          New Entry
        </Button>
        <Button size="icon" variant="outline" onClick={() => onClose(false)}>
          <PanelLeftClose />
        </Button>
      </div>
      <div className="flex p-2 border-b gap-2">
        <div
          className={cn(
            "flex-1 flex flex-row px-2 gap-2 items-center",
            "bg-card border text-foreground/70 text-sm rounded-md",
          )}
        >
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="outline-none flex-1"
            placeholder="Search entries..."
          />
          {query && (
            <X
              size={16}
              className="cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={() => setQuery("")}
            />
          )}
        </div>

        <Tooltip>
          <TooltipTrigger>
            <TagFilterDropdown
              allTags={allTags}
              selectedTags={selectedTags}
              onTagToggle={toggleTag}
              onClearAll={() => setSelectedTags([])}
              getTagCount={getTagCount}
            />
          </TooltipTrigger>
          <TooltipContent side="right">Filter by tags</TooltipContent>
        </Tooltip>
      </div>
      <div
        className={cn(
          "flex-1 flex flex-row p-2 items-center border-b justify-center",
        )}
      >
        <Tabs
          className="flex-1"
          defaultValue={currentTab}
          onValueChange={(v) => {
            setCurrentTab(v as Workspace);
          }}
        >
          <TabsList className="flex-1 w-full">
            {WORKSPACES.map((workspace) => (
              <TabsTrigger key={workspace} value={workspace} className="flex-1">
                {workspace.charAt(0).toUpperCase() + workspace.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};
