import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useStreamingState } from "@/hooks/use-streaming-state";
import { useSessionStore } from "@/lib/store/use-session-store";
import { cn } from "@/lib/utils";
import { Split } from "lucide-react";

export const ForkSession = () => {
  const activeId = useSessionStore((state) => state.activeId);
  const fork = useSessionStore((state) => state.fork);
  const { isCurrentSessionStreaming } = useStreamingState();

  const handleFork = () => {
    if (activeId && !isCurrentSessionStreaming) {
      fork(activeId);
    }
  };

  return (
    <HoverCard openDelay={300} closeDelay={150}>
      <HoverCardTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          disabled={isCurrentSessionStreaming}
          onClick={handleFork}
          aria-label="Fork session"
        >
          <Split
            className={cn(
              "h-4 w-4 transition-all text-muted-foreground",
              !isCurrentSessionStreaming && "hover:text-primary",
            )}
          />
        </Button>
      </HoverCardTrigger>

      <HoverCardContent
        align="center"
        side="bottom"
        className="w-72 p-0 shadow-xl border-muted-foreground/20 overflow-hidden"
      >
        <div className="flex items-center justify-between border-b bg-muted/30 p-3">
          <p className="text-sm font-medium">Fork Session</p>
          <span className="text-[10px] px-1.5 py-0.5 rounded border bg-background text-muted-foreground">
            New Branch
          </span>
        </div>

        <div className="p-3">
          <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
            Create a duplicate of this conversation from the current point.
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
