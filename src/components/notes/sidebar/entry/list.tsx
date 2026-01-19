import { useNoteStore } from "@/lib/store/use-note-store";
import { EntryListItem } from "@/components/notes/sidebar/entry/item";
import { useNoteEditor } from "@/contexts/note-editor-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EntrySection } from "./section";
import { Archive } from "lucide-react";

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

  const pinned = filtered.filter((e) => e.pinned && !e.archived);
  const regular = filtered.filter((e) => !e.pinned && !e.archived);
  const archived = entries
    .filter((e) => e.archived)
    .filter((entry) => {
      const matchesSearch = entry.title
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => entry.tags.includes(tag));

      const matchesWorkspace = entry.workspace === currentTab;
      return matchesSearch && matchesTags && matchesWorkspace;
    });

  return (
    <ScrollArea className="flex-1 px-2 pt-2 overflow-y-hidden">
      <div className="space-y-2">
        {pinned.length > 0 && (
          <EntrySection
            title="Pinned"
            count={pinned.length}
            isPinned={true}
            defaultCollapsed={false}
          >
            {pinned.map((entry, index) => (
              <EntryListItem
                key={index}
                id={entry.id}
                pinned={entry.pinned}
                title={entry.title}
                active={entry.id === activeId}
                createdAt={entry.createdAt}
                tags={entry.tags}
              />
            ))}
          </EntrySection>
        )}

         {regular.length > 0 && (
           <EntrySection
             title="Notes"
             count={regular.length}
             defaultCollapsed={false}
           >
             {regular.map((entry, index) => (
               <EntryListItem
                 key={index}
                 id={entry.id}
                 title={entry.title}
                 active={entry.id === activeId}
                 createdAt={entry.updatedAt}
                 tags={entry.tags}
               />
             ))}
           </EntrySection>
         )}

         {archived.length > 0 && (
           <EntrySection
             title="Archived"
             count={archived.length}
             isPinned={false}
             defaultCollapsed={true}
             icon={Archive}
           >
             {archived.map((entry, index) => (
               <EntryListItem
                 key={index}
                 id={entry.id}
                 title={entry.title}
                 active={entry.id === activeId}
                 createdAt={entry.updatedAt}
                 tags={entry.tags}
               />
             ))}
           </EntrySection>
         )}

         {pinned.length === 0 && regular.length === 0 && archived.length === 0 && (
          <div className="pt-[50%] flex h-full items-center justify-center text-sm text-muted-foreground">
            {query || selectedTags.length > 0
              ? "No entries found"
              : "No entries available"}
          </div>
        )}
      </div>
    </ScrollArea>
  );
};
