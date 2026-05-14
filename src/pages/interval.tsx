import { Player } from "@/components/interval/player";
import { Playlist } from "@/components/interval/playlist";

export const Interval = () => {
  return (
    <div className="grid h-full flex-1 grid-cols-2 grid-rows-2 gap-2">
      <div className="rounded-md border bg-card/50 shadow-sm">clock</div>

      <div className="flex flex-col gap-2 shadow-sm">
        <Player />
        <Playlist />
      </div>

      <div className="rounded-md border bg-card/50 shadow-sm">setup</div>
      <div className="rounded-md border bg-card/50 shadow-sm">scratchpad</div>
    </div>
  );
};
