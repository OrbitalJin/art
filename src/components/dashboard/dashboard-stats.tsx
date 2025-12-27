import { useSessionStore } from "@/lib/ai/store/use-session-store";
import { BarChart3, MessagesSquare, Send, TrendingUp } from "lucide-react";
import { useMemo } from "react";

interface QuickStats {
  totalSessions: number;
  messagesSent: number;
  totalMessages: number;
}

export function DashboardStats() {
  const sessions = useSessionStore((state) => state.sessions);

  const stats = useMemo<QuickStats>(() => {
    const messagesSent = sessions.reduce(
      (acc, session) =>
        acc + session.messages.filter((m) => m.role === "user").length,
      0,
    );

    const totalMessages = sessions.reduce(
      (acc, session) => acc + session.messages.length,
      0,
    );

    return {
      totalSessions: sessions.length,
      totalMessages,
      messagesSent,
    };
  }, [sessions]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-card rounded-xl border p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.totalSessions}</p>
            <p className="text-sm text-muted-foreground">Total Sessions</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Send className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.messagesSent}</p>
            <p className="text-sm text-muted-foreground">Messages Sent</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
            <MessagesSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.totalMessages}</p>
            <p className="text-sm text-muted-foreground">Total Messages</p>
          </div>
        </div>
      </div>
    </div>
  );
}
