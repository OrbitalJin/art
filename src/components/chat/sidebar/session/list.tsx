import { useSessionStore } from "@/lib/store/use-session-store";
import { SessionListItem } from "./item";
import { SessionSection } from "./section";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Archive } from "lucide-react";

interface Props {
  onSessionSwitch?: () => void;
  query: string;
}

export const SessionList: React.FC<Props> = ({ onSessionSwitch, query }) => {
  const activeId = useSessionStore((s) => s.activeId);
  const sessions = useSessionStore((s) => s.sessions);

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
              defaultCollapsed={false}
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

          {regular.length > 0 && (
            <SessionSection
              title="Sessions"
              count={regular.length}
              isPinned={false}
              defaultCollapsed={false}
            >
              {regular.map((session) => (
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
              defaultCollapsed={true}
              icon={Archive}
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

      <div className="pointer-events-none absolute inset-x-0 top-0 h-4 bg-linear-to-b from-background to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-4 bg-linear-to-t from-background to-transparent" />
    </div>
  );
};
