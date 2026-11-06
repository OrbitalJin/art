import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StashSuggestionItem } from "./stash-suggestion";

export interface StashSuggestionListHandle {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export interface StashSuggestionListProps {
  items: StashSuggestionItem[];
  command: (item: StashSuggestionItem) => void;
  onEdit: (item: StashSuggestionItem) => void;
  onDelete: (item: StashSuggestionItem) => void;
}

const stop = (event: React.SyntheticEvent) => {
  event.preventDefault();
  event.stopPropagation();
};

const RowAction: React.FC<{
  label: string;
  destructive?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ label, destructive = false, onClick, children }) => {
  const actionClassName = cn(
    "flex size-6 shrink-0 items-center justify-center rounded-md",
    "text-muted-foreground/60 transition-colors duration-150",
    destructive
      ? "hover:bg-destructive/10 hover:text-destructive"
      : "hover:bg-accent/60 hover:text-foreground",
  );

  return (
    <button
      type="button"
      aria-label={label}
      className={actionClassName}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

interface SuggestionRowProps {
  item: StashSuggestionItem;
  selected: boolean;
  rowRef: (element: HTMLDivElement | null) => void;
  onHover: () => void;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const SuggestionRow = ({
  item,
  selected,
  rowRef,
  onHover,
  onSelect,
  onEdit,
  onDelete,
}: SuggestionRowProps) => {
  const isTemplate = item.kind === "template";

  const rowClassName = cn(
    "group/row flex w-full cursor-default items-center gap-2 rounded-lg px-2.5 py-1.5",
    "text-left text-sm outline-none transition-colors duration-150",
    selected ? "bg-accent/60 text-foreground" : "text-foreground/80",
  );

  const actionsClassName = cn(
    "ml-auto shrink-0 items-center gap-0.5",
    selected ? "flex" : "hidden group-hover/row:flex",
  );

  return (
    <div
      ref={rowRef}
      role="option"
      aria-selected={selected}
      onMouseEnter={onHover}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onSelect}
      className={rowClassName}
    >
      <span className="shrink-0 font-medium">{item.label}</span>

      {isTemplate && (
        <span className="shrink-0 text-[10px] text-muted-foreground/60">
          template
        </span>
      )}

      {item.preview && (
        <span className="min-w-0 truncate text-xs text-muted-foreground/60">
          {item.preview}
        </span>
      )}

      <span className={actionsClassName} onMouseDown={stop} onClick={stop}>
        <RowAction label={`Edit ${item.label}`} onClick={onEdit}>
          <Pencil strokeWidth={1.75} className="size-3" />
        </RowAction>
        <RowAction
          label={`Delete ${item.label}`}
          destructive
          onClick={onDelete}
        >
          <Trash2 strokeWidth={1.75} className="size-3" />
        </RowAction>
      </span>
    </div>
  );
};

const ListHeader: React.FC = () => {
  const headerClassName = cn(
    "border-b border-border/40 px-3.5 py-2",
    "text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60",
  );

  return <div className={headerClassName}>Prompt stash</div>;
};

const EmptyState: React.FC = () => (
  <p className="px-3.5 py-3 text-xs text-muted-foreground/70">
    No saved prompts match
  </p>
);

/**
 * Inline stash picker for the composer. Positioning/mounting is handled by the
 * Tiptap suggestion plugin (`props.mount`); this is purely the list.
 */
export const StashSuggestionList = forwardRef<
  StashSuggestionListHandle,
  StashSuggestionListProps
>(({ items, command, onEdit, onDelete }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  useEffect(() => {
    itemRefs.current[selectedIndex]?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const selectItem = (index: number) => {
    const item = items[index];
    if (item) command(item);
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      // Empty list: consume navigation so the caret stays put, but let Enter
      // fall through so the composer can decide (send / newline).
      if (!items.length) {
        return event.key === "ArrowUp" || event.key === "ArrowDown";
      }

      if (event.key === "ArrowUp") {
        setSelectedIndex((index) => (index + items.length - 1) % items.length);
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelectedIndex((index) => (index + 1) % items.length);
        return true;
      }
      if (event.key === "Enter" || event.key === "Tab") {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  const hasItems = items.length > 0;

  const listClassName = cn(
    "z-50 w-80 overflow-hidden rounded-xl border border-border/40",
    "bg-popover/80 text-popover-foreground backdrop-blur-2xl",
    "shadow-lg shadow-black/10",
  );

  return (
    <div className={listClassName} data-stash-suggestion>
      <ListHeader />

      {hasItems ? (
        <div
          role="listbox"
          className="flex max-h-64 flex-col gap-0.5 overflow-y-auto p-1"
        >
          {items.map((item, index) => (
            <SuggestionRow
              key={item.id}
              item={item}
              selected={index === selectedIndex}
              rowRef={(element) => {
                itemRefs.current[index] = element;
              }}
              onHover={() => setSelectedIndex(index)}
              onSelect={() => selectItem(index)}
              onEdit={() => onEdit(item)}
              onDelete={() => onDelete(item)}
            />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
});

StashSuggestionList.displayName = "StashSuggestionList";
