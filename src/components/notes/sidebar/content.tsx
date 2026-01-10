import { Item } from "./item";
import { TagFilterDropdown } from "./tag-filter-dropdown";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WORKSPACES, type Workspace } from "@/lib/store/notes/types";
import { PanelLeftClose, Plus, Search } from "lucide-react";
import { useNoteStore } from "@/lib/store/use-note-store";
import { useMemo, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Props {
  setOpen: (open: boolean) => void;
  currentTab: Workspace;
  setCurrentTab: (tab: Workspace) => void;
}

export const SidebarContent: React.FC<Props> = ({
  setOpen,
  currentTab,
  setCurrentTab,
}) => {
  const activeId = useNoteStore((state) => state.activeId);
  const create = useNoteStore((state) => state.create);
  const entries = useNoteStore((state) => state.entries);
  const [query, setQuery] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const allTags = useMemo(() => {
    const allTags = entries.flatMap((entry) => entry.tags);
    return [...new Set(allTags)].sort();
  }, [entries]);

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    entries.forEach((entry) => {
      entry.tags.forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return counts;
  }, [entries]);
  const getTagCount = (tag: string) => tagCounts[tag] || 0;

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = entry.title
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => entry.tags.includes(tag));

    const matchesWorkspace = entry.workspace === currentTab;
    return matchesSearch && matchesTags && matchesWorkspace;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };
  return (
    <>
      <div className="flex flex-row p-2 gap-2 border-b">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => create(currentTab)}
        >
          <Plus />
          New Entry
        </Button>
        <Button size="icon" variant="outline" onClick={() => setOpen(false)}>
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
      <div className="flex flex-col gap-1 p-2 overflow-y-scroll h-full">
        {filteredEntries.length > 0 ? (
          filteredEntries.map((entry, index) => (
            <Item
              key={index}
              id={entry.id}
              title={entry.title}
              active={entry.id === activeId}
              updatedAt={entry.updatedAt}
              tags={entry.tags}
            />
          ))
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {query || selectedTags.length > 0
              ? "No entries found"
              : "No entries available"}
          </div>
        )}
      </div>
    </>
  );
};
