import {
  useAudioPlayerActions,
  useAudioPlayerTimer,
} from "@/contexts/audio-player-context";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { cn, getYoutubeThumbnail } from "@/lib/utils";
import {
  Music,
  Pause,
  Play,
  Repeat2,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "../ui/button";

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return "0:00";

  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);

  return `${m}:${s.toString().padStart(2, "0")}`;
};

const PlayerProgress = () => {
  const { playedSeconds, progress, duration } = useAudioPlayerTimer();

  return (
    <div className="flex min-w-[180px] flex-1 items-center gap-2">
      <span className="w-9 shrink-0 text-right text-[10px] tabular-nums text-muted-foreground">
        {formatTime(playedSeconds)}
      </span>

      <Progress value={progress} className="h-1.5 flex-1 rounded-full" />

      <span className="w-9 shrink-0 text-[10px] tabular-nums text-muted-foreground">
        {formatTime(duration)}
      </span>
    </div>
  );
};

export const Player = () => {
  const {
    item,
    loop,
    toggleLoop,
    playing,
    volume,
    muted,
    error,
    togglePlay,
    setVolume,
    toggleMute,
    playlist,
    currentIndex,
    playNext,
    playPrevious,
  } = useAudioPlayerActions();

  const hasTrack = Boolean(item?.url);
  const thumbnailUrl = getYoutubeThumbnail(item?.url || "");

  return (
    <div className="rounded-md bg-muted/35 p-2 shadow-inner border">
      <div className="flex min-w-0 items-center gap-2">
        <div className="size-21 overflow-hidden rounded-lg bg-muted shadow-md">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              className="size-full object-cover hover:scale-110 transition-transform"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <Music className="size-6 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <p title={item?.title || "Nothing playing"}>
                {item?.title || "Nothing playing"}
              </p>
            </div>

            <p
              className="truncate text-sm text-muted-foreground"
              title={item?.author || "Add a track from the queue"}
            >
              {item?.author || "Add a track from the queue"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="scale-80 rounded-full opacity-80 hover:opacity-100"
                disabled={currentIndex <= 0}
                onClick={playPrevious}
              >
                <SkipBack />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                onClick={togglePlay}
                disabled={!hasTrack}
                className="opacity-80 hover:opacity-100"
              >
                {playing ? <Pause /> : <Play />}
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className="scale-80 rounded-full opacity-80 hover:opacity-100"
                disabled={
                  currentIndex < 0 || currentIndex >= playlist.length - 1
                }
                onClick={playNext}
                aria-label="Play next track"
              >
                <SkipForward />
              </Button>
            </div>

            <PlayerProgress />

            <div className="flex min-w-[120px] items-center gap-1.5">
              <Button
                size="icon"
                variant="ghost"
                className="size-6 shrink-0 rounded-full"
                onClick={toggleMute}
                disabled={!hasTrack}
              >
                {muted || volume === 0 ? (
                  <VolumeX className="size-3.5" />
                ) : (
                  <Volume2 className="size-3.5" />
                )}
              </Button>

              <Slider
                min={0}
                max={1}
                step={0.05}
                value={[volume]}
                onValueChange={([v]) => setVolume(v)}
                disabled={!hasTrack}
              />
            </div>
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "scale-80 rounded-full opacity-80 hover:opacity-100",
                loop && "text-primary",
              )}
              onClick={toggleLoop}
              aria-label="Play next track"
            >
              <Repeat2 />
            </Button>
          </div>
          {error && (
            <div
              className="rounded-xl border border-destructive/20 bg-destructive/10 px-2.5 py-1.5 text-xs text-destructive shadow-sm"
              role="alert"
            >
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
