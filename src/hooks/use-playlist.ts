import { useMemo } from "react";
import { useIntervalStore } from "@/lib/store/use-interval-store";
import { useAudioMetadata } from "@/hooks/use-audio-metadata";

export interface PlaylistItem {
  url: string;
  title: string;
  author: string;
}

export function usePlaylist(): PlaylistItem[] {
  const storeUrls = useIntervalStore((state) => state.playlist);
  const metadata = useAudioMetadata(storeUrls);

  return useMemo(
    () =>
      storeUrls.map((url) => ({
        url,
        ...(metadata[url] ?? { title: "", author: "" }),
      })),
    [storeUrls, metadata],
  );
}

export function useCurrentItem(): PlaylistItem | null {
  const currentIndex = useIntervalStore((state) => state.currentIndex);
  const playlist = usePlaylist();
  return currentIndex >= 0 && currentIndex < playlist.length
    ? playlist[currentIndex]
    : null;
}

export function useProgress(): number {
  const playedSeconds = useIntervalStore((state) => state.playedSeconds);
  const duration = useIntervalStore((state) => state.duration);
  return duration > 0 ? (playedSeconds / duration) * 100 : 0;
}
