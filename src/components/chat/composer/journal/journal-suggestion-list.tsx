import { forwardRef, useImperativeHandle, useState } from "react";
import { formatDateAsAgo } from "@/lib/utils";
import { WORKSPACES, type Workspace } from "@/lib/store/journal/types";
import {
  SuggestionEmpty,
  SuggestionListbox,
  SuggestionPanel,
  SuggestionRow,
  SuggestionTab,
  SuggestionTabBar,
  useSuggestionNavigation,
} from "@/components/ui/suggestion-list";
import type { JournalSuggestionItem } from "./journal-suggestion";

export interface JournalSuggestionListHandle {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export interface JournalSuggestionListProps {
  items: JournalSuggestionItem[];
  command: (item: JournalSuggestionItem) => void;
}

const MAX_ITEMS = 20;

type WorkspaceTab = Workspace | "all";

const TABS: WorkspaceTab[] = ["all", ...WORKSPACES];

const tabLabel = (tab: WorkspaceTab): string =>
  tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1);

const formatWords = (count: number): string => {
  if (count === 0) return "Empty";
  const noun = count === 1 ? "word" : "words";
  return `${count.toLocaleString()} ${noun}`;
};

const metaOf = (item: JournalSuggestionItem): string => {
  const viewed = formatDateAsAgo(item.lastViewedAt);
  const words = formatWords(item.wordCount);
  return `${viewed} · ${words}`;
};

const WorkspaceTabs: React.FC<{
  value: WorkspaceTab;
  onChange: (tab: WorkspaceTab) => void;
}> = ({ value, onChange }) => (
  <SuggestionTabBar>
    {TABS.map((tab) => (
      <SuggestionTab
        key={tab}
        label={tabLabel(tab)}
        selected={tab === value}
        onSelect={() => onChange(tab)}
      />
    ))}
  </SuggestionTabBar>
);

interface JournalRowProps {
  item: JournalSuggestionItem;
  selected: boolean;
  showWorkspace: boolean;
  rowRef: (element: HTMLDivElement | null) => void;
  onHover: () => void;
  onSelect: () => void;
}

const JournalRow: React.FC<JournalRowProps> = ({
  item,
  selected,
  showWorkspace,
  rowRef,
  onHover,
  onSelect,
}) => {
  const meta = metaOf(item);

  return (
    <SuggestionRow
      selected={selected}
      rowRef={rowRef}
      onHover={onHover}
      onSelect={onSelect}
      className="gap-3 py-2"
    >
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-[13px] font-medium">{item.label}</span>
        <span className="truncate text-[11px] tabular-nums text-muted-foreground/70">
          {meta}
        </span>
      </span>

      {showWorkspace && (
        <span className="shrink-0 text-[10px] text-muted-foreground/50">
          {tabLabel(item.workspace)}
        </span>
      )}
    </SuggestionRow>
  );
};

/**
 * Inline journal picker for the composer. Positioning/mounting is handled by
 * the Tiptap suggestion plugin (`props.mount`); this owns the workspace tabs
 * and renders the filtered list.
 */
export const JournalSuggestionList = forwardRef<
  JournalSuggestionListHandle,
  JournalSuggestionListProps
>(({ items, command }, ref) => {
  const [workspace, setWorkspace] = useState<WorkspaceTab>("all");

  const visible = items
    .filter((item) => workspace === "all" || item.workspace === workspace)
    .slice(0, MAX_ITEMS);

  const navigation = useSuggestionNavigation(visible, command);

  useImperativeHandle(ref, () => ({
    onKeyDown: navigation.handleKeyDown,
  }));

  const selectTab = (tab: WorkspaceTab) => {
    setWorkspace(tab);
    navigation.setSelectedIndex(0);
  };

  const hasItems = visible.length > 0;
  const showWorkspace = workspace === "all";

  return (
    <SuggestionPanel data-journal-suggestion>
      <WorkspaceTabs value={workspace} onChange={selectTab} />

      {hasItems ? (
        <SuggestionListbox>
          {visible.map((item, index) => (
            <JournalRow
              key={item.id}
              item={item}
              selected={index === navigation.activeIndex}
              showWorkspace={showWorkspace}
              rowRef={navigation.registerRow(index)}
              onHover={() => navigation.setSelectedIndex(index)}
              onSelect={() => navigation.choose(index)}
            />
          ))}
        </SuggestionListbox>
      ) : (
        <SuggestionEmpty message="No journal entries match" />
      )}
    </SuggestionPanel>
  );
});

JournalSuggestionList.displayName = "JournalSuggestionList";
