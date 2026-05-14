import { Memo } from "@/components/interval/memo";
import { Player } from "@/components/interval/player";
import { Playlist } from "@/components/interval/playlist";
import { cn } from "@/lib/utils";

export const Interval = () => {
  return (
    <div className="grid h-full flex-1 grid-cols-2 grid-rows-2 gap-2">
      <div className="rounded-md border bg-card/50 shadow-sm">clock</div>

      <div className="flex flex-col gap-2 shadow-sm">
        <Player />
        <Playlist />
      </div>

      <div className="rounded-md border bg-card/50 shadow-sm">setup</div>

      <div
        className={cn(
          "rounded-md border bg-card/50 transition-all",
          "shadow-sm min-h-0 overflow-y-scroll",
          "focus-within:border-primary/50 focus-within:border-2",
        )}
      >
        <Memo />
      </div>
    </div>
  );
};
