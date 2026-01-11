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
import { useNoteStore } from "@/lib/store/use-note-store";
import { useSessionStore } from "@/lib/store/use-session-store";
import { cn, formatDateAsAgo } from "@/lib/utils";
import { BookPlus, Check, Search } from "lucide-react";
import { useState } from "react";

export const ContextPicker = () => {
  const activeId = useSessionStore((state) => state.activeId);
  const sessions = useSessionStore((state) => state.sessions);
  const addContextNote = useSessionStore((state) => state.addContextNote);
  const removeContextNote = useSessionStore((state) => state.removeContextNote);
  const clearContextNotes = useSessionStore((state) => state.clearContextNotes);

  const entries = useNoteStore((state) => state.entries);

  const [query, setQuery] = useState<string>("");

  const withinContext = (sessionId: string, noteId: string) => {
    if (!activeId) return false;
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return false;
    return session.contextNotes.includes(noteId);
  };

  const selecteNotes = entries.filter((entry) =>
    withinContext(activeId!, entry.id),
  );

  const recentNotes = entries
    .sort((a, b) => b.lastViewedAt - a.lastViewedAt)
    .slice(0, 3);

  const filtered = !query
    ? Array.from(new Set([...selecteNotes, ...recentNotes]))
    : entries.filter((entry) =>
        entry.title.toLowerCase().includes(query.toLowerCase()),
      );

  const handleToggleContextNote = (noteId: string) => {
    if (activeId) {
      if (withinContext(activeId, noteId)) {
        removeContextNote(activeId, noteId);
      } else {
        addContextNote(activeId, noteId);
      }
    }
  };

  const handleClearContextNote = () => {
    if (activeId) {
      clearContextNotes(activeId);
    }
  };

  if (!activeId) {
    return null;
  }

  return (
    <DropdownMenu key={activeId}>
      <DropdownMenuTrigger>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <BookPlus className="h-4 w-4" />
              {entries.some((e) => withinContext(activeId, e.id)) && (
                <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-primary" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add context</TooltipContent>
        </Tooltip>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0 shadow-xl border-muted-foreground/20">
        <div className="flex flex-col gap-1 border-b bg-muted/30 p-3">
          <p className="text-sm font-medium">Contextual Notes</p>
          <p className="text-[11px] text-muted-foreground leading-tight">
            These notes will be referenced during your session.
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

        <div className="flex flex-col p-2 gap-2">
          {filtered.map((entry) => {
            const isSelected = withinContext(activeId, entry.id);

            return (
              <div
                key={entry.id}
                onClick={() => handleToggleContextNote(entry.id)}
                className={cn(
                  "flex flex-col p-2 gap-2 cursor-pointer rounded-sm transition-all duration-200 group",
                  "hover:ring-1 hover:ring-primary/20",
                  isSelected
                    ? "bg-primary/5 text-primary-foreground ring-1 ring-primary/20"
                    : "hover:bg-accent/50 hover:text-accent-foreground",
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <p
                    className={cn(
                      "text-sm font-medium truncate",
                      isSelected ? "text-primary" : "text-foreground",
                    )}
                  >
                    {entry.title}
                  </p>
                  {isSelected ? (
                    <div
                      className={cn(
                        "flex items-center justify-center h-5 w-5",
                        "rounded-full bg-primary text-primary-foreground",
                        "animate-in zoom-in-75 duration-200",
                      )}
                    >
                      <Check className="h-3 w-3" />
                    </div>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-[10px] py-0 h-5 font-normal opacity-60 group-hover:opacity-100"
                    >
                      {entry.workspace}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-muted-foreground/70">
                    {formatDateAsAgo(entry.lastViewedAt)}
                  </p>
                  {isSelected && (
                    <span className="text-[10px] font-semibold text-primary/70 uppercase tracking-tighter">
                      In Context
                    </span>
                  )}
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
            onClick={handleClearContextNote}
          >
            Clear selection
          </Button>
          <p className="text-[10px] text-muted-foreground px-2">
            {filtered.filter((e) => withinContext(activeId, e.id)).length}{" "}
            selected
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
