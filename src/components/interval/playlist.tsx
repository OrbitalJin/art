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
import { AudioLines, ListPlus, ListX, X } from "lucide-react";
import { memo, useState } from "react";
import { cn } from "@/lib/utils";

export const Playlist = () => {
  const playing = useIntervalStore((state) => state.playing);
  const currentIndex = useIntervalStore((state) => state.currentIndex);
  const playlist = usePlaylist();

  const addToPlaylist = useIntervalStore((state) => state.addToPlaylist);
  const removeFromPlaylist = useIntervalStore(
    (state) => state.removeFromPlaylist,
  );
  const clearPlaylist = useIntervalStore((state) => state.clearPlaylist);
  const playAt = useIntervalStore((state) => state.playAt);

  const [playlistInput, setPlaylistInput] = useState("");
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const handleAddToPlaylist = () => {
    const value = playlistInput.trim();
    if (!value) return;

    addToPlaylist(value);
    setPlaylistInput("");
  };

  return (
    <div className="flex flex-col bg-card/50 h-full border-t">
      <div className="flex">
        <div className="flex flex-row gap-2 flex-1 border-b p-2">
          <Input
            placeholder="Paste YouTube link..."
            value={playlistInput}
            onChange={(e) => setPlaylistInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddToPlaylist();
              }
            }}
            className="h-8 text-sm"
          />

          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 shrink-0"
            onClick={handleAddToPlaylist}
            disabled={!playlistInput.trim()}
            aria-label="Add to queue"
          >
            <ListPlus className="size-4" />
          </Button>

          {playlist.length > 0 && (
            <AlertDialog
              open={clearDialogOpen}
              onOpenChange={setClearDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 shrink-0"
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
          )}
        </div>
      </div>

      <ScrollArea className="h-full p-2">
        <div className="space-y-1 h-full">
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

          {playlist.length === 0 && (
            <div className="flex items-center justify-center flex-col gap-2 py-7 text-muted-foreground">
              <AudioLines className="size-6" />
              <p className="text-xs">Queue is empty</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
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
    const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
    const thumbnailUrl = `https://img.youtube.com/vi/${extractVideoId(item.url)}/default.jpg`;

    return (
      <div
        className={cn(
          "group relative flex items-center rounded-md p-2 transition-colors hover:bg-muted/50",
          isActive && "bg-muted/80",
        )}
      >
        <div className="relative size-8 shrink-0 overflow-hidden rounded bg-muted">
          {thumbnailUrl && !thumbnailLoaded && (
            <Skeleton className="size-full rounded-none" />
          )}

          <img
            src={thumbnailUrl}
            alt={item.title || "Track thumbnail"}
            className={cn(
              "size-full object-cover",
              thumbnailLoaded ? "opacity-100" : "opacity-0",
            )}
            onLoad={() => setThumbnailLoaded(true)}
          />

          {isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <AudioLines className="size-3.5 text-white drop-shadow-md" />
            </div>
          )}
        </div>

        <div className="ml-2 min-w-0 flex-1">
          <p
            className={cn(
              "truncate text-xs font-medium",
              isActive ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {item.title || "Untitled"}
          </p>
          {item.author && (
            <p className="truncate text-[10px] text-muted-foreground/60">
              {item.author}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          {!isPlaying && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground"
              onClick={() => onPlay(index)}
              aria-label="Play track"
            ></Button>
          )}

          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(index)}
            aria-label="Remove track"
          >
            <X className="size-3" />
          </Button>
        </div>
      </div>
    );
  },
);

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
