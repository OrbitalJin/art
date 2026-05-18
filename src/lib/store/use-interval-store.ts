import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { intervalsStore } from "./interval/adapter";

interface PlayerState {
  currentIndex: number;
  playlist: string[];
  muted: boolean;
  volume: number;
  loop: boolean;

  setVolume: (volume: number) => void;
  setMuted: (state: boolean) => void;
  setCurrentIndex: (index: number) => void;
  setLoop: (state: boolean) => void;
  addToPlaylist: (url: string) => void;
  removeFromPlaylist: (url: string) => void;
  clearPlaylist: () => void;
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

      playlist: ["https://youtu.be/8ugK6BCZzyY?si=wcd5O2Or7W0eMK0Q"],
      memoContent: "",

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
        const found = get().playlist.find((u) => u === url);
        if (!found) {
          set((state) => ({
            playlist: [...state.playlist, url],
          }));
        }
      },
      removeFromPlaylist: (url: string) => {
        set((state) => ({
          playlist: state.playlist.filter((u) => u !== url),
        }));
      },

      clearPlaylist: () => {
        set(() => ({
          playlist: [],
        }));
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
    },
  ),
);
