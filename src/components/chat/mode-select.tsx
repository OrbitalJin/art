import { MODES, type ModeId } from "@/lib/llm/prompts/modes";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { useSessionStore } from "@/lib/store/use-session-store";
import { useStreamingState } from "@/hooks/use-streaming-state";
import { Check } from "lucide-react";

export const ModeSelect = () => {
  const { isCurrentSessionStreaming } = useStreamingState();
  const setMode = useSessionStore((store) => store.setMode);
  const session = useSessionStore((state) =>
    state.sessions.find((s) => s.id === state.activeId),
  );

  if (!session) {
    return null;
  }

  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30">
      <HoverCard openDelay={300} closeDelay={150}>
        <HoverCardTrigger asChild>
          <div>
            <Tabs
              value={session.mode}
              onValueChange={(mode) => {
                setMode(session.id, mode as ModeId);
              }}
            >
              <TabsList className="backdrop-blur-xl bg-card/50 border border-border/50 transition-all">
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
        <HoverCardContent
          align="center"
          side="bottom"
          className="w-72 p-0 shadow-xl border-muted-foreground/20"
        >
          <div className="flex flex-col gap-1 border-b bg-muted/30 p-3">
            <p className="text-sm font-medium">Modes</p>
          </div>

          <div className="flex flex-col p-2 gap-1">
            {Object.values(MODES).map((mode) => {
              const isSelected = mode.id === session.mode;

              return (
                <div
                  key={mode.id}
                  className={`flex flex-col p-2.5 gap-0.5 rounded-md transition-all duration-200 group ${
                    isSelected ? "bg-primary/5 ring-1 ring-primary/20" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium ${
                        isSelected ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {mode.label}
                    </span>
                    {isSelected && (
                      <div className="flex items-center justify-center h-4 w-4 rounded-full bg-primary text-primary-foreground animate-in zoom-in-75 duration-200">
                        <Check className="h-2.5 w-2.5" />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground/80 leading-normal">
                    {mode.description}
                  </p>
                </div>
              );
            })}
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};
