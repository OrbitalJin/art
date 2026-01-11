import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, AtSign } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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

  const filteredTags = allTags.filter((tag) =>
    tag.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="outline">
          <AtSign />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0" align="start">
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <DropdownMenuSeparator />

        <div className=" flex flex-col max-h-64 overflow-y-auto gap-2 p-2 text-primary">
          {filteredTags.length > 0 ? (
            filteredTags.map((tag) => (
              <div
                key={tag}
                onClick={() => {
                  onTagToggle(tag);
                }}
                className={cn(
                  "flex items-center justify-between p-2 rounded-md",
                  "hover:bg-accent/50 hover:ring-1 hover:ring-primary/50",
                  "cursor-pointer transition-all",
                  selectedTags.includes(tag) &&
                    "bg-primary/10 ring-1 ring-primary/50",
                )}
              >
                <span>@{tag}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                    {getTagCount(tag)}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="px-3 py-4 text-sm text-muted-foreground text-center">
              {searchQuery ? "No tags found" : "No tags available"}
            </div>
          )}
        </div>

        {selectedTags.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="flex items-center justify-between p-2 bg-muted/10">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8 text-muted-foreground hover:text-destructive"
                onClick={onClearAll}
              >
                Clear selection
              </Button>
              <p className="text-[10px] text-muted-foreground px-2">
                {selectedTags.length.toString() + " "}
                selected
              </p>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
