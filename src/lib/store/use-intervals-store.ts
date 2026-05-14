import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { intervalsStore } from "./intervals/adapter";

interface IntervalsState {
  playlist: string[];
  memoContent: string;
  addToPlaylist: (url: string) => void;
  setMemoContent: (content: string) => void;
  removeFromPlaylist: (url: string) => void;
  clearPlaylist: () => void;
}

export const useIntervalsStore = create<IntervalsState>()(
  persist(
    (set, get) => ({
      memoContent: "",
      playlist: ["https://youtu.be/8ugK6BCZzyY?si=wcd5O2Or7W0eMK0Q"],
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
