import { useMemo, useRef } from "react";
import { Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CaptureComposer } from "@/components/capture/capture-composer";
import { CaptureRow } from "@/components/capture/capture-row";
import { StaticSidebar } from "@/components/capture/sidebar/static";
import { FloatingSidebar } from "@/components/capture/sidebar/floating";
import { useCaptureStore } from "@/lib/store/use-capture-store";
import { useUIStateStore } from "@/lib/store/use-ui-state-store";
import { cn } from "@/lib/utils";

const FILTER_LABELS: Record<string, string> = {
  all: "All captures",
  starred: "Starred",
  unstarred: "Unstarred",
  text: "Text",
  link: "Links",
};

const EMPTY_FILTER_LABEL: Record<string, string> = {
  starred: "No starred captures",
  unstarred: "No unstarred captures",
  text: "No text captures",
  link: "No links captured",
};

export const Capture = () => {
  const captures = useCaptureStore((state) => state.captures);

  const captureState = useUIStateStore((state) => state.captureState);
  const setCaptureState = useUIStateStore((state) => state.setCaptureState);

  const composerRef = useRef<HTMLTextAreaElement>(null);

  const { search, filter } = captureState;

  const isOpen = captureState.sidebarOpen;
  const setIsOpen = (open: boolean) => {
    setCaptureState({ sidebarOpen: open });
  };

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return captures.filter((capture) => {
      if (filter === "starred" && !capture.starred) return false;
      if (filter === "unstarred" && capture.starred) return false;
      if ((filter === "text" || filter === "link") && capture.kind !== filter)
        return false;
      if (!query) return true;
      return (
        capture.title.toLowerCase().includes(query) ||
        capture.content.toLowerCase().includes(query)
      );
    });
  }, [captures, search, filter]);

  const sorted = useMemo(
    () => [...visible].sort((a, b) => b.createdAt - a.createdAt),
    [visible],
  );

  const hasActiveFilters = search.trim().length > 0 || filter !== "all";
  const resetFilters = () => setCaptureState({ search: "", filter: "all" });

  const focusComposer = () => composerRef.current?.focus();

  const showListHeader = sorted.length > 0;
  const filterLabel = FILTER_LABELS[filter] ?? "Captures";

  return (
    <div className="flex-1 flex flex-row">
      <StaticSidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onNewCapture={focusComposer}
      />
      <FloatingSidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onNewCapture={focusComposer}
      />

      <div className="flex-1 flex flex-col p-2 mx-auto max-w-3xl min-w-0 overflow-hidden">
        <ScrollArea className="flex-1 overflow-y-scroll">
          <div
            className={cn("flex flex-col gap-2", sorted.length > 0 && "pb-1")}
          >
            {showListHeader && (
              <div className="flex items-center justify-between px-2 pt-1 pb-0.5">
                <span className="text-xs text-muted-foreground/60">
                  {search.trim()
                    ? `Search · ${sorted.length} result${sorted.length !== 1 ? "s" : ""}`
                    : `${filterLabel} · ${sorted.length}`}
                </span>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto px-2 py-0.5 text-[11px] font-normal text-muted-foreground/50 hover:text-foreground"
                    onClick={resetFilters}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}

            {sorted.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
                <div className="mb-2 flex size-14 items-center justify-center rounded-2xl border border-border/40 bg-muted/20">
                  <Inbox className="size-6 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {captures.length === 0
                    ? "Nothing captured yet"
                    : (EMPTY_FILTER_LABEL[filter] ??
                      "No captures match your search")}
                </p>
                {captures.length === 0 ? (
                  <p className="max-w-xs text-xs text-muted-foreground/60">
                    Paste or drop screenshots, links, and notes in the composer
                    above, or press{" "}
                    <kbd className="rounded-sm border border-border/40 bg-muted/50 px-1 py-0.5 text-[10px] font-medium">
                      Ctrl
                    </kbd>
                    <span className="mx-0.5">+</span>
                    <kbd className="rounded-sm border border-border/40 bg-muted/50 px-1 py-0.5 text-[10px] font-medium">
                      Shift
                    </kbd>
                    <span className="mx-0.5">+</span>
                    <kbd className="rounded-sm border border-border/40 bg-muted/50 px-1 py-0.5 text-[10px] font-medium">
                      C
                    </kbd>{" "}
                    anywhere in the app.
                  </p>
                ) : (
                  hasActiveFilters && (
                    <Button variant="link" size="sm" onClick={resetFilters}>
                      Clear search and filters
                    </Button>
                  )
                )}
              </div>
            ) : (
              <div
                className={cn("flex flex-col", sorted.length > 1 && "gap-1")}
              >
                {sorted.map((capture) => (
                  <CaptureRow key={capture.id} capture={capture} />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
        <CaptureComposer source="/capture" contentRef={composerRef} />
      </div>
    </div>
  );
};
