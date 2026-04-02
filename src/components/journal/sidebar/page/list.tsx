import { useJournalStore } from "@/lib/store/use-journal-store";
import { PageListItem } from "@/components/journal/sidebar/page/item";
import { useJournalEditor } from "@/contexts/note-editor-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Section } from "./section";
import { Archive } from "lucide-react";

interface Props {
  query: string;
  selectedTags: string[];
}

export const PageList: React.FC<Props> = ({ query, selectedTags }) => {
  const { currentTab } = useJournalEditor();
  const activeId = useJournalStore((state) => state.activeId);
  const pages = useJournalStore((state) => state.pages);

  const filtered = pages.filter((page) => {
    const matchesSearch = page.title
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => page.tags.includes(tag));

    const matchesWorkspace = page.workspace === currentTab;
    return matchesSearch && matchesTags && matchesWorkspace;
  });

  const pinned = filtered.filter((e) => e.pinned && !e.archived);
  const regular = filtered.filter((e) => !e.pinned && !e.archived);
  const archived = pages
    .filter((e) => e.archived)
    .filter((page) => {
      const matchesSearch = page.title
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => page.tags.includes(tag));

      const matchesWorkspace = page.workspace === currentTab;
      return matchesSearch && matchesTags && matchesWorkspace;
    });

  return (
    <ScrollArea className="flex-1 px-2 overflow-y-hidden">
      <div className="space-y-2">
        {pinned.length > 0 && (
          <Section
            title="Pinned"
            count={pinned.length}
            isPinned={true}
            defaultCollapsed={false}
          >
            {pinned.map((page, index) => (
              <PageListItem
                key={index}
                id={page.id}
                pinned={page.pinned}
                title={page.title}
                active={page.id === activeId}
                createdAt={page.createdAt}
                tags={page.tags}
              />
            ))}
          </Section>
        )}

        {regular.length > 0 && (
          <Section
            title="Pages"
            count={regular.length}
            defaultCollapsed={false}
          >
            {regular.map((page, index) => (
              <PageListItem
                key={index}
                id={page.id}
                title={page.title}
                active={page.id === activeId}
                createdAt={page.updatedAt}
                tags={page.tags}
              />
            ))}
          </Section>
        )}

        {archived.length > 0 && (
          <Section
            title="Archived"
            count={archived.length}
            isPinned={false}
            defaultCollapsed={true}
            icon={Archive}
          >
            {archived.map((page, index) => (
              <PageListItem
                key={index}
                id={page.id}
                title={page.title}
                active={page.id === activeId}
                createdAt={page.updatedAt}
                tags={page.tags}
              />
            ))}
          </Section>
        )}

        {pinned.length === 0 &&
          regular.length === 0 &&
          archived.length === 0 && (
            <div className="pt-[50%] flex h-full items-center justify-center text-sm text-muted-foreground">
              {query || selectedTags.length > 0
                ? "No pages found"
                : "No pages available"}
            </div>
          )}
      </div>
    </ScrollArea>
  );
};
