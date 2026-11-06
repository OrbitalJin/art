import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AtSign, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagFilterDropdownProps {
  allTags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onClearAll: () => void;
  getTagCount: (tag: string) => number;
}

const SearchRow: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const rowClassName = cn(
    "flex items-center gap-2 border-b border-border/40 px-3.5 py-2.5",
  );

  const inputClassName = cn(
    "min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none",
    "placeholder:text-muted-foreground/60",
  );

  return (
    <div className={rowClassName}>
      <Search
        strokeWidth={1.75}
        className="size-3.5 shrink-0 text-muted-foreground/60"
      />
      <input
        autoFocus
        placeholder="Search tags..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => event.stopPropagation()}
        className={inputClassName}
      />
    </div>
  );
};

interface TagRowProps {
  tag: string;
  count: number;
  selected: boolean;
  onToggle: () => void;
}

const TagRow: React.FC<TagRowProps> = ({ tag, count, selected, onToggle }) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onToggle();
    }
  };

  const rowClassName = cn(
    "flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm outline-none",
    "transition-colors duration-150 hover:bg-accent/40",
    "focus-visible:ring-2 focus-visible:ring-ring/50",
    selected ? "bg-accent/50 text-foreground" : "text-foreground/80",
  );

  const checkClassName = cn(
    "size-3.5 shrink-0 text-foreground transition-opacity duration-150",
    selected ? "opacity-100" : "opacity-0",
  );

  return (
    <div
      role="option"
      aria-selected={selected}
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      className={rowClassName}
    >
      <Check strokeWidth={2.25} className={checkClassName} />
      <span className="min-w-0 flex-1 truncate">@{tag}</span>
      <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground/70">
        {count}
      </span>
    </div>
  );
};

const EmptyState: React.FC<{
  searching: boolean;
  onClearSearch: () => void;
}> = ({ searching, onClearSearch }) => {
  if (!searching) {
    return (
      <p className="px-3 py-4 text-center text-xs text-muted-foreground/70">
        No tags available
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1 px-3 py-4">
      <p className="text-xs text-muted-foreground/70">No tags found</p>
      <Button
        variant="link"
        size="sm"
        className="h-auto p-0 text-xs"
        onClick={onClearSearch}
      >
        Clear search
      </Button>
    </div>
  );
};

const Footer: React.FC<{
  selectedCount: number;
  onClearAll: () => void;
}> = ({ selectedCount, onClearAll }) => {
  const footerClassName = cn(
    "flex items-center justify-between border-t border-border/40 py-1.5 pl-2 pr-3.5",
  );

  const clearClassName = cn(
    "h-7 rounded-md px-2 text-xs text-muted-foreground",
    "hover:bg-destructive/10 hover:text-destructive",
  );

  return (
    <div className={footerClassName}>
      <Button
        variant="ghost"
        size="sm"
        className={clearClassName}
        onClick={onClearAll}
        disabled={selectedCount === 0}
      >
        Clear selection
      </Button>

      <span className="text-[10px] tabular-nums text-muted-foreground/60">
        {selectedCount} selected
      </span>
    </div>
  );
};

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

  const hasTags = filteredAndSortedTags.length > 0;
  const hasSelection = selectedTags.length > 0;

  const triggerClassName = cn(
    "cursor-pointer select-none items-center justify-center",
    "rounded-lg outline-none transition-colors duration-150",
    "hover:bg-accent/60 hover:text-foreground active:bg-accent",
    "data-[state=open]:bg-accent data-[state=open]:text-foreground",
    "focus-visible:ring-2 focus-visible:ring-ring/50",
    hasSelection ? "text-primary" : "text-muted-foreground",
  );

  const contentClassName = cn(
    "w-64 overflow-hidden rounded-xl border-border/40 bg-popover/80 p-0",
    "shadow-lg shadow-black/10 backdrop-blur-2xl",
  );

  const clearSearch = () => setSearchQuery("");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          aria-label="Filter by tags"
          className={triggerClassName}
        >
          <AtSign strokeWidth={1.75} size={16} />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className={contentClassName} align="end">
        <SearchRow value={searchQuery} onChange={setSearchQuery} />

        <div
          role="listbox"
          aria-multiselectable
          className="flex max-h-64 flex-col gap-0.5 overflow-y-auto p-1"
        >
          {hasTags ? (
            filteredAndSortedTags.map((tag) => (
              <TagRow
                key={tag}
                tag={tag}
                count={getTagCount(tag)}
                selected={selectedTags.includes(tag)}
                onToggle={() => onTagToggle(tag)}
              />
            ))
          ) : (
            <EmptyState
              searching={searchQuery.length > 0}
              onClearSearch={clearSearch}
            />
          )}
        </div>

        <Footer selectedCount={selectedTags.length} onClearAll={onClearAll} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
