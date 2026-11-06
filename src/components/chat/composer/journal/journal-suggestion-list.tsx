import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import { WORKSPACES, type Workspace } from "@/lib/store/journal/types";
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

interface RowProps {
  item: JournalSuggestionItem;
  selected: boolean;
  showWorkspace: boolean;
  rowRef: (element: HTMLDivElement | null) => void;
  onHover: () => void;
  onSelect: () => void;
}

const Row = ({
  item,
  selected,
  showWorkspace,
  rowRef,
  onHover,
  onSelect,
}: RowProps) => {
  const rowClassName = cn(
    "flex w-full cursor-default items-center gap-3 rounded-lg px-2.5 py-2 text-left",
    "outline-none transition-colors duration-150",
    selected ? "bg-accent/60 text-foreground" : "text-foreground/80",
  );

  const workspaceClassName = cn(
    "shrink-0 text-[10px] text-muted-foreground/60",
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
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-[13px] font-medium">{item.label}</span>
        {item.preview && (
          <span className="truncate text-[11px] text-muted-foreground/70">
            {item.preview}
          </span>
        )}
      </span>

      {showWorkspace && (
        <span className={workspaceClassName}>{tabLabel(item.workspace)}</span>
      )}
    </div>
  );
};

const WorkspaceTabs: React.FC<{
  value: WorkspaceTab;
  onChange: (tab: WorkspaceTab) => void;
}> = ({ value, onChange }) => {
  const wrapperClassName = cn("border-b border-border/40 p-1.5");

  const trackClassName = cn(
    "flex items-center gap-0.5 rounded-lg bg-muted/40 p-0.5",
  );

  return (
    <div className={wrapperClassName}>
      <div role="tablist" className={trackClassName}>
        {TABS.map((tab) => {
          const selected = tab === value;

          const tabClassName = cn(
            "flex-1 rounded-md px-2 py-1 text-[11px] font-medium",
            "transition-colors duration-150",
            selected
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground/70 hover:text-foreground",
          );

          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={selected}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onChange(tab)}
              className={tabClassName}
            >
              {tabLabel(tab)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const EmptyState: React.FC = () => (
  <p className="px-3.5 py-5 text-center text-xs text-muted-foreground/70">
    No journal entries match
  </p>
);

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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  const visible = items
    .filter((item) => workspace === "all" || item.workspace === workspace)
    .slice(0, MAX_ITEMS);

  const activeIndex = visible.length
    ? Math.min(selectedIndex, visible.length - 1)
    : 0;

  useEffect(() => {
    itemRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const selectItem = (index: number) => {
    const item = visible[index];
    if (item) command(item);
  };

  const selectTab = (tab: WorkspaceTab) => {
    setWorkspace(tab);
    setSelectedIndex(0);
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (!visible.length) {
        return event.key === "ArrowUp" || event.key === "ArrowDown";
      }
      if (event.key === "ArrowUp") {
        setSelectedIndex((activeIndex + visible.length - 1) % visible.length);
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelectedIndex((activeIndex + 1) % visible.length);
        return true;
      }
      if (event.key === "Enter" || event.key === "Tab") {
        selectItem(activeIndex);
        return true;
      }
      return false;
    },
  }));

  const hasItems = visible.length > 0;
  const showWorkspace = workspace === "all";

  const listClassName = cn(
    "z-50 w-80 overflow-hidden rounded-xl border border-border/40",
    "bg-popover/80 text-popover-foreground backdrop-blur-2xl",
    "shadow-lg shadow-black/10",
  );

  return (
    <div className={listClassName} data-journal-suggestion>
      <WorkspaceTabs value={workspace} onChange={selectTab} />

      {hasItems ? (
        <div
          role="listbox"
          className="flex max-h-64 flex-col gap-0.5 overflow-y-auto p-1"
        >
          {visible.map((item, index) => (
            <Row
              key={item.id}
              item={item}
              selected={index === activeIndex}
              showWorkspace={showWorkspace}
              rowRef={(element) => {
                itemRefs.current[index] = element;
              }}
              onHover={() => setSelectedIndex(index)}
              onSelect={() => selectItem(index)}
            />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
});

JournalSuggestionList.displayName = "JournalSuggestionList";
