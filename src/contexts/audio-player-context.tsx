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
import { isYoutubeUrl, useAudioMetadata } from "@/hooks/use-audio-metadata";

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
  loop: boolean;
  error: string | null;
  playlist: PlaylistItem[];
  currentIndex: number;
}

interface AudioPlayerActions {
  toggleLoop: () => void;
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

interface AudioTimerState {
  playedSeconds: number;
  progress: number;
  duration: number;
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);
const AudioTimerContext = createContext<AudioTimerState | null>(null);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  const loop = useIntervalsStore((state) => state.loop);
  const muted = useIntervalsStore((state) => state.muted);
  const volume = useIntervalsStore((state) => state.volume);
  const storeUrls = useIntervalsStore((state) => state.playlist);
  const currentIndex = useIntervalsStore((state) => state.currentIndex);

  const metadata = useAudioMetadata(storeUrls);

  const setLoop = useIntervalsStore((state) => state.setLoop);
  const setMuted = useIntervalsStore((state) => state.setMuted);
  const setVolume = useIntervalsStore((state) => state.setVolume);
  const setCurrentIndex = useIntervalsStore((state) => state.setCurrentIndex);
  const _addToPlaylist = useIntervalsStore((state) => state.addToPlaylist);
  const _clearPlaylist = useIntervalsStore((state) => state.clearPlaylist);
  const _removeFromPlaylist = useIntervalsStore(
    (state) => state.removeFromPlaylist,
  );

  const toggleLoop = useCallback(() => {
    setLoop(!loop);
  }, [loop, setLoop]);

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

  const togglePlay = useCallback(() => {
    setPlaying(!playing);
    setError(null);
  }, [playing, setPlaying]);

  const toggleMute = useCallback(() => {
    setMuted(!muted);
  }, [setMuted, muted]);

  const addToPlaylist = useCallback(
    (url: string) => {
      if (!isYoutubeUrl(url)) {
        toast.error("Please enter a valid YouTube URL");
        return;
      }

      _addToPlaylist(url);

      if (currentIndex === -1) {
        setCurrentIndex(playlist.length - 1);
        setPlaying(true);
      }
    },
    [currentIndex, setCurrentIndex, playlist, _addToPlaylist],
  );

  const removeFromPlaylist = useCallback(
    (index: number) => {
      const store = useIntervalsStore.getState();
      const url = store.playlist[index];
      if (!url) return;

      _removeFromPlaylist(url);

      if (index === currentIndex) {
        setPlaying(false);
        setCurrentIndex(-1);
      } else if (currentIndex > index) {
        setCurrentIndex(currentIndex - 1);
      }
    },
    [currentIndex, setCurrentIndex, _removeFromPlaylist],
  );

  const clearPlaylist = useCallback(() => {
    _clearPlaylist();
    setCurrentIndex(-1);
    setPlaying(false);
  }, [setCurrentIndex, _clearPlaylist]);

  const playAt = useCallback(
    (index: number) => {
      if (index < 0 || index >= playlist.length) return;
      setCurrentIndex(index);
      setPlayedSeconds(0);
      setPlaying(true);
    },
    [playlist.length, setCurrentIndex],
  );

  const playNext = useCallback(() => {
    if (currentIndex < 0 || currentIndex >= playlist.length - 1) {
      setPlaying(false);
      return;
    }
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setPlayedSeconds(0);
  }, [currentIndex, playlist, setPlaying, setCurrentIndex]);

  const playPrevious = useCallback(() => {
    if (currentIndex <= 0) return;
    const prevIndex = currentIndex - 1;
    setCurrentIndex(prevIndex);
    setPlayedSeconds(0);
  }, [currentIndex, setCurrentIndex]);

  const progress = duration > 0 ? (playedSeconds / duration) * 100 : 0;

  const actionsValue = useMemo(
    () => ({
      item,
      playing,
      volume,
      muted,
      loop,
      error,
      togglePlay,
      setVolume,
      toggleMute,
      playlist,
      currentIndex,
      addToPlaylist,
      removeFromPlaylist,
      clearPlaylist,
      toggleLoop,
      playAt,
      playNext,
      playPrevious,
    }),
    [
      item,
      playing,
      volume,
      muted,
      loop,
      error,
      togglePlay,
      toggleMute,
      setVolume,
      playlist,
      currentIndex,
      addToPlaylist,
      removeFromPlaylist,
      clearPlaylist,
      toggleLoop,
      playAt,
      playNext,
      playPrevious,
    ],
  );

  const timerValue = useMemo(
    () => ({
      playedSeconds,
      progress,
      duration,
    }),
    [playedSeconds, progress, duration],
  );

  useEffect(() => {
    if (playlist.length > 0 && currentIndex === -1) {
      setCurrentIndex(0);
    } else if (playlist.length === 0 && currentIndex >= 0) {
      setCurrentIndex(-1);
    }
  }, [currentIndex, playlist, setCurrentIndex]);

  return (
    <AudioPlayerContext.Provider value={actionsValue}>
      <AudioTimerContext.Provider value={timerValue}>
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
              if (loop) {
                setPlayedSeconds(0);
              } else if (
                currentIndex >= 0 &&
                currentIndex < playlist.length - 1
              ) {
                playNext();
              } else {
                setPlayedSeconds(0);
                setCurrentIndex(0);
              }
            }}
          />
        </div>
      </AudioTimerContext.Provider>
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const actions = useContext(AudioPlayerContext);
  const timer = useContext(AudioTimerContext);
  if (!actions || !timer) {
    throw new Error("useAudioPlayer must be used within AudioPlayerProvider");
  }
  return { ...actions, ...timer };
};

export const useAudioPlayerActions = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error(
      "useAudioPlayerActions must be used within AudioPlayerProvider",
    );
  }
  return context;
};

export const useAudioPlayerTimer = () => {
  const context = useContext(AudioTimerContext);
  if (!context) {
    throw new Error(
      "useAudioPlayerTimer must be used within AudioPlayerProvider",
    );
  }
  return context;
};
