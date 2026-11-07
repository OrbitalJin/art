import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  AtSign,
  Briefcase,
  Microscope,
  PanelLeftClose,
  Plus,
  User,
  X,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { WORKSPACES, type Workspace } from "@/lib/store/journal/types";
import { useJournalIndex } from "@/lib/store/journal/index-store";
import { createPage } from "@/lib/store/journal/commands";
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
  const pages = useJournalIndex((state) => state.pages);
  const currentTab = useJournalIndex((state) => state.currentWorkspace);
  const setCurrentTab = useJournalIndex((state) => state.setWorkspace);
  const navigate = useNavigate();

  const workspacePages = useMemo(
    () => pages.filter((page) => page.workspace === currentTab),
    [pages, currentTab],
  );

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    workspacePages.forEach((page) => {
      page.tags.forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return counts;
  }, [workspacePages]);

  const allTags = useMemo(() => {
    const allTags = workspacePages.flatMap((page) => page.tags);
    return [...new Set(allTags)].sort();
  }, [workspacePages]);

  const getTagCount = (tag: string) => tagCounts[tag] || 0;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleCreate = () => {
    const id = createPage(currentTab);
    navigate(`/journal/${id}`);
  };

  const clearTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  return (
    <div className="flex flex-col">
      <div className="flex border-b border-border/50 p-2 gap-2">
        <Button
          variant="outline"
          className="flex-1 items-center"
          onClick={handleCreate}
        >
          <Plus className="h-4 w-4" /> New Page
        </Button>
        <Button variant="outline" size="icon" onClick={() => onClose(false)}>
          <PanelLeftClose />
        </Button>
      </div>

      <div className="flex flex-col border-b border-border/50 bg-card/30">
        <div className="flex items-center gap-2 p-2 px-3 flex-1">
          <div
            className={cn(
              "flex flex-1 flex-row items-center gap-2",
              "text-foreground/70 text-sm rounded-md",
            )}
          >
            <TagFilterDropdown
              allTags={allTags}
              selectedTags={selectedTags}
              onTagToggle={toggleTag}
              onClearAll={() => setSelectedTags([])}
              getTagCount={getTagCount}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="outline-none flex-1 p-1"
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
        </div>

        {selectedTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 px-3 pb-2">
            {selectedTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => clearTag(tag)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full bg-background/70 py-0.5 pl-2 pr-1.5",
                  "text-[11px] text-foreground/80 ring-1 ring-border/50",
                  "transition-colors hover:bg-background hover:text-foreground",
                )}
              >
                <AtSign className="size-3 opacity-60" />
                {tag}
                <X className="size-3 opacity-60" />
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSelectedTags([])}
              className="ml-0.5 text-[11px] text-muted-foreground transition-colors hover:text-destructive"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="flex border-b border-border/50 bg-card/50 p-2">
        <Tabs
          className="flex-1"
          defaultValue={currentTab}
          onValueChange={(v) => {
            setCurrentTab(v as Workspace);
          }}
        >
          <TabsList className="flex-1 w-full bg-transparent! p-0 gap-2">
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
