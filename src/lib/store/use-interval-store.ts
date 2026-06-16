import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { intervalsStore } from "./interval/adapter";
import { toast } from "sonner";
import { isYoutubeUrl } from "@/hooks/use-audio-metadata";

interface PlayerState {
  currentIndex: number;
  playlist: string[];
  muted: boolean;
  volume: number;
  loop: boolean;
  playing: boolean;
  error: string | null;
  playedSeconds: number;
  duration: number;

  setVolume: (volume: number) => void;
  setMuted: (state: boolean) => void;
  setCurrentIndex: (index: number) => void;
  setLoop: (state: boolean) => void;
  setPlaying: (state: boolean) => void;
  setError: (error: string | null) => void;
  setPlayedSeconds: (seconds: number) => void;
  setDuration: (duration: number) => void;
  togglePlay: () => void;
  toggleMute: () => void;
  toggleLoop: () => void;
  addToPlaylist: (url: string) => void;
  removeFromPlaylist: (index: number) => void;
  clearPlaylist: () => void;
  playNext: () => void;
  playPrevious: () => void;
  playAt: (index: number) => void;
}

interface MemoState extends PlayerState {
  memoContent: string;
  setMemoContent: (content: string) => void;
}

interface IntervalState extends MemoState {
  sessionCount: number;
  focusTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  fullscreen: boolean;

  setFullscreen: (state: boolean) => void;
  setSessionCount: (count: number) => void;
  setFocusTime: (time: number) => void;
  setShortBreakTime: (time: number) => void;
  setLongBreakTime: (time: number) => void;
}

export const useIntervalStore = create<IntervalState>()(
  persist(
    (set, get) => ({
      sessionCount: 4,
      focusTime: 25,
      shortBreakTime: 5,
      longBreakTime: 15,

      volume: 0.5,
      currentIndex: 0,
      muted: false,
      loop: false,
      playing: false,
      error: null,
      playedSeconds: 0,
      duration: 0,
      fullscreen: false,

      playlist: ["https://youtu.be/8ugK6BCZzyY?si=wcd5O2Or7W0eMK0Q"],
      memoContent: "",

      setFullscreen: (state: boolean) => {
        set(() => ({
          fullscreen: state,
        }));
      },

      setSessionCount: (count: number) => {
        set(() => ({
          sessionCount: Math.max(1, Math.min(count, 30)),
        }));
      },

      setFocusTime: (time: number) => {
        set(() => ({
          focusTime: Math.max(5, Math.min(time, 60)),
        }));
      },

      setShortBreakTime: (time: number) => {
        set(() => ({
          shortBreakTime: Math.max(5, Math.min(time, 60)),
        }));
      },

      setLongBreakTime: (time: number) => {
        set(() => ({
          longBreakTime: Math.max(5, Math.min(time, 60)),
        }));
      },

      setVolume: (volume: number) => {
        set(() => ({
          volume: Math.max(0, Math.min(volume, 1)),
        }));
      },

      setCurrentIndex: (index: number) => {
        set(() => ({
          currentIndex: index,
        }));
      },

      addToPlaylist: (url: string) => {
        if (!isYoutubeUrl(url)) {
          toast.error("Please enter a valid YouTube URL");
          return;
        }
        const state = get();
        const found = state.playlist.find((u) => u === url);
        if (found) return;
        const newPlaylist = [...state.playlist, url];
        set({
          playlist: newPlaylist,
          ...(state.currentIndex === -1
            ? { currentIndex: state.playlist.length, playing: true, playedSeconds: 0 }
            : {}),
        });
      },
      removeFromPlaylist: (index: number) => {
        const state = get();
        const url = state.playlist[index];
        if (!url) return;
        const newPlaylist = state.playlist.filter((u) => u !== url);
        const { currentIndex } = state;
        set({
          playlist: newPlaylist,
          currentIndex:
            index === currentIndex
              ? -1
              : currentIndex > index
                ? currentIndex - 1
                : currentIndex,
          playing: index === currentIndex ? false : state.playing,
        });
      },

      clearPlaylist: () => {
        set({
          playlist: [],
          currentIndex: -1,
          playing: false,
        });
      },

      setMuted: (state: boolean) => {
        set(() => ({
          muted: state,
        }));
      },

      setLoop: (state: boolean) => {
        set(() => ({
          loop: state,
        }));
      },

      setPlaying: (state: boolean) => {
        set({ playing: state });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      setPlayedSeconds: (seconds: number) => {
        set({ playedSeconds: seconds });
      },

      setDuration: (duration: number) => {
        set({ duration });
      },

      togglePlay: () => {
        set((state) => ({ playing: !state.playing, error: null }));
      },

      toggleMute: () => {
        set((state) => ({ muted: !state.muted }));
      },

      toggleLoop: () => {
        set((state) => ({ loop: !state.loop }));
      },

      playNext: () => {
        const { currentIndex, playlist } = get();
        if (currentIndex < 0 || currentIndex >= playlist.length - 1) {
          set({ playing: false });
          return;
        }
        set({ currentIndex: currentIndex + 1, playedSeconds: 0 });
      },

      playPrevious: () => {
        const { currentIndex } = get();
        if (currentIndex <= 0) return;
        set({ currentIndex: currentIndex - 1, playedSeconds: 0 });
      },

      playAt: (index: number) => {
        const { playlist } = get();
        if (index < 0 || index >= playlist.length) return;
        set({ currentIndex: index, playing: true, playedSeconds: 0 });
      },

      setMemoContent: (content: string) => {
        set(() => ({
          memoContent: content,
        }));
      },
    }),
    {
      name: "intervals-storage",
      version: 2,
      storage: createJSONStorage(() => intervalsStore),
      partialize: (state) => ({
        sessionCount: state.sessionCount,
        focusTime: state.focusTime,
        shortBreakTime: state.shortBreakTime,
        longBreakTime: state.longBreakTime,
        volume: state.volume,
        currentIndex: state.currentIndex,
        muted: state.muted,
        loop: state.loop,
        playlist: state.playlist,
        memoContent: state.memoContent,
        fullscreen: state.fullscreen,
      }),
    },
  ),
);
