import { BarChart3, TrendingUp, Activity } from "lucide-react";
import { useSessionStore } from "@/lib/ai/store/use-session-store";
import { useEffect, useState } from "react";

interface QuickStats {
  totalSessions: number;
  totalMessages: number;
  lastActive: string;
  activeToday: boolean;
}

export function DashboardStats() {
  const sessions = useSessionStore((state) => state.sessions);
  const [stats, setStats] = useState<QuickStats>({
    totalSessions: 0,
    totalMessages: 0,
    lastActive: "Never",
    activeToday: false,
  });

  useEffect(() => {
    const totalMessages = sessions.reduce((acc, session) => acc + session.messages.length, 0);
    const lastSession = sessions[0];
    const lastActiveTime = lastSession?.messages.length > 0 
      ? new Date(lastSession.messages[lastSession.messages.length - 1].id.substring(0, 8)).toLocaleDateString()
      : "Never";

    const activeToday = lastSession?.messages.some(msg => {
      const msgDate = new Date(msg.id.substring(0, 8));
      return msgDate.toDateString() === new Date().toDateString();
    }) || false;

    const newStats = {
      totalSessions: sessions.length,
      totalMessages,
      lastActive: lastActiveTime,
      activeToday,
    };

    setStats(newStats);
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
            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.totalMessages}</p>
            <p className="text-sm text-muted-foreground">Messages Sent</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
            <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">
              {stats.activeToday ? "Active" : "Idle"}
            </p>
            <p className="text-sm text-muted-foreground">Today</p>
          </div>
        </div>
      </div>
    </div>
  );
}