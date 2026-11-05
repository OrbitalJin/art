import { useIntervalStore } from "@/lib/store/use-interval-store";
import { usePlaylist } from "@/hooks/use-playlist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AudioLines, ListPlus, ListX, Play, X } from "lucide-react";
import { memo, useState } from "react";
import { cn } from "@/lib/utils";

const extractVideoId = (url: string): string => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1).split("?")[0];
    }
    return parsed.searchParams.get("v") ?? "";
  } catch {
    return "";
  }
};

const ClearQueueButton: React.FC = () => {
  const clearPlaylist = useIntervalStore((state) => state.clearPlaylist);
  const [open, setOpen] = useState(false);

  const buttonClassName = cn(
    "size-8 shrink-0 rounded-full border-border/40 bg-background/40",
    "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
  );

  const handleClear = () => {
    clearPlaylist();
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className={buttonClassName}
          aria-label="Clear playlist"
        >
          <ListX className="size-4" />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Clear the queue?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleClear}>
            Clear
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const AddTrackBar: React.FC<{ hasTracks: boolean }> = ({ hasTracks }) => {
  const addToPlaylist = useIntervalStore((state) => state.addToPlaylist);
  const [value, setValue] = useState("");

  const trimmed = value.trim();

  const handleAdd = () => {
    if (!trimmed) return;

    addToPlaylist(trimmed);
    setValue("");
  };

  const barClassName = cn(
    "flex items-center gap-2 border-b border-border/40 p-2",
  );

  const inputClassName = cn(
    "h-8 rounded-full border-border/40 bg-background/40 px-3 text-sm",
  );

  const addClassName = cn(
    "size-8 shrink-0 rounded-full border-border/40 bg-background/40",
    "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
  );

  return (
    <div className={barClassName}>
      <Input
        placeholder="Paste YouTube link..."
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") handleAdd();
        }}
        className={inputClassName}
      />

      <Button
        size="icon"
        variant="outline"
        className={addClassName}
        onClick={handleAdd}
        disabled={!trimmed}
        aria-label="Add to queue"
      >
        <ListPlus className="size-4" />
      </Button>

      {hasTracks && <ClearQueueButton />}
    </div>
  );
};

const QueueLabel: React.FC<{ count: number }> = ({ count }) => {
  const labelClassName = cn(
    "flex items-center justify-between px-2 pb-1 pt-2",
    "text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60",
  );

  return (
    <p className={labelClassName}>
      <span>Queue</span>
      <span className="tabular-nums">{count}</span>
    </p>
  );
};

const QueueEmpty: React.FC = () => {
  const badgeClassName = cn(
    "flex size-10 items-center justify-center rounded-full",
    "bg-muted/50 ring-1 ring-inset ring-foreground/5",
  );

  return (
    <div className="flex flex-col items-center gap-2 py-8">
      <span className={badgeClassName}>
        <AudioLines
          strokeWidth={1.5}
          className="size-5 text-muted-foreground/50"
        />
      </span>
      <div className="flex flex-col items-center gap-0.5">
        <p className="text-xs text-muted-foreground">Queue is empty</p>
        <p className="text-[10px] text-muted-foreground/50">
          Paste a YouTube link above to add a track
        </p>
      </div>
    </div>
  );
};

const Thumbnail: React.FC<{
  url: string;
  title: string;
  isPlaying: boolean;
}> = ({ url, title, isPlaying }) => {
  const [loaded, setLoaded] = useState(false);

  const frameClassName = cn(
    "relative size-9 shrink-0 overflow-hidden rounded-lg bg-muted",
    "ring-1 ring-inset ring-foreground/10",
  );

  const imageClassName = cn(
    "size-full object-cover transition-opacity duration-200",
    loaded ? "opacity-100" : "opacity-0",
  );

  const overlayClassName = cn(
    "absolute inset-0 flex items-center justify-center bg-black/40",
  );

  return (
    <div className={frameClassName}>
      {!loaded && <Skeleton className="absolute inset-0 rounded-none" />}

      <img
        src={url}
        alt={title || "Track thumbnail"}
        className={imageClassName}
        onLoad={() => setLoaded(true)}
      />

      {isPlaying && (
        <div className={overlayClassName}>
          <AudioLines className="size-3.5 animate-pulse text-white drop-shadow-md motion-reduce:animate-none" />
        </div>
      )}
    </div>
  );
};

const ItemAction: React.FC<{
  label: string;
  destructive?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ label, destructive = false, onClick, children }) => {
  const actionClassName = cn(
    "size-7 rounded-full text-muted-foreground opacity-0 transition-opacity duration-150",
    "group-hover:opacity-100 group-focus-within:opacity-100",
    "hover:bg-accent/60",
    destructive
      ? "hover:bg-destructive/10 hover:text-destructive"
      : "hover:text-foreground",
  );

  return (
    <Button
      size="icon"
      variant="ghost"
      className={actionClassName}
      onClick={onClick}
      aria-label={label}
    >
      {children}
    </Button>
  );
};

interface PlaylistItemProps {
  item: { url: string; title: string; author: string };
  index: number;
  isActive: boolean;
  isPlaying: boolean;
  onPlay: (index: number) => void;
  onRemove: (index: number) => void;
}

const PlaylistItem = memo<PlaylistItemProps>(
  ({ item, index, isActive, isPlaying, onPlay, onRemove }) => {
    const thumbnailUrl = `https://img.youtube.com/vi/${extractVideoId(item.url)}/default.jpg`;

    const rowClassName = cn(
      "group relative flex items-center gap-2.5 rounded-xl p-2",
      "transition-colors duration-150 hover:bg-accent/40",
      isActive && "bg-accent/50",
    );

    const indicatorClassName = cn(
      "absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2",
      "rounded-r-full bg-primary",
    );

    const titleClassName = cn(
      "truncate text-xs font-medium transition-colors duration-150",
      isActive ? "text-foreground" : "text-foreground/70",
    );

    return (
      <div className={rowClassName}>
        {isActive && <span aria-hidden className={indicatorClassName} />}

        <Thumbnail
          url={thumbnailUrl}
          title={item.title}
          isPlaying={isPlaying}
        />

        <div className="min-w-0 flex-1">
          <p className={titleClassName}>{item.title || "Untitled"}</p>
          {item.author && (
            <p className="truncate text-[10px] text-muted-foreground/60">
              {item.author}
            </p>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          {!isPlaying && (
            <ItemAction label="Play track" onClick={() => onPlay(index)}>
              <Play className="size-3 fill-current" />
            </ItemAction>
          )}

          <ItemAction
            label="Remove track"
            destructive
            onClick={() => onRemove(index)}
          >
            <X className="size-3" />
          </ItemAction>
        </div>
      </div>
    );
  },
);

export const Playlist = () => {
  const playing = useIntervalStore((state) => state.playing);
  const currentIndex = useIntervalStore((state) => state.currentIndex);
  const playlist = usePlaylist();

  const removeFromPlaylist = useIntervalStore(
    (state) => state.removeFromPlaylist,
  );
  const playAt = useIntervalStore((state) => state.playAt);

  const hasTracks = playlist.length > 0;

  return (
    <div className="flex h-full flex-col border-t border-border/40 bg-card/50">
      <AddTrackBar hasTracks={hasTracks} />

      <ScrollArea className="min-h-0 flex-1 p-2">
        {hasTracks && <QueueLabel count={playlist.length} />}

        <div className="flex flex-col gap-0.5">
          {playlist.map((item, index) => (
            <PlaylistItem
              key={item.url}
              item={item}
              index={index}
              isActive={currentIndex === index}
              isPlaying={playing && currentIndex === index}
              onPlay={playAt}
              onRemove={removeFromPlaylist}
            />
          ))}
        </div>

        {!hasTracks && <QueueEmpty />}
      </ScrollArea>
    </div>
  );
};
