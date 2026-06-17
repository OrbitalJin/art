import ReactPlayer from "react-player";
import { useIntervalStore } from "@/lib/store/use-interval-store";
import { useCurrentItem, usePlaylist } from "@/hooks/use-playlist";

export const HiddenPlayer = () => {
  const currentIndex = useIntervalStore((state) => state.currentIndex);
  const playing = useIntervalStore((state) => state.playing);
  const volume = useIntervalStore((state) => state.volume);
  const muted = useIntervalStore((state) => state.muted);
  const loop = useIntervalStore((state) => state.loop);
  const setPlayedSeconds = useIntervalStore((state) => state.setPlayedSeconds);
  const setDuration = useIntervalStore((state) => state.setDuration);
  const setError = useIntervalStore((state) => state.setError);
  const setCurrentIndex = useIntervalStore((state) => state.setCurrentIndex);
  const playNext = useIntervalStore((state) => state.playNext);
  const item = useCurrentItem();
  const playlist = usePlaylist();

  return (
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
  );
};
