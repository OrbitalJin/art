import { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TagListProps {
  tags: string[];
  maxVisible?: number;
}

export const TagList = ({ tags, maxVisible = 2 }: TagListProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleTags = isExpanded ? tags : tags.slice(0, maxVisible);
  const hiddenTagsCount = Math.max(0, tags.length - maxVisible);

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1" ref={containerRef}>
      {visibleTags.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="text-xs px-1.5 py-0.5 hover:bg-primary/20 transition-colors cursor-default"
        >
          @{tag}
        </Badge>
      ))}

      {hiddenTagsCount > 0 && !isExpanded && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className="text-xs px-1.5 py-0.5 cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={() => setIsExpanded(true)}
            >
              +{hiddenTagsCount} more
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="flex flex-wrap gap-1 max-w-xs">
              {tags.slice(maxVisible).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  @{tag}
                </Badge>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      )}

      {isExpanded && tags.length > maxVisible && (
        <Badge
          variant="outline"
          className="text-xs px-1.5 py-0.5 cursor-pointer hover:bg-muted transition-colors"
          onClick={() => setIsExpanded(false)}
        >
          Show less
        </Badge>
      )}
    </div>
  );
};
