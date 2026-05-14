import { useAudioPlayerActions } from "@/contexts/audio-player-context";
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
} from "@/components/ui/alert-dialog";
import { AudioLines, ListMusic, ListPlus, ListX, Play, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Playlist = () => {
  const {
    playing,
    playlist,
    currentIndex,
    addToPlaylist,
    removeFromPlaylist,
    clearPlaylist,
    playAt,
  } = useAudioPlayerActions();

  const [playlistInput, setPlaylistInput] = useState("");
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const handleAddToPlaylist = () => {
    const value = playlistInput.trim();
    if (!value) return;

    addToPlaylist(value);
    setPlaylistInput("");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex flex-row gap-2 rounded-md">
        <Input
          placeholder="Add to playlist..."
          value={playlistInput}
          onChange={(e) => setPlaylistInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddToPlaylist();
          }}
          className="rounded-md text-sm"
        />

        <Button
          size="icon"
          variant="outline"
          onClick={handleAddToPlaylist}
          disabled={!playlistInput.trim()}
          className="text-muted-foreground hover:text-primary"
        >
          <ListPlus />
        </Button>

        <Button
          size="icon"
          variant="outline"
          onClick={() => setClearDialogOpen(true)}
          disabled={playlist.length === 0}
          className="text-muted-foreground hover:text-destructive"
        >
          <ListX />
        </Button>
      </div>

      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear playlist?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all tracks from your queue. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                clearPlaylist();
                setClearDialogOpen(false);
              }}
            >
              Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {playlist.length === 0 ? (
        <div
          className={cn(
            "flex h-full flex-1 flex-col items-center justify-center",
            "gap-2 rounded-2xl bg-background/40 p-2 text-center text-sm text-muted-foreground",
          )}
        >
          <ListMusic />
          <p className="max-w-xs text-xs">
            Paste a YouTube URL above to add tracks to your queue.
          </p>
        </div>
      ) : (
        <ScrollArea
          className="min-h-0 flex-1 bg-card/35 p-2 border rounded-md"
          scrollbar={false}
        >
          <div className="space-y-2">
            {playlist.map((item, i) => (
              <PlaylistItem
                key={`${item.url}-${i}`}
                item={item}
                index={i}
                isActive={i === currentIndex}
                isPlaying={playing}
                onPlay={() => playAt(i)}
                onRemove={() => removeFromPlaylist(i)}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

type PlaylistItemData = {
  url: string;
  title?: string;
  author?: string;
};

type PlaylistItemProps = {
  item: PlaylistItemData;
  index: number;
  isActive: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  onRemove: () => void;
};

const PlaylistItem = ({
  item,
  index,
  isActive,
  isPlaying,
  onPlay,
  onRemove,
}: PlaylistItemProps) => {
  return (
    <div
      className={cn(
        "group flex cursor-pointer items-center gap-3 rounded-md p-2 transition-all",
        isActive
          ? "border border-primary/50 bg-primary/10 text-primary ring-primary/20"
          : "bg-card/40 hover:bg-primary/5",
      )}
      onClick={onPlay}
    >
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-background/90 shadow-sm">
        {isActive && isPlaying ? (
          <AudioLines className="animate-pulse" size={14} />
        ) : isActive ? (
          <Play size={14} />
        ) : (
          <span className="text-xs text-muted-foreground">{index + 1}</span>
        )}
      </span>

      <div className="min-w-0 flex-1 space-y-1">
        {item.title ? (
          <>
            <p
              className="truncate text-sm font-medium leading-snug"
              title={item.title}
            >
              {item.title}
            </p>
            <p className="truncate text-xs leading-snug text-muted-foreground">
              {item.author || "Unknown artist"}
            </p>
          </>
        ) : (
          <>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </>
        )}
      </div>

      <Button
        size="icon"
        variant="ghost"
        className="rounded-full opacity-0 transition-opacity group-hover:opacity-70 hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        aria-label={`Remove ${item.title || item.url} from playlist`}
      >
        <X size={12} />
      </Button>
    </div>
  );
};
