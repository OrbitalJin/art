import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Search, AtSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagFilterDropdownProps {
  allTags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onClearAll: () => void;
  getTagCount: (tag: string) => number;
}

export const TagFilterDropdown = ({
  allTags,
  selectedTags,
  onTagToggle,
  onClearAll,
  getTagCount,
}: TagFilterDropdownProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAndSortedTags = useMemo(() => {
    const filtered = allTags.filter((tag) =>
      tag.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return [
      ...filtered.filter((tag) => selectedTags.includes(tag)),
      ...filtered.filter((tag) => !selectedTags.includes(tag)),
    ];
  }, [allTags, searchQuery, selectedTags]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="relative"
          aria-label="Filter by tags"
        >
          <AtSign className="h-4 w-4" />
          {selectedTags.length > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-primary px-1 text-[10px] text-primary-foreground flex items-center justify-center">
              {selectedTags.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 p-0" align="start">
        <div className="p-2 border-b">
          <div className="flex flex-row items-center gap-2 rounded-md border flex-1 p-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              autoFocus
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="outline-none flex-1 text-sm"
            />
          </div>
        </div>
        <div
          role="listbox"
          className="flex max-h-64 flex-col gap-1 overflow-y-auto p-2"
        >
          {filteredAndSortedTags.length > 0 ? (
            filteredAndSortedTags.map((tag) => {
              const selected = selectedTags.includes(tag);

              return (
                <div
                  key={tag}
                  role="option"
                  aria-selected={selected}
                  tabIndex={0}
                  onClick={() => onTagToggle(tag)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onTagToggle(tag);
                    }
                  }}
                  className={cn(
                    "flex items-center justify-between rounded-md p-2 text-sm",
                    "cursor-pointer transition-colors",
                    "hover:bg-accent/50",
                    selected && "bg-primary/10 ring-1 ring-primary/50",
                  )}
                >
                  <span>@{tag}</span>

                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="h-5 px-1.5 text-xs">
                      {getTagCount(tag)}
                    </Badge>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              {searchQuery ? (
                <div className="space-y-1">
                  <p>No tags found</p>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={() => setSearchQuery("")}
                  >
                    Clear search
                  </Button>
                </div>
              ) : (
                "No tags available"
              )}
            </div>
          )}
        </div>

        <DropdownMenuSeparator />
        <div className="flex items-center justify-between bg-muted/10 p-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground hover:text-destructive"
            onClick={onClearAll}
          >
            Clear selection
          </Button>

          <span className="px-2 text-[10px] text-muted-foreground">
            {selectedTags.length} selected
          </span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
