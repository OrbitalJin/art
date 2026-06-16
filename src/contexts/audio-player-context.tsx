import {
  createContext,
  useContext,
  useEffect,
  useMemo,
} from "react";
import ReactPlayer from "react-player";
import { useIntervalStore } from "@/lib/store/use-interval-store";
import { useAudioMetadata } from "@/hooks/use-audio-metadata";

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

export type AudioPlayerContextValue = AudioPlayerState & AudioPlayerActions;

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
  const loop = useIntervalStore((state) => state.loop);
  const muted = useIntervalStore((state) => state.muted);
  const volume = useIntervalStore((state) => state.volume);
  const storeUrls = useIntervalStore((state) => state.playlist);
  const currentIndex = useIntervalStore((state) => state.currentIndex);
  const playing = useIntervalStore((state) => state.playing);
  const error = useIntervalStore((state) => state.error);
  const playedSeconds = useIntervalStore((state) => state.playedSeconds);
  const duration = useIntervalStore((state) => state.duration);

  const metadata = useAudioMetadata(storeUrls);

  const setVolume = useIntervalStore((state) => state.setVolume);
  const setCurrentIndex = useIntervalStore((state) => state.setCurrentIndex);
  const setPlayedSeconds = useIntervalStore((state) => state.setPlayedSeconds);
  const setDuration = useIntervalStore((state) => state.setDuration);
  const setError = useIntervalStore((state) => state.setError);
  const togglePlay = useIntervalStore((state) => state.togglePlay);
  const toggleMute = useIntervalStore((state) => state.toggleMute);
  const toggleLoop = useIntervalStore((state) => state.toggleLoop);
  const addToPlaylist = useIntervalStore((state) => state.addToPlaylist);
  const removeFromPlaylist = useIntervalStore((state) => state.removeFromPlaylist);
  const clearPlaylist = useIntervalStore((state) => state.clearPlaylist);
  const playAt = useIntervalStore((state) => state.playAt);
  const playNext = useIntervalStore((state) => state.playNext);
  const playPrevious = useIntervalStore((state) => state.playPrevious);

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
