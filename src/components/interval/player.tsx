import type React from "react";
import { useIntervalStore } from "@/lib/store/use-interval-store";
import { useCurrentItem, usePlaylist, useProgress } from "@/hooks/use-playlist";
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

interface ControlButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
}

const ControlButton: React.FC<ControlButtonProps> = ({
  label,
  onClick,
  disabled = false,
  active = false,
  children,
}) => {
  const buttonClassName = cn(
    "size-8 shrink-0 rounded-full text-muted-foreground transition-colors duration-150",
    "hover:bg-accent/60 hover:text-foreground",
    active &&
      "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
  );

  return (
    <Button
      size="icon"
      variant="ghost"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={buttonClassName}
    >
      {children}
    </Button>
  );
};

const PlayButton: React.FC = () => {
  const item = useCurrentItem();
  const playing = useIntervalStore((state) => state.playing);
  const togglePlay = useIntervalStore((state) => state.togglePlay);

  const hasTrack = Boolean(item?.url);

  const buttonClassName = cn(
    "size-9 shrink-0 rounded-full bg-foreground/90 text-background",
    "transition-colors duration-150 hover:bg-foreground hover:text-background",
    "disabled:opacity-30",
  );

  return (
    <Button
      size="icon"
      variant="ghost"
      aria-label={playing ? "Pause" : "Play"}
      disabled={!hasTrack}
      onClick={togglePlay}
      className={buttonClassName}
    >
      {playing ? (
        <Pause className="size-4 fill-current" />
      ) : (
        <Play className="size-4 fill-current" />
      )}
    </Button>
  );
};

const TransportControls: React.FC = () => {
  const playlist = usePlaylist();
  const currentIndex = useIntervalStore((state) => state.currentIndex);
  const playNext = useIntervalStore((state) => state.playNext);
  const playPrevious = useIntervalStore((state) => state.playPrevious);

  const noPrevious = currentIndex <= 0;
  const noNext = currentIndex < 0 || currentIndex >= playlist.length - 1;

  return (
    <div className="flex items-center gap-1">
      <ControlButton
        label="Play previous track"
        disabled={noPrevious}
        onClick={playPrevious}
      >
        <SkipBack className="size-4" />
      </ControlButton>

      <PlayButton />

      <ControlButton
        label="Play next track"
        disabled={noNext}
        onClick={playNext}
      >
        <SkipForward className="size-4" />
      </ControlButton>
    </div>
  );
};

const VolumeToggle: React.FC = () => {
  const item = useCurrentItem();
  const volume = useIntervalStore((state) => state.volume);
  const muted = useIntervalStore((state) => state.muted);
  const toggleMute = useIntervalStore((state) => state.toggleMute);

  const hasTrack = Boolean(item?.url);
  const silent = muted || volume === 0;

  return (
    <ControlButton
      label={silent ? "Unmute" : "Mute"}
      disabled={!hasTrack}
      onClick={toggleMute}
    >
      {silent ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
    </ControlButton>
  );
};

const LoopButton: React.FC = () => {
  const loop = useIntervalStore((state) => state.loop);
  const toggleLoop = useIntervalStore((state) => state.toggleLoop);

  return (
    <ControlButton label="Toggle loop" active={loop} onClick={toggleLoop}>
      <Repeat2 className="size-4" />
    </ControlButton>
  );
};

const VolumeSlider: React.FC = () => {
  const item = useCurrentItem();
  const volume = useIntervalStore((state) => state.volume);
  const setVolume = useIntervalStore((state) => state.setVolume);

  const hasTrack = Boolean(item?.url);

  return (
    <Slider
      min={0}
      max={1}
      step={0.05}
      value={[volume]}
      onValueChange={([v]) => setVolume(v)}
      disabled={!hasTrack}
    />
  );
};

const Artwork: React.FC = () => {
  const item = useCurrentItem();
  const playing = useIntervalStore((state) => state.playing);

  const thumbnailUrl = getYoutubeThumbnail(item?.url || "");

  const frameClassName = cn(
    "size-21 shrink-0 overflow-hidden rounded-xl bg-muted shadow-md",
    "ring-1 ring-inset transition-shadow duration-300",
    playing ? "ring-primary/40" : "ring-foreground/10",
  );

  const imageClassName = cn(
    "size-full object-cover transition-transform duration-300 hover:scale-105",
  );

  return (
    <div className={frameClassName}>
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt={item?.title || "Track artwork"}
          className={imageClassName}
        />
      ) : (
        <div className="flex size-full items-center justify-center">
          <Music
            strokeWidth={1.75}
            className="size-6 text-muted-foreground/60"
          />
        </div>
      )}
    </div>
  );
};

const TrackInfo: React.FC = () => {
  const item = useCurrentItem();

  const title = item?.title || "Nothing playing";
  const author = item?.author || "Add a track from the queue";

  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-medium text-foreground" title={title}>
        {title}
      </p>
      <p className="truncate text-xs text-muted-foreground" title={author}>
        {author}
      </p>
    </div>
  );
};

const PlayerError: React.FC = () => {
  const error = useIntervalStore((state) => state.error);

  if (!error) return null;

  const errorClassName = cn(
    "rounded-xl border border-destructive/20 bg-destructive/10",
    "px-2.5 py-1.5 text-xs text-destructive",
  );

  return (
    <div className={errorClassName} role="alert">
      {error}
    </div>
  );
};

const PlayerProgress: React.FC = () => {
  const playedSeconds = useIntervalStore((state) => state.playedSeconds);
  const duration = useIntervalStore((state) => state.duration);
  const progress = useProgress();

  const timeClassName = cn(
    "w-9 shrink-0 text-[10px] tabular-nums text-muted-foreground/70",
  );

  return (
    <div className="flex flex-1 items-center gap-2">
      <span className={cn(timeClassName, "text-right")}>
        {formatTime(playedSeconds)}
      </span>

      <Progress value={progress} className="h-1 flex-1 rounded-full" />

      <span className={timeClassName}>{formatTime(duration)}</span>
    </div>
  );
};

const FloatingPlayer: React.FC = () => {
  const surfaceClassName = cn(
    "flex w-full max-w-sm flex-col gap-3 overflow-hidden rounded-2xl p-3",
    "border border-border/40 bg-card/70 backdrop-blur-2xl",
    "shadow-xl shadow-black/15 ring-1 ring-inset ring-foreground/5",
  );

  return (
    <div className={surfaceClassName}>
      <div className="flex min-w-0 items-start gap-3">
        <Artwork />

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <TrackInfo />

          <div className="flex items-center gap-1">
            <TransportControls />

            <div className="ml-auto flex items-center gap-0.5">
              <VolumeToggle />
              <LoopButton />
            </div>
          </div>
        </div>
      </div>

      <PlayerProgress />
      <PlayerError />
    </div>
  );
};

const DefaultPlayer: React.FC = () => (
  <div className="bg-card/50 p-4">
    <div className="flex min-w-0 items-center gap-3">
      <Artwork />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <TrackInfo />

        <div className="flex flex-wrap items-center gap-2">
          <TransportControls />

          <PlayerProgress />

          <div className="flex min-w-[20%] items-center gap-1.5">
            <VolumeToggle />
            <VolumeSlider />
          </div>

          <LoopButton />
        </div>

        <PlayerError />
      </div>
    </div>
  </div>
);

export const Player: React.FC<Props> = ({ variant = "default" }) => {
  if (variant === "floating") return <FloatingPlayer />;

  return <DefaultPlayer />;
};
