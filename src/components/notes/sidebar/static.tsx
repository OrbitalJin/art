import { PanelLeftClose, PanelLeftOpen, Plus, Search } from "lucide-react";
import { useNoteStore } from "@/lib/store/use-note-store";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Item } from "./item";
import { TagFilterDropdown } from "./tag-filter-dropdown";

export const StaticSidebar = () => {
  const create = useNoteStore((state) => state.create);
  const activeId = useNoteStore((state) => state.activeId);
  const entries = useNoteStore((state) => state.entries);

  const [open, setOpen] = useState(true);
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
    return matchesSearch && matchesTags;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!open) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="outline"
            onClick={() => setOpen(true)}
            className={cn(
              "bg-background/80 backdrop-blur shadow-sm transition-all duration-300",
              open && "opacity-0 pointer-events-none scale-90",
            )}
          >
            <PanelLeftOpen />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Alt + S</TooltipContent>
      </Tooltip>
    );
  }
  return (
    <div
      className={cn(
        "hidden lg:flex flex-col h-full w-[380px] overflow-hidden",
        "transition-all rounded-xl border bg-card/50",
        "hover:border-primary/40",
        open ? "" : "w-0 border-0",
      )}
    >
      <div className="flex flex-row p-2 gap-2 border-b">
        <Button variant="outline" className="flex-1" onClick={() => create()}>
          <Plus></Plus>
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
    </div>
  );
};
