import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { open as openFile } from "@tauri-apps/plugin-fs";
import { toast } from "sonner";
import { useJournalStore } from "@/lib/store/use-journal-store";
import type { Page } from "@/lib/store/journal/types";

export const useTradeJournal = () => {
  const sessions = useJournalStore((state) => state.pages);
  const activeId = useJournalStore((state) => state.activeId);
  const importFn = useJournalStore((state) => state.importFn);

  const exportCurrentPage = () => {
    if (!activeId) return;
    exportPage(activeId);
  };

  const exportPage = (id: string) => {
    const session = sessions.find((s) => s.id === id);
    if (!session) {
      return toast.error("Page not found");
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
      toast.success("Page exported successfully");
    } catch {
      toast.error("Failed to export page");
    }
  };

  const importPage = async () => {
    try {
      const path = await openDialog({
        multiple: false,
        directory: false,
        filters: [{ name: "Page", extensions: ["json", "md"] }],
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

      const session = JSON.parse(content) as Page;
      importFn(session);
      toast.success("Page imported successfully");
    } catch {
      toast.error("Failed to import page data");
    }
  };

  return {
    exportCurrentPage,
    exportPage,
    importPage,
  };
};
