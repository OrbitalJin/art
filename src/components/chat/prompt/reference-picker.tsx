import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useStreamingState } from "@/hooks/use-streaming-state";
import { useJournalStore } from "@/lib/store/use-journal-store";
import { useSessionStore } from "@/lib/store/use-session-store";
import { cn, formatDateAsAgo } from "@/lib/utils";
import { Asterisk, Search } from "lucide-react";
import { useState } from "react";

export const ReferencePicker = () => {
  const activeId = useSessionStore((state) => state.activeId);
  const sessions = useSessionStore((state) => state.sessions);
  const addNoteRef = useSessionStore((state) => state.addJournalRef);
  const removeNoteRef = useSessionStore((state) => state.removeJournalRef);
  const clearNoteRefs = useSessionStore((state) => state.clearJournalRefs);

  const pages = useJournalStore((state) => state.pages);

  const [query, setQuery] = useState<string>("");

  const { isCurrentSessionStreaming: disabled } = useStreamingState();

  const withinRefs = (sessionId: string, noteId: string) => {
    if (!activeId) return false;
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return false;
    return session.journalRefs.includes(noteId);
  };

  const selectePages = pages.filter((page) => withinRefs(activeId!, page.id));

  const recentPages = pages
    .sort((a, b) => b.lastViewedAt - a.lastViewedAt)
    .slice(0, 3);

  const filtered = !query
    ? Array.from(new Set([...selectePages, ...recentPages]))
    : pages.filter((pages) =>
        pages.title.toLowerCase().includes(query.toLowerCase()),
      );

  const handleToggleRef = (noteId: string) => {
    if (activeId) {
      if (withinRefs(activeId, noteId)) {
        removeNoteRef(activeId, noteId);
      } else {
        addNoteRef(activeId, noteId);
      }
    }
  };

  const handleClearRefs = () => {
    if (activeId) {
      clearNoteRefs(activeId);
    }
  };

  if (!activeId) {
    return null;
  }

  return (
    <DropdownMenu key={activeId}>
      <DropdownMenuTrigger disabled={disabled}>
        <Tooltip>
          <TooltipTrigger asChild disabled={disabled}>
            <Button variant="outline" size="icon" className="relative">
              <Asterisk className="text-muted-foreground" />
              {pages.some((e) => withinRefs(activeId, e.id)) && (
                <span
                  className="
                  absolute -top-1 -right-1 h-4 min-w-4 rounded-full 
                  bg-primary px-1 text-[10px] text-primary-foreground 
                  flex items-center justify-center"
                >
                  {selectePages.length}
                </span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>References</TooltipContent>
        </Tooltip>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0 shadow-xl border-muted-foreground/20">
        <div className="flex flex-col gap-1 border-b bg-muted/30 p-3">
          <p className="text-sm font-medium">Pages to reference</p>
          <p className="text-[11px] text-muted-foreground leading-tight">
            These pages will be referenced during the session.
          </p>
        </div>

        <div className="p-2 border-b">
          <div className="flex items-center gap-2 p-2 rounded-md border">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              placeholder="Search journal..."
              className="bg-transparent outline-none flex-1 text-sm"
            />
          </div>
        </div>

        <div className="flex flex-col p-2 gap-1">
          {filtered.length === 0 && (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              {query ? (
                <div className="space-y-1">
                  <p>No pages found</p>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={() => setQuery("")}
                  >
                    Clear search
                  </Button>
                </div>
              ) : (
                "No pages available"
              )}
            </div>
          )}
          {filtered.map((page) => {
            const isSelected = withinRefs(activeId, page.id);

            return (
              <div
                key={page.id}
                onClick={() => handleToggleRef(page.id)}
                className={cn(
                  "flex flex-col p-2 gap-2 cursor-pointer rounded-sm transition-all duration-200 group",
                  isSelected
                    ? "bg-primary/5 text-primary-foreground ring-1 ring-primary/20"
                    : "hover:bg-accent/20 hover:text-accent-foreground",
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <p
                    className={cn(
                      "text-sm font-medium truncate",
                      isSelected ? "text-primary" : "text-foreground",
                    )}
                  >
                    {page.title}
                  </p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] py-0 h-5 font-normal opacity-60 group-hover:opacity-100 transition-opacity",
                      isSelected &&
                        "opacity-100 border-primary/30 text-primary",
                    )}
                  >
                    {page.workspace}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-muted-foreground/70">
                    {formatDateAsAgo(page.lastViewedAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between p-2 border-t bg-muted/10">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8 text-muted-foreground hover:text-destructive"
            onClick={handleClearRefs}
            disabled={selectePages.length === 0}
          >
            Clear selection
          </Button>
          <p className="text-[10px] text-muted-foreground px-2">
            {filtered.filter((e) => withinRefs(activeId, e.id)).length} selected
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
