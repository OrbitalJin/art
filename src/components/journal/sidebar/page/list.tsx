import { useMemo } from "react";
import { useJournalStore } from "@/lib/store/use-journal-store";
import { PageListItem } from "@/components/journal/sidebar/page/item";
import { useJournalEditor } from "@/contexts/note-editor-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Section } from "./section";
import { Archive } from "lucide-react";
import { useUIStateStore } from "@/lib/store/use-ui-state-store";

interface Props {
  query: string;
  selectedTags: string[];
}

export const PageList: React.FC<Props> = ({ query, selectedTags }) => {
  const { currentTab } = useJournalEditor();
  const activeId = useJournalStore((state) => state.activeId);
  const pages = useJournalStore((state) => state.pages);
  const journalState = useUIStateStore((s) => s.journalState);
  const setJournalState = useUIStateStore((s) => s.setJournalState);

  const isPinnedOpen = journalState.pinnedOpen;
  const isPagesOpen = journalState.sessionsOpen;
  const isArchivedOpen = journalState.archivedOpen;

  const setIsPinnedOpen = (open: boolean) =>
    setJournalState({ pinnedOpen: open });
  const setIsPagesOpen = (open: boolean) =>
    setJournalState({ sessionsOpen: open });
  const setIsArchivedOpen = (open: boolean) =>
    setJournalState({ archivedOpen: open });

  const { pinned, regular, archived } = useMemo(() => {
    const matchesQuery = (page: { title: string; tags: string[]; workspace: string }) => {
      const matchesSearch = page.title
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => page.tags.includes(tag));
      const matchesWorkspace = page.workspace === currentTab;
      return matchesSearch && matchesTags && matchesWorkspace;
    };

    const filtered = pages
      .filter(matchesQuery)
      .sort((a, b) => b.createdAt - a.createdAt);

    return {
      pinned: filtered.filter((e) => e.pinned && !e.archived),
      regular: filtered.filter((e) => !e.pinned && !e.archived),
      archived: pages.filter((e) => e.archived).filter(matchesQuery),
    };
  }, [pages, query, selectedTags, currentTab]);

  const isEmpty =
    pinned.length === 0 && regular.length === 0 && archived.length === 0;

  return (
    <div className="relative flex-1 overflow-hidden">
      <ScrollArea className="h-full px-2 mt-2">
        <div className="space-y-2 pb-4">
          {pinned.length > 0 && (
            <Section
              title="Pinned"
              count={pinned.length}
              isPinned={true}
              open={isPinnedOpen}
              setOpen={setIsPinnedOpen}
            >
              {pinned.map((page) => (
                <PageListItem
                  key={page.id}
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
              open={isPagesOpen}
              setOpen={setIsPagesOpen}
            >
              {regular.map((page) => (
                <PageListItem
                  key={page.id}
                  id={page.id}
                  title={page.title}
                  active={page.id === activeId}
                  createdAt={page.createdAt}
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
              open={isArchivedOpen}
              setOpen={setIsArchivedOpen}
              icon={Archive}
            >
              {archived.map((page) => (
                <PageListItem
                  key={page.id}
                  id={page.id}
                  title={page.title}
                  active={page.id === activeId}
                  createdAt={page.createdAt}
                  tags={page.tags}
                />
              ))}
            </Section>
          )}

          {isEmpty && (
            <div className="flex h-full items-center justify-center pt-[50%] text-sm text-muted-foreground">
              {query || selectedTags.length > 0
                ? "No pages found"
                : "No pages available"}
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-4 bg-linear-to-b from-background to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-4 bg-linear-to-t from-background to-transparent" />
    </div>
  );
};
