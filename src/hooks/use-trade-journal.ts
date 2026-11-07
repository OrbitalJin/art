import { toast } from "sonner";
import { useJournalIndex } from "@/lib/store/journal/index-store";
import { journalContentStore } from "@/lib/store/journal/content-store";

export const useTradeJournal = () => {
  const exportPage = async (id: string) => {
    const page = useJournalIndex.getState().getPage(id);
    if (!page) {
      toast.error("Page not found");
      return;
    }

    try {
      const content = await journalContentStore.getState().ensure(id);
      const jsonData = JSON.stringify({ ...page, content });

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

  return { exportPage };
};
