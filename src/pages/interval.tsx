import { Memo } from "@/components/interval/memo";
import { Player } from "@/components/interval/player";
import { Playlist } from "@/components/interval/playlist";
import { Timer } from "@/components/interval/timer";
import { useIntervalStore } from "@/lib/store/use-interval-store";
import { cn } from "@/lib/utils";

export const Interval = () => {
  const fullscreen = useIntervalStore((state) => state.fullscreen);
  const setFullScreen = useIntervalStore((state) => state.setFullscreen);
  return (
    <div
      className={cn(
        "grid h-full flex-1",
        fullscreen ? "grid-cols-1" : "grid-cols-1 grid-rows-2 lg:grid-cols-2",
      )}
    >
      <Timer
        className="lg:row-span-2"
        fullscreen={fullscreen}
        setFullscreen={setFullScreen}
      />
      {!fullscreen && (
        <div className="hidden flex-col shadow-sm lg:flex border-r">
          <Player variant="default" />
          <Playlist />
        </div>
      )}
      {!fullscreen && (
        <Memo
          className={cn(
            "flex-1 border-r border-b border-l rounded-bl-md lg:rounded-md-none lg:border-t bg-card/50 transition-all",
            "min-h-0 overflow-y-scroll h-full",
            "focus-within:border-primary/50 focus-within:border",
          )}
        />
      )}
    </div>
  );
};
