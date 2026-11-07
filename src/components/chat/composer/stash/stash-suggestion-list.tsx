import { forwardRef, useImperativeHandle } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SuggestionEmpty,
  SuggestionHeader,
  SuggestionLabel,
  SuggestionListbox,
  SuggestionMeta,
  SuggestionPanel,
  SuggestionRow,
  useSuggestionNavigation,
} from "@/components/ui/suggestion-list";
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

const RowActions: React.FC<{
  item: StashSuggestionItem;
  selected: boolean;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ item, selected, onEdit, onDelete }) => {
  const actionsClassName = cn(
    "ml-auto shrink-0 items-center gap-0.5",
    selected ? "flex" : "hidden group-hover/row:flex",
  );

  return (
    <span className={actionsClassName} onMouseDown={stop} onClick={stop}>
      <RowAction label={`Edit ${item.label}`} onClick={onEdit}>
        <Pencil strokeWidth={1.75} className="size-3" />
      </RowAction>
      <RowAction label={`Delete ${item.label}`} destructive onClick={onDelete}>
        <Trash2 strokeWidth={1.75} className="size-3" />
      </RowAction>
    </span>
  );
};

/**
 * Inline stash picker for the composer. Positioning/mounting is handled by the
 * Tiptap suggestion plugin (`props.mount`); this is purely the list.
 */
export const StashSuggestionList = forwardRef<
  StashSuggestionListHandle,
  StashSuggestionListProps
>(({ items, command, onEdit, onDelete }, ref) => {
  const navigation = useSuggestionNavigation(items, command);

  useImperativeHandle(ref, () => ({
    onKeyDown: navigation.handleKeyDown,
  }));

  const hasItems = items.length > 0;

  return (
    <SuggestionPanel data-stash-suggestion>
      <SuggestionHeader label="Prompt stash" />

      {hasItems ? (
        <SuggestionListbox>
          {items.map((item, index) => {
            const selected = index === navigation.activeIndex;
            const isTemplate = item.kind === "template";

            return (
              <SuggestionRow
                key={item.id}
                selected={selected}
                rowRef={navigation.registerRow(index)}
                onHover={() => navigation.setSelectedIndex(index)}
                onSelect={() => navigation.choose(index)}
              >
                <SuggestionLabel>{item.label}</SuggestionLabel>
                {isTemplate && <SuggestionMeta>template</SuggestionMeta>}
                {item.preview && (
                  <SuggestionMeta>{item.preview}</SuggestionMeta>
                )}
                <RowActions
                  item={item}
                  selected={selected}
                  onEdit={() => onEdit(item)}
                  onDelete={() => onDelete(item)}
                />
              </SuggestionRow>
            );
          })}
        </SuggestionListbox>
      ) : (
        <SuggestionEmpty message="No saved prompts match" />
      )}
    </SuggestionPanel>
  );
});

StashSuggestionList.displayName = "StashSuggestionList";
