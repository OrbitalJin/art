import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WORKSPACES, type Workspace } from "@/lib/store/journal/types";
import {
  Briefcase,
  Microscope,
  PanelLeftClose,
  Plus,
  Search,
  User,
  X,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useJournalStore } from "@/lib/store/use-journal-store";
import { useMemo } from "react";
import { useJournalEditor } from "@/contexts/note-editor-context";
import { TagFilterDropdown } from "./page/tag/filter-dropdown";

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
  const create = useJournalStore((state) => state.create);
  const pages = useJournalStore((state) => state.pages);
  const { currentTab, setCurrentTab } = useJournalEditor();

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    pages.forEach((page) => {
      page.tags.forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return counts;
  }, [pages]);

  const allTags = useMemo(() => {
    const allTags = pages.flatMap((page) => page.tags);
    return [...new Set(allTags)].sort();
  }, [pages]);

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
          New Page
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
            placeholder="Search journal..."
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
                {workspace === "work" ? (
                  <Briefcase />
                ) : workspace === "personal" ? (
                  <User />
                ) : (
                  <Microscope />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};
