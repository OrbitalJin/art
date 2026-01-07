import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, AtSign } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

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
        <div className="p-3 border-b">
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

        <div className="max-h-64 overflow-y-auto">
          {filteredTags.length > 0 ? (
            filteredTags.map((tag) => (
              <DropdownMenuItem
                key={tag}
                onSelect={(e) => {
                  e.preventDefault();
                  onTagToggle(tag);
                }}
                className="flex items-center justify-between"
              >
                <span>@{tag}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                    {getTagCount(tag)}
                  </Badge>
                  {selectedTags.includes(tag) && (
                    <X size={12} className="text-muted-foreground" />
                  )}
                </div>
              </DropdownMenuItem>
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
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="w-full justify-start text-sm"
              >
                <X size={14} className="mr-2" />
                Clear all filters
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
