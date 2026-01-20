import { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useJournalEditor } from "@/contexts/note-editor-context";

interface TagListProps {
  tags: string[];
  active: boolean;
  maxVisible?: number;
}

export const TagList = ({ tags, active, maxVisible = 2 }: TagListProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { handleTagClick } = useJournalEditor();

  const visibleTags = isExpanded ? tags : tags.slice(0, maxVisible);
  const hiddenTagsCount = Math.max(0, tags.length - maxVisible);

  if (tags.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(!active && "pointer-events-none", "flex flex-wrap gap-1")}
      ref={containerRef}
    >
      {visibleTags.map((tag) => (
        <Badge
          key={tag}
          variant="outline"
          className="text-xs px-1.5 py-0.5 hover:bg-primary/10 transition-colors cursor-alias"
          onClick={() => handleTagClick(tag)}
        >
          @{tag}
        </Badge>
      ))}

      {hiddenTagsCount > 0 && !isExpanded && (
        <Badge
          variant="outline"
          className="text-xs px-1.5 py-0.5 cursor-pointer hover:bg-primary/10 transition-colors"
          onClick={() => setIsExpanded(true)}
        >
          +{hiddenTagsCount} more
        </Badge>
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
