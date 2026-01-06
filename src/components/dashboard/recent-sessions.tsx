import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSessionStore } from "@/lib/store/use-session-store";
import { useNavigate } from "react-router-dom";

interface RecentSessionsProps {
  maxSessions?: number;
}

export function RecentSessions({ maxSessions = 3 }: RecentSessionsProps) {
  const navigate = useNavigate();
  const sessions = useSessionStore((state) => state.sessions);
  const setActive = useSessionStore((state) => state.setActive);

  const recentSessions = sessions.slice(0, maxSessions);

  const handleResumeSession = (sessionId: string) => {
    setActive(sessionId);
    navigate("/chat");
  };

  return (
    <div className="bg-card rounded-xl border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          Recent Sessions
        </h2>
        <Badge variant="secondary" className="text-xs">
          {sessions.length} total
        </Badge>
      </div>

      {recentSessions.length > 0 ? (
        <div className="space-y-3">
          {recentSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer group"
              onClick={() => handleResumeSession(session.id)}
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                  {session.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {session.messages.length} messages
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Open
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No conversations yet</p>
          <p className="text-sm">Start your first chat to see it here</p>
        </div>
      )}
    </div>
  );
}
