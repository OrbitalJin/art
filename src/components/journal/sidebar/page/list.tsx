import { useMemo } from "react";
import { Archive } from "lucide-react";
import { useJournalIndex } from "@/lib/store/journal/index-store";
import { PageListItem } from "@/components/journal/sidebar/page/item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUIStateStore } from "@/lib/store/use-ui-state-store";
import { Section } from "./section";

const getTimeGroup = (createdAt: number) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayStartMs = todayStart.getTime();

  if (createdAt >= todayStartMs) return "today";

  const yesterdayStartMs = todayStartMs - 86400000;
  if (createdAt >= yesterdayStartMs) return "yesterday";

  const sevenDaysAgoMs = todayStartMs - 7 * 86400000;
  if (createdAt >= sevenDaysAgoMs) return "last7Days";

  return "older";
};

interface Props {
  query: string;
  selectedTags: string[];
}

export const PageList: React.FC<Props> = ({ query, selectedTags }) => {
  const currentTab = useJournalIndex((state) => state.currentWorkspace);
  const activeId = useJournalIndex((state) => state.activeId);
  const pages = useJournalIndex((state) => state.pages);
  const journalState = useUIStateStore((s) => s.journalState);
  const setJournalState = useUIStateStore((s) => s.setJournalState);

  const isPinnedOpen = journalState.pinnedOpen;
  const isTodayOpen = journalState.todayOpen;
  const isYesterdayOpen = journalState.yesterdayOpen;
  const isLast7DaysOpen = journalState.last7DaysOpen;
  const isOlderOpen = journalState.olderOpen;
  const isArchivedOpen = journalState.archivedOpen;

  const setIsPinnedOpen = (open: boolean) =>
    setJournalState({ pinnedOpen: open });
  const setIsTodayOpen = (open: boolean) => setJournalState({ todayOpen: open });
  const setIsYesterdayOpen = (open: boolean) =>
    setJournalState({ yesterdayOpen: open });
  const setIsLast7DaysOpen = (open: boolean) =>
    setJournalState({ last7DaysOpen: open });
  const setIsOlderOpen = (open: boolean) => setJournalState({ olderOpen: open });
  const setIsArchivedOpen = (open: boolean) =>
    setJournalState({ archivedOpen: open });

  const { pinned, regular, archived } = useMemo(() => {
    const matchesQuery = (page: {
      title: string;
      tags: string[];
      workspace: string;
    }) => {
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
      pinned: filtered.filter((page) => page.pinned && !page.archived),
      regular: filtered.filter((page) => !page.pinned && !page.archived),
      archived: pages
        .filter((page) => page.archived)
        .filter(matchesQuery)
        .sort((a, b) => b.createdAt - a.createdAt),
    };
  }, [pages, query, selectedTags, currentTab]);

  const today = useMemo(
    () => regular.filter((page) => getTimeGroup(page.createdAt) === "today"),
    [regular],
  );
  const yesterday = useMemo(
    () => regular.filter((page) => getTimeGroup(page.createdAt) === "yesterday"),
    [regular],
  );
  const last7Days = useMemo(
    () => regular.filter((page) => getTimeGroup(page.createdAt) === "last7Days"),
    [regular],
  );
  const older = useMemo(
    () => regular.filter((page) => getTimeGroup(page.createdAt) === "older"),
    [regular],
  );

  const isEmpty =
    pinned.length === 0 && regular.length === 0 && archived.length === 0;
  const emptyLabel =
    query.trim() || selectedTags.length > 0 ? "No matches" : "No pages yet";

  const rows = (items: typeof regular) =>
    items.map((page) => (
      <PageListItem
        key={page.id}
        id={page.id}
        pinned={page.pinned}
        title={page.title}
        active={page.id === activeId}
        updatedAt={page.updatedAt}
        tags={page.tags}
        wordCount={page.wordCount}
      />
    ));

  return (
    <div className="min-w-0 flex-1 overflow-hidden">
      <ScrollArea className="h-full px-2 scroll-fade-y [&>[data-radix-scroll-area-viewport]>div]:block!">
        <div className="flex min-w-0 flex-col gap-3 pb-4">
          {pinned.length > 0 && (
            <Section
              title="Pinned"
              count={pinned.length}
              isPinned={true}
              open={isPinnedOpen}
              setOpen={setIsPinnedOpen}
            >
              {rows(pinned)}
            </Section>
          )}

          {today.length > 0 && (
            <Section
              title="Today"
              count={today.length}
              open={isTodayOpen}
              setOpen={setIsTodayOpen}
            >
              {rows(today)}
            </Section>
          )}

          {yesterday.length > 0 && (
            <Section
              title="Yesterday"
              count={yesterday.length}
              open={isYesterdayOpen}
              setOpen={setIsYesterdayOpen}
            >
              {rows(yesterday)}
            </Section>
          )}

          {last7Days.length > 0 && (
            <Section
              title="Last 7 days"
              count={last7Days.length}
              open={isLast7DaysOpen}
              setOpen={setIsLast7DaysOpen}
            >
              {rows(last7Days)}
            </Section>
          )}

          {older.length > 0 && (
            <Section
              title="Older"
              count={older.length}
              open={isOlderOpen}
              setOpen={setIsOlderOpen}
            >
              {rows(older)}
            </Section>
          )}

          {archived.length > 0 && (
            <Section
              title="Archived"
              count={archived.length}
              open={isArchivedOpen}
              icon={Archive}
              setOpen={setIsArchivedOpen}
            >
              {rows(archived)}
            </Section>
          )}

          {isEmpty && (
            <div className="flex h-full items-center justify-center pt-[50%] text-xs text-muted-foreground/60">
              {emptyLabel}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
