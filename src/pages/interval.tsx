import { Memo } from "@/components/interval/memo";
import { Player } from "@/components/interval/player";
import { Playlist } from "@/components/interval/playlist";
import { Timer } from "@/components/interval/timer";
import { cn } from "@/lib/utils";

export const Interval = () => {
  return (
    <div className="grid h-full flex-1 grid-cols-1 grid-rows-2 gap-2 lg:grid-cols-2">
      <Timer className="lg:row-span-2" />
      <Memo
        className={cn(
          "flex-1 rounded-md border bg-card/50 transition-all",
          "min-h-0 overflow-y-scroll shadow-sm",
          "focus-within:border-primary/50 focus-within:border-2",
        )}
      />
      <div className="hidden flex-col gap-2 shadow-sm lg:flex">
        <Player variant="default" />
        <Playlist />
      </div>
    </div>
  );
};
