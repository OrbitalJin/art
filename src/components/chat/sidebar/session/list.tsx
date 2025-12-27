import { useSessionStore } from "@/lib/ai/store/use-session-store";
import { SessionListItem } from "./item";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
  disabled?: boolean;
  onSessionSwitch?: () => void;
}

export const SessionList: React.FC<Props> = ({ disabled, onSessionSwitch }) => {
  const { sessions, activeId } = useSessionStore();
  
  // Ensure sessions are sorted by most recent first for consistency
  const sortedSessions = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <ScrollArea className="flex-1 px-2 pt-2 overflow-y-hidden">
      <div className="space-y-1">
        {sortedSessions.map((session) => (
          <SessionListItem
            key={session.id}
            id={session.id}
            title={session.title}
            active={session.id === activeId}
            disabled={disabled}
            onSwitch={onSessionSwitch}
          />
        ))}
      </div>
    </ScrollArea>
  );
};
