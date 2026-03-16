import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { open as openFile } from "@tauri-apps/plugin-fs";
import { toast } from "sonner";

import { useSessionStore } from "@/lib/store/use-session-store";
import type { Session } from "@/lib/store/session/types";

export const useTradeSession = () => {
  const sessions = useSessionStore((state) => state.sessions);
  const importFn = useSessionStore((state) => state.importFn);

  const sortedSessions = [...sessions].sort((a, b) => b.createdAt - a.createdAt);

  const exportSession = (id: string) => {
    const session = sessions.find((s) => s.id === id);
    if (!session) {
      return toast.error("Session not found");
    }

    try {
      const jsonData = JSON.stringify(session);
      downloadJson(jsonData, `art_session_${session.title.replace(/\s+/g, "_")}.json`);
      toast.success("Session exported successfully");
    } catch {
      toast.error("Failed to export session");
    }
  };

  const exportAllSessions = () => {
    if (sessions.length === 0) {
      return toast.error("No sessions to export");
    }

    try {
      const jsonData = JSON.stringify(sessions);
      downloadJson(jsonData, `art_sessions_${Date.now()}.json`);
      toast.success(`${sessions.length} sessions exported successfully`);
    } catch {
      toast.error("Failed to export sessions");
    }
  };

  const importSessions = async () => {
    try {
      const path = await openDialog({
        multiple: false,
        directory: false,
        filters: [{ name: "Session", extensions: ["json"] }],
      });

      if (!path) {
        return toast.error("No file provided");
      }
      const file = await openFile(path, {
        read: true,
      });
      const stat = await file.stat();
      const buffer = new Uint8Array(stat.size);
      await file.read(buffer);
      const content = new TextDecoder().decode(buffer);
      await file.close();

      const data = JSON.parse(content);

      if (Array.isArray(data)) {
        data.forEach((session) => importFn(session as Session));
        toast.success(`${data.length} sessions imported successfully`);
      } else {
        importFn(data as Session);
        toast.success("Session imported successfully");
      }
    } catch {
      toast.error("Failed to import session data");
    }
  };

  return {
    sortedSessions,
    exportSession,
    exportAllSessions,
    importSessions,
  };
};

function downloadJson(content: string, filename: string) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
