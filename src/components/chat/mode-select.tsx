import { MODES, type ModeId } from "@/lib/llm/prompts/modes";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { useSessionStore } from "@/lib/store/use-session-store";
import { useStreamingState } from "@/hooks/use-streaming-state";
import { cn } from "@/lib/utils";

export const ModeSelect = () => {
  const { isCurrentSessionStreaming } = useStreamingState();
  const setMode = useSessionStore((store) => store.setMode);
  const session = useSessionStore((state) =>
    state.sessions.find((s) => s.id === state.activeId),
  );

  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30">
      <HoverCard openDelay={300} closeDelay={150}>
        {/* ✅ Tabs are the hover trigger */}
        <HoverCardTrigger asChild>
          <div>
            <Tabs
              value={session?.mode}
              onValueChange={(mode) => {
                setMode(session!.id, mode as ModeId);
              }}
            >
              <TabsList className="backdrop-blur-xl opacity-70 hover:opacity-100 transition-all">
                {Object.values(MODES).map((mode) => (
                  <TabsTrigger
                    key={mode.id}
                    value={mode.id}
                    disabled={isCurrentSessionStreaming}
                  >
                    {mode.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </HoverCardTrigger>
        {/* ✅ Rich explanation panel */}
        <HoverCardContent
          align="center"
          side="bottom"
          className="w-80 text-sm space-y-4"
        >
          <div className="font-semibold">Modes</div>

          <div className="space-y-3">
            {Object.values(MODES).map((mode) => (
              <div key={mode.id} className={cn("space-y-1")}>
                <div className="font-medium">{mode.label}</div>
                <div className="text-muted-foreground">{mode.description}</div>
              </div>
            ))}
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};
