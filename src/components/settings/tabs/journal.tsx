import { Button } from "@/components/ui/button";
import { useTradeJournal } from "@/hooks/use-trade-journal";
import { Download, FileText, Search, Upload } from "lucide-react";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const JournalSettingsTab = () => {
  const { sortedPages, exportPage, exportAllPages, importPage } =
    useTradeJournal();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  return (
    <>
      <div className="max-w-3xl">
        <h3 className="text-lg font-medium">Journal Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your journal data.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm max-w-3xl">
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-base font-medium">Journal</p>
            <p className="text-sm text-muted-foreground">
              Export notes or import from a file.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <ExportJournalDialog
              pages={sortedPages}
              onExport={exportPage}
              formatDate={formatDate}
            />
            <Button
              variant="outline"
              onClick={exportAllPages}
              disabled={sortedPages.length === 0}
            >
              <Upload className="h-4 w-4 mr-2" />
              Export All
            </Button>
            <Button variant="outline" onClick={importPage}>
              <Download className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

interface ExportJournalDialogProps {
  pages: Array<{ id: string; title: string; lastViewedAt: number }>;
  onExport: (id: string) => void;
  formatDate: (timestamp: number) => string;
}

function ExportJournalDialog({
  pages,
  onExport,
  formatDate,
}: ExportJournalDialogProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = !query
    ? pages
    : pages.filter((page) =>
        page.title.toLowerCase().includes(query.toLowerCase()),
      );

  const handleExport = (id: string) => {
    onExport(id);
    setOpen(false);
    setQuery("");
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex-1">
          <FileText className="h-4 w-4 mr-2" />
          Export Note
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0 shadow-xl">
        <div className="flex flex-col gap-1 border-b bg-muted/30 p-3">
          <p className="text-sm font-medium">Export Note</p>
          <p className="text-[11px] text-muted-foreground leading-tight">
            Select a note to export. Notes are sorted by most recent first.
          </p>
        </div>

        <div className="p-2 border-b">
          <div className="flex items-center gap-2 p-2 rounded-md border">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              placeholder="Search notes..."
              className="bg-transparent outline-none flex-1 text-sm"
            />
          </div>
        </div>

        <div className="max-h-[300px] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {query ? "No notes found" : "No notes to export"}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((page) => (
                <button
                  key={page.id}
                  onClick={() => handleExport(page.id)}
                  className="w-full p-3 text-left hover:bg-accent/30 border rounded-md transition-colors"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{page.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(page.lastViewedAt)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
