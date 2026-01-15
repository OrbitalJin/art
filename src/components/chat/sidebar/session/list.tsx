import { useSessionStore } from "@/lib/store/use-session-store";
import { SessionListItem } from "./item";
import { SessionSection } from "./section";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
  onSessionSwitch?: () => void;
}

export const SessionList: React.FC<Props> = ({ onSessionSwitch }) => {
  const activeId = useSessionStore((s) => s.activeId);
  const sessions = useSessionStore((s) => s.sessions);

  const pinnedSessions = sessions
    .filter((session) => session.pinned)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const regularSessions = sessions
    .filter((session) => !session.pinned)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <ScrollArea className="flex-1 px-2 pt-2 overflow-y-hidden">
      <div className="space-y-2">
        {pinnedSessions.length > 0 && (
          <SessionSection
            title="Pinned"
            count={pinnedSessions.length}
            isPinned={true}
            defaultCollapsed={false}
          >
            {pinnedSessions.map((session) => (
              <SessionListItem
                key={session.id}
                id={session.id}
                title={session.title}
                active={session.id === activeId}
                pinned={session.pinned as boolean}
                onSwitch={onSessionSwitch}
                forkOf={session.forkOf}
              />
            ))}
          </SessionSection>
        )}

        {regularSessions.length > 0 && (
          <SessionSection
            title="Sessions"
            count={regularSessions.length}
            isPinned={false}
            defaultCollapsed={false}
          >
            {regularSessions.map((session) => (
              <SessionListItem
                key={session.id}
                id={session.id}
                title={session.title}
                active={session.id === activeId}
                pinned={session.pinned as boolean}
                onSwitch={onSessionSwitch}
                forkOf={session.forkOf}
              />
            ))}
          </SessionSection>
        )}

        {sessions.length === 0 && (
          <div className="px-3 py-4 text-center text-sm text-muted-foreground">
            No sessions yet
          </div>
        )}
      </div>
    </ScrollArea>
  );
};
