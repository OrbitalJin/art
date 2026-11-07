import { forwardRef, useImperativeHandle } from "react";
import {
  SuggestionEmpty,
  SuggestionHeader,
  SuggestionLabel,
  SuggestionListbox,
  SuggestionPanel,
  SuggestionRow,
  useSuggestionNavigation,
} from "@/components/ui/suggestion-list";

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

/**
 * Inline tag picker for the journal editor. Positioning/mounting is handled by
 * the Tiptap suggestion plugin (`props.mount`); this is purely the list.
 */
export const TagSuggestionList = forwardRef<
  TagSuggestionListHandle,
  TagSuggestionListProps
>(({ items, command }, ref) => {
  const navigation = useSuggestionNavigation(items, command);

  useImperativeHandle(ref, () => ({
    onKeyDown: navigation.handleKeyDown,
  }));

  const hasItems = items.length > 0;

  return (
    <SuggestionPanel data-tag-suggestion>
      <SuggestionHeader label="Tags" />

      {hasItems ? (
        <SuggestionListbox>
          {items.map((item, index) => (
            <SuggestionRow
              key={item.label}
              selected={index === navigation.activeIndex}
              rowRef={navigation.registerRow(index)}
              onHover={() => navigation.setSelectedIndex(index)}
              onSelect={() => navigation.choose(index)}
            >
              <SuggestionLabel>@{item.label}</SuggestionLabel>
            </SuggestionRow>
          ))}
        </SuggestionListbox>
      ) : (
        <SuggestionEmpty message="No tags match — keep typing to create one" />
      )}
    </SuggestionPanel>
  );
});

TagSuggestionList.displayName = "TagSuggestionList";
