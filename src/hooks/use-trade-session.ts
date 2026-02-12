import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { open as openFile } from "@tauri-apps/plugin-fs";
import { toast } from "sonner";

import { useSessionStore } from "@/lib/store/use-session-store";
import type { Session } from "@/lib/store/session/types";

export const useTradeSession = () => {
  const sessions = useSessionStore((state) => state.sessions);
  const activeId = useSessionStore((state) => state.activeId);
  const importFn = useSessionStore((state) => state.importFn);

  const exportCurrentSession = () => {
    if (!activeId) return;
    exportSession(activeId);
  };

  const exportSession = (id: string) => {
    const session = sessions.find((s) => s.id === id);
    if (!session) {
      return toast.error("Session not found");
    }

    try {
      const jsonData = JSON.stringify(session);

      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `art_session_${id}.json`;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Session exported successfully");
    } catch {
      toast.error("Failed to export session");
    }
  };

  const importSession = async () => {
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

      const session = JSON.parse(content) as Session;
      importFn(session);
      toast.success("Session imported successfully");
    } catch {
      toast.error("Failed to import session data");
    }
  };

  return {
    exportCurrentSession,
    exportSession,
    importSession,
  };
};
