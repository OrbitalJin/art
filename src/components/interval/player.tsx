import type React from "react";
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

type PlayerVariant = "default" | "floating";

interface Props {
  variant?: PlayerVariant;
}

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return "0:00";

  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);

  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const Player: React.FC<Props> = ({ variant = "default" }) => {
  if (variant === "floating") {
    return <FloatingPlayer />;
  }

  return <DefaultPlayer />;
};

const FloatingPlayer: React.FC = () => {
  const {
    item,
    loop,
    toggleLoop,
    playing,
    volume,
    muted,
    error,
    togglePlay,
    toggleMute,
    playlist,
    currentIndex,
    playNext,
    playPrevious,
  } = useAudioPlayerActions();

  const hasTrack = Boolean(item?.url);
  const thumbnailUrl = getYoutubeThumbnail(item?.url || "");

  return (
    <div className="w-full max-w-sm overflow-hidden rounded-md border p-2">
      <div className="flex min-w-0 items-start gap-3">
        <div className="size-21 shrink-0 overflow-hidden rounded-xl bg-muted shadow-md">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={item?.title || "Track artwork"}
              className="size-full object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <Music className="size-5 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="min-w-0">
            <p
              className="truncate text-sm font-medium text-foreground"
              title={item?.title || "Nothing playing"}
            >
              {item?.title || "Nothing playing"}
            </p>

            <p
              className="truncate text-xs text-muted-foreground"
              title={item?.author || "Add a track from the queue"}
            >
              {item?.author || "Add a track from the queue"}
            </p>
          </div>

          <div className="mt-3 flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground rounded-full"
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
              className="rounded-full opacity-80"
            >
              {playing ? <Pause /> : <Play />}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground rounded-full"
              disabled={currentIndex < 0 || currentIndex >= playlist.length - 1}
              onClick={playNext}
            >
              <SkipForward className="size-4" />
            </Button>

            <div className="ml-auto flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="size-8 rounded-full text-muted-foreground hover:text-foreground"
                onClick={toggleMute}
                disabled={!hasTrack}
                aria-label={muted || volume === 0 ? "Unmute" : "Mute"}
              >
                {muted || volume === 0 ? (
                  <VolumeX className="size-4" />
                ) : (
                  <Volume2 className="size-4" />
                )}
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "size-8 rounded-full text-muted-foreground hover:text-foreground",
                  loop && "text-primary",
                )}
                onClick={toggleLoop}
                aria-label="Toggle loop"
              >
                <Repeat2 className="size-4" />
              </Button>
            </div>
          </div>

          {error && (
            <div
              className="mt-3 rounded-lg border border-destructive/20 bg-destructive/10 px-2 py-1 text-xs text-destructive"
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

const DefaultPlayer: React.FC = () => {
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
    <div className="rounded-md border bg-card/35 p-2">
      <div className="flex min-w-0 items-center gap-2">
        <div className="size-21 overflow-hidden rounded-lg bg-muted shadow-md">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={item?.title || "Track artwork"}
              className="size-full object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <Music className="size-6 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <div className="min-w-0">
            <p className="truncate" title={item?.title || "Nothing playing"}>
              {item?.title || "Nothing playing"}
            </p>

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
                className="size-8 rounded-full opacity-80 hover:opacity-100"
                disabled={currentIndex <= 0}
                onClick={playPrevious}
                aria-label="Play previous track"
              >
                <SkipBack className="size-4" />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                onClick={togglePlay}
                disabled={!hasTrack}
                className="size-9 rounded-full opacity-80 hover:opacity-100"
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? (
                  <Pause className="size-4" />
                ) : (
                  <Play className="size-4" />
                )}
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className="size-8 rounded-full opacity-80 hover:opacity-100"
                disabled={
                  currentIndex < 0 || currentIndex >= playlist.length - 1
                }
                onClick={playNext}
                aria-label="Play next track"
              >
                <SkipForward className="size-4" />
              </Button>
            </div>

            <PlayerProgress />

            <div className="flex min-w-[20%] items-center gap-1.5">
              <Button
                size="icon"
                variant="ghost"
                className="size-6 shrink-0 rounded-full"
                onClick={toggleMute}
                disabled={!hasTrack}
                aria-label={muted || volume === 0 ? "Unmute" : "Mute"}
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
                "size-8 rounded-full opacity-80 hover:opacity-100",
                loop && "text-primary",
              )}
              onClick={toggleLoop}
              aria-label="Toggle loop"
            >
              <Repeat2 className="size-4" />
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

const PlayerProgress: React.FC = () => {
  const { playedSeconds, progress, duration } = useAudioPlayerTimer();

  return (
    <div className="flex flex-1 items-center gap-2">
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
