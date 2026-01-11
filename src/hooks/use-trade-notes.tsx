import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { open as openFile } from "@tauri-apps/plugin-fs";
import { toast } from "sonner";
import { useNoteStore } from "@/lib/store/use-note-store";
import type { Entry } from "@/lib/store/notes/types";

export const useTradeNote = () => {
  const sessions = useNoteStore((state) => state.entries);
  const activeId = useNoteStore((state) => state.activeId);
  const importFn = useNoteStore((state) => state.importFn);

  const exportCurrentNote = () => {
    if (!activeId) return;
    exportNote(activeId);
  };

  const exportNote = (id: string) => {
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
      link.download = `art_note_${id}.json`;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Entry exported successfully");
    } catch {
      toast.error("Failed to export entry");
    }
  };

  const importNote = async () => {
    try {
      const path = await openDialog({
        multiple: false,
        directory: false,
        filters: [{ name: "Note", extensions: ["json", "md"] }],
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

      const session = JSON.parse(content) as Entry;
      importFn(session);
      toast.success("Entry imported successfully");
    } catch {
      toast.error("Failed to import note data");
    }
  };

  return {
    exportCurrentNote,
    exportNote,
    importNote,
  };
};
