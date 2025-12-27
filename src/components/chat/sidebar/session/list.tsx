import { useSessionStore } from "@/lib/ai/store/use-session-store";
import { SessionListItem } from "./item";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
  onSessionSwitch?: () => void;
}

export const SessionList: React.FC<Props> = ({ onSessionSwitch }) => {
  const activeId = useSessionStore((s) => s.activeId);
  const sessions = useSessionStore((s) =>
    s.sessions.sort((a, b) => a.updatedAt - b.updatedAt),
  );

  return (
    <ScrollArea className="flex-1 px-2 pt-2 overflow-y-hidden">
      <div className="space-y-1">
        {sessions.map((session) => (
          <SessionListItem
            key={session.id}
            id={session.id}
            title={session.title}
            active={session.id === activeId}
            onSwitch={onSessionSwitch}
          />
        ))}
      </div>
    </ScrollArea>
  );
};
