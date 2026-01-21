import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useStreamingState } from "@/hooks/use-streaming-state";
import { useSessionStore } from "@/lib/store/use-session-store";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";

export const SearchGrounding = () => {
  const { isCurrentSessionStreaming } = useStreamingState();
  const activeId = useSessionStore((state) => state.activeId);

  const toggleSearchGrounding = useSessionStore(
    (state) => state.toggleSearchGrounding,
  );
  const session = useSessionStore((state) =>
    state.sessions.find((s) => s.id === activeId),
  );
  const grounded = !!session?.searchGrounding;

  return (
    <HoverCard openDelay={300} closeDelay={150}>
      <HoverCardTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          disabled={isCurrentSessionStreaming}
          onClick={() => session && toggleSearchGrounding(session?.id)}
        >
          <Globe
            className={cn(
              "h-4 w-4 transition-all scale-90",
              grounded && "text-primary scale-110",
            )}
          />
        </Button>
      </HoverCardTrigger>

      <HoverCardContent
        align="center"
        side="bottom"
        className="w-72 p-0 shadow-xl border-muted-foreground/20 overflow-hidden"
      >
        <div
          className={cn(
            "flex flex-col gap-1 border-b p-3 transition-colors",
            grounded ? "bg-primary/5" : "bg-muted/30",
          )}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium flex items-center gap-2">
              Search Grounding
            </p>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.5 rounded border",
                grounded
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : "bg-muted border-border text-muted-foreground",
              )}
            >
              {grounded ? "Enabled" : "Disabled"}
            </span>
          </div>
        </div>

        <div className="flex flex-col p-3 gap-2">
          <div className="flex gap-2.5">
            <div className="flex flex-col gap-0.5">
              <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
                Allows the model to browse the internet to verify facts and
                provide up-to-date information beyond its training data.
              </p>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
