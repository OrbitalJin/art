import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import ReactPlayer from "react-player";
import { toast } from "sonner";
import { useIntervalsStore } from "@/lib/store/use-intervals-store";

interface PlaylistItem {
  url: string;
  title: string;
  author: string;
}

interface AudioPlayerState {
  item: PlaylistItem | null;
  playing: boolean;
  volume: number;
  muted: boolean;
  progress: number;
  playedSeconds: number;
  duration: number;
  error: string | null;
  playlist: PlaylistItem[];
  currentIndex: number;
}

interface AudioPlayerActions {
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  addToPlaylist: (url: string) => void;
  removeFromPlaylist: (index: number) => void;
  clearPlaylist: () => void;
  playAt: (index: number) => void;
  playNext: () => void;
  playPrevious: () => void;
}

type AudioPlayerContextValue = AudioPlayerState & AudioPlayerActions;

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);

const isYoutubeUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname.includes("youtube.com") ||
      parsed.hostname.includes("youtu.be")
    );
  } catch {
    return false;
  }
};

const fetchYoutubeMetadata = async (url: string) => {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(oembedUrl);
    if (!res.ok) throw new Error("Failed to fetch metadata");
    const data = await res.json();
    return { title: data.title as string, author: data.author_name as string };
  } catch {
    return { title: "", author: "" };
  }
};

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const storeUrls = useIntervalsStore((state) => state.playlist);
  const [metadata, setMetadata] = useState<
    Record<string, { title: string; author: string }>
  >({});

  const playlist = useMemo(
    () =>
      storeUrls.map((url) => ({
        url,
        ...(metadata[url] ?? { title: "", author: "" }),
      })),
    [storeUrls, metadata],
  );

  const item =
    currentIndex >= 0 && currentIndex < playlist.length
      ? playlist[currentIndex]
      : null;

  useEffect(() => {
    if (playlist.length > 0 && currentIndex === -1) {
      setCurrentIndex(0);
    } else if (playlist.length === 0 && currentIndex >= 0) {
      setCurrentIndex(-1);
    }
  }, [currentIndex, playlist]);

  useEffect(() => {
    const uncached = storeUrls.filter((url) => !metadata[url]);
    for (const url of uncached) {
      fetchYoutubeMetadata(url).then((meta) => {
        setMetadata((prev) => ({ ...prev, [url]: meta }));
      });
    }
  }, [storeUrls, metadata]);

  const togglePlay = useCallback(() => {
    setPlaying((p) => !p);
    setError(null);
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => !m);
  }, []);

  const addToPlaylist = useCallback(
    (url: string) => {
      if (!isYoutubeUrl(url)) {
        toast.error("Please enter a valid YouTube URL");
        return;
      }

      const store = useIntervalsStore.getState();
      store.addToPlaylist(url);

      if (currentIndex === -1) {
        setCurrentIndex(store.playlist.length - 1);
        setPlaying(true);
      }
    },
    [currentIndex],
  );

  const removeFromPlaylist = useCallback(
    (index: number) => {
      const store = useIntervalsStore.getState();
      const url = store.playlist[index];
      if (!url) return;

      store.removeFromPlaylist(url);

      if (index === currentIndex) {
        setPlaying(false);
        setCurrentIndex(-1);
      } else if (currentIndex > index) {
        setCurrentIndex((prev) => prev - 1);
      }
    },
    [currentIndex],
  );

  const clearPlaylist = useCallback(() => {
    useIntervalsStore.getState().clearPlaylist();
    setCurrentIndex(-1);
    setPlaying(false);
  }, []);

  const playAt = useCallback(
    (index: number) => {
      if (index < 0 || index >= playlist.length) return;
      setCurrentIndex(index);
      setPlayedSeconds(0);
      setPlaying(true);
    },
    [playlist.length],
  );

  const playNext = useCallback(() => {
    if (currentIndex < 0 || currentIndex >= playlist.length - 1) {
      setPlaying(false);
      return;
    }
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setPlayedSeconds(0);
  }, [currentIndex, playlist]);

  const playPrevious = useCallback(() => {
    if (currentIndex <= 0) return;
    const prevIndex = currentIndex - 1;
    setCurrentIndex(prevIndex);
    setPlayedSeconds(0);
  }, [currentIndex]);

  const progress = duration > 0 ? (playedSeconds / duration) * 100 : 0;

  const value = useMemo(
    () => ({
      item,
      playing,
      volume,
      muted,
      progress,
      playedSeconds,
      duration,
      error,
      togglePlay,
      setVolume,
      toggleMute,
      playlist,
      currentIndex,
      addToPlaylist,
      removeFromPlaylist,
      clearPlaylist,
      playAt,
      playNext,
      playPrevious,
    }),
    [
      item,
      playing,
      volume,
      muted,
      progress,
      playedSeconds,
      duration,
      error,
      togglePlay,
      toggleMute,
      playlist,
      currentIndex,
      addToPlaylist,
      removeFromPlaylist,
      clearPlaylist,
      playAt,
      playNext,
      playPrevious,
    ],
  );

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
      <div className="fixed">
        <ReactPlayer
          src={item?.url}
          playing={playing}
          volume={volume}
          muted={muted}
          width={0}
          height={0}
          style={{ minWidth: 0, minHeight: 0 }}
          onTimeUpdate={(e) => setPlayedSeconds(e.currentTarget.currentTime)}
          onDurationChange={(e) => setDuration(e.currentTarget.duration)}
          onError={() => setError("Playback error")}
          onEnded={() => {
            if (currentIndex >= 0 && currentIndex < playlist.length - 1) {
              playNext();
            } else {
              setPlaying(false);
            }
          }}
        />
      </div>
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error("useAudioPlayer must be used within AudioPlayerProvider");
  }
  return context;
};
