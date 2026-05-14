import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { intervalsStore } from "./intervals/adapter";

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

interface IntervalsState extends MemoState {}

export const useIntervalsStore = create<IntervalsState>()(
  persist(
    (set, get) => ({
      volume: 0.5,
      currentIndex: 0,
      muted: false,
      loop: false,

      playlist: ["https://youtu.be/8ugK6BCZzyY?si=wcd5O2Or7W0eMK0Q"],
      memoContent: "",

      setVolume: (volume: number) => {
        set(() => ({
          volume,
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
