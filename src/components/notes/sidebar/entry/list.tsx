import { useNoteStore } from "@/lib/store/use-note-store";
import { Item } from "@/components/notes/sidebar/entry/item";
import { useNoteEditor } from "@/contexts/note-editor-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EntrySection } from "./section";

interface Props {
  query: string;
  selectedTags: string[];
}

export const EntryList: React.FC<Props> = ({ query, selectedTags }) => {
  const { currentTab } = useNoteEditor();
  const activeId = useNoteStore((state) => state.activeId);
  const entries = useNoteStore((state) => state.entries);

  const filtered = entries.filter((entry) => {
    const matchesSearch = entry.title
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => entry.tags.includes(tag));

    const matchesWorkspace = entry.workspace === currentTab;
    return matchesSearch && matchesTags && matchesWorkspace;
  });

  const pinned = filtered.filter((e) => e.pinned);
  const regular = filtered.filter((e) => !e.pinned);

  return (
    <ScrollArea className="flex-1 px-2 pt-2 overflow-y-hidden">
      <div className="space-y-2">
        <EntrySection
          title="Pinned"
          count={pinned.length}
          isPinned={true}
          defaultCollapsed={false}
        >
          {pinned.map((entry, index) => (
            <Item
              key={index}
              id={entry.id}
              pinned={entry.pinned}
              title={entry.title}
              active={entry.id === activeId}
              updatedAt={entry.updatedAt}
              tags={entry.tags}
            />
          ))}
        </EntrySection>

        <EntrySection
          title="Notes"
          count={regular.length}
          defaultCollapsed={true}
        >
          {regular.map((entry, index) => (
            <Item
              key={index}
              id={entry.id}
              title={entry.title}
              active={entry.id === activeId}
              updatedAt={entry.updatedAt}
              tags={entry.tags}
            />
          ))}
        </EntrySection>
        {pinned.length === 0 && regular.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {query || selectedTags.length > 0
              ? "No entries found"
              : "No entries available"}
          </div>
        )}
      </div>
    </ScrollArea>
  );
};
