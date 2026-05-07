import { useSessionStore } from "@/lib/store/use-session-store";
import { SessionListItem } from "./item";
import { SessionSection } from "./section";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Archive } from "lucide-react";
import { useUIStateStore } from "@/lib/store/use-ui-state-store";

const getTimeGroup = (updatedAt: number) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayStartMs = todayStart.getTime();

  if (updatedAt >= todayStartMs) return "today";

  const yesterdayStartMs = todayStartMs - 86400000;
  if (updatedAt >= yesterdayStartMs) return "yesterday";

  const sevenDaysAgoMs = todayStartMs - 7 * 86400000;
  if (updatedAt >= sevenDaysAgoMs) return "last7Days";

  return "older";
};

interface Props {
  onSessionSwitch?: () => void;
  query: string;
}

export const SessionList: React.FC<Props> = ({ onSessionSwitch, query }) => {
  const activeId = useSessionStore((s) => s.activeId);
  const sessions = useSessionStore((s) => s.sessions);
  const chatState = useUIStateStore((s) => s.chatState);
  const setChatState = useUIStateStore((s) => s.setChatState);

  const isPinnedOpen = chatState.pinnedOpen;
  const isArchivedOpen = chatState.archivedOpen;
  const isTodayOpen = chatState.todayOpen;
  const isYesterdayOpen = chatState.yesterdayOpen;
  const isLast7DaysOpen = chatState.last7DaysOpen;
  const isOlderOpen = chatState.olderOpen;

  const setIsPinnedOpen = (open: boolean) =>
    setChatState({ ...chatState, pinnedOpen: open });
  const setIsArchivedOpen = (open: boolean) =>
    setChatState({ ...chatState, archivedOpen: open });
  const setIsTodayOpen = (open: boolean) =>
    setChatState({ ...chatState, todayOpen: open });
  const setIsYesterdayOpen = (open: boolean) =>
    setChatState({ ...chatState, yesterdayOpen: open });
  const setIsLast7DaysOpen = (open: boolean) =>
    setChatState({ ...chatState, last7DaysOpen: open });
  const setIsOlderOpen = (open: boolean) =>
    setChatState({ ...chatState, olderOpen: open });

  const filtered = sessions.filter((session) =>
    session.title.toLowerCase().includes(query.toLowerCase()),
  );

  const pinned = filtered
    .filter((session) => session.pinned && !session.archived)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const regular = filtered
    .filter((session) => !session.pinned && !session.archived)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const archived = filtered
    .filter((session) => session.archived)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const today = regular.filter((s) => getTimeGroup(s.updatedAt) === "today");
  const yesterday = regular.filter(
    (s) => getTimeGroup(s.updatedAt) === "yesterday",
  );
  const last7Days = regular.filter(
    (s) => getTimeGroup(s.updatedAt) === "last7Days",
  );
  const older = regular.filter((s) => getTimeGroup(s.updatedAt) === "older");

  const isEmpty =
    archived.length === 0 && regular.length === 0 && pinned.length === 0;

  return (
    <div className="relative flex-1 overflow-hidden">
      <ScrollArea className="h-full px-2 mt-2">
        <div className="space-y-2 pb-4">
          {pinned.length > 0 && (
            <SessionSection
              title="Pinned"
              count={pinned.length}
              isPinned={true}
              open={isPinnedOpen}
              setOpen={setIsPinnedOpen}
            >
              {pinned.map((session) => (
                <SessionListItem
                  key={session.id}
                  item={session}
                  active={session.id === activeId}
                  onSwitch={onSessionSwitch}
                />
              ))}
            </SessionSection>
          )}

          {today.length > 0 && (
            <SessionSection
              title="Today"
              count={today.length}
              isPinned={false}
              open={isTodayOpen}
              setOpen={setIsTodayOpen}
            >
              {today.map((session) => (
                <SessionListItem
                  key={session.id}
                  item={session}
                  active={session.id === activeId}
                  onSwitch={onSessionSwitch}
                />
              ))}
            </SessionSection>
          )}

          {yesterday.length > 0 && (
            <SessionSection
              title="Yesterday"
              count={yesterday.length}
              isPinned={false}
              open={isYesterdayOpen}
              setOpen={setIsYesterdayOpen}
            >
              {yesterday.map((session) => (
                <SessionListItem
                  key={session.id}
                  item={session}
                  active={session.id === activeId}
                  onSwitch={onSessionSwitch}
                />
              ))}
            </SessionSection>
          )}

          {last7Days.length > 0 && (
            <SessionSection
              title="Last 7 days"
              count={last7Days.length}
              isPinned={false}
              open={isLast7DaysOpen}
              setOpen={setIsLast7DaysOpen}
            >
              {last7Days.map((session) => (
                <SessionListItem
                  key={session.id}
                  item={session}
                  active={session.id === activeId}
                  onSwitch={onSessionSwitch}
                />
              ))}
            </SessionSection>
          )}

          {older.length > 0 && (
            <SessionSection
              title="Older"
              count={older.length}
              isPinned={false}
              open={isOlderOpen}
              setOpen={setIsOlderOpen}
            >
              {older.map((session) => (
                <SessionListItem
                  key={session.id}
                  item={session}
                  active={session.id === activeId}
                  onSwitch={onSessionSwitch}
                />
              ))}
            </SessionSection>
          )}

          {archived.length > 0 && (
            <SessionSection
              title="Archived"
              count={archived.length}
              isPinned={false}
              open={isArchivedOpen}
              icon={Archive}
              setOpen={setIsArchivedOpen}
            >
              {archived.map((session) => (
                <SessionListItem
                  key={session.id}
                  item={session}
                  active={session.id === activeId}
                  onSwitch={onSessionSwitch}
                />
              ))}
            </SessionSection>
          )}

          {isEmpty && (
            <div className="flex h-full items-center justify-center pt-[50%] text-sm text-muted-foreground">
              No sessions found
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="pointer-events-none opacity-60 absolute inset-x-0 top-0 h-4 bg-linear-to-b from-background to-transparent" />
      <div className="pointer-events-none opacity-60 absolute inset-x-0 bottom-0 h-4 bg-linear-to-t from-background to-transparent" />
    </div>
  );
};
