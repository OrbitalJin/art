import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

export interface TagSuggestionItem {
  label: string;
}

export interface TagSuggestionListHandle {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export interface TagSuggestionListProps {
  items: TagSuggestionItem[];
  command: (item: TagSuggestionItem) => void;
}

const headerClassName = cn(
  "border-b border-border/40 px-3.5 py-2",
  "text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60",
);

const listClassName = cn(
  "z-50 w-64 overflow-hidden rounded-xl border border-border/40",
  "bg-popover/80 text-popover-foreground backdrop-blur-2xl",
  "shadow-lg shadow-black/10",
);

/**
 * Inline tag picker for the journal editor. Positioning/mounting is handled by
 * the Tiptap suggestion plugin (`props.mount`); this is purely the list.
 */
export const TagSuggestionList = forwardRef<
  TagSuggestionListHandle,
  TagSuggestionListProps
>(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Clamp to the filtered list; the stored index can exceed it after filtering.
  const activeIndex = items.length
    ? Math.min(selectedIndex, items.length - 1)
    : 0;

  useEffect(() => {
    itemRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const selectItem = (index: number) => {
    const item = items[index];
    if (item) command(item);
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (!items.length) {
        return event.key === "ArrowUp" || event.key === "ArrowDown";
      }

      if (event.key === "ArrowUp") {
        setSelectedIndex((activeIndex + items.length - 1) % items.length);
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelectedIndex((activeIndex + 1) % items.length);
        return true;
      }
      if (event.key === "Enter" || event.key === "Tab") {
        selectItem(activeIndex);
        return true;
      }
      return false;
    },
  }));

  return (
    <div className={listClassName} data-tag-suggestion>
      <div className={headerClassName}>Tags</div>

      {items.length > 0 ? (
        <div
          role="listbox"
          className="flex max-h-64 flex-col gap-0.5 overflow-y-auto p-1"
        >
          {items.map((item, index) => (
            <div
              key={item.label}
              ref={(element) => {
                itemRefs.current[index] = element;
              }}
              role="option"
              aria-selected={index === activeIndex}
              onMouseEnter={() => setSelectedIndex(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectItem(index)}
              className={cn(
                "cursor-default rounded-lg px-2.5 py-1.5 text-sm outline-none",
                "transition-colors duration-150",
                index === activeIndex
                  ? "bg-accent/60 text-foreground"
                  : "text-foreground/80",
              )}
            >
              @{item.label}
            </div>
          ))}
        </div>
      ) : (
        <p className="px-3.5 py-3 text-xs text-muted-foreground/70">
          No tags match — keep typing to create one
        </p>
      )}
    </div>
  );
});

TagSuggestionList.displayName = "TagSuggestionList";
