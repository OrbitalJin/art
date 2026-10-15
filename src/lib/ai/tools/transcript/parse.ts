import type { TranscriptSegment } from "./types";

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

const isVideoId = (value: string | null | undefined): value is string =>
  !!value && VIDEO_ID.test(value);

const YOUTUBE_PATH_MARKERS = ["shorts", "embed", "live", "v"];

/**
 * Accepts a bare 11-character video ID or any common YouTube URL
 * (`watch?v=`, `youtu.be/`, `/shorts/`, `/embed/`, `/live/`).
 */
export const extractVideoId = (input: string): string | null => {
  const value = input.trim();
  if (!value) return null;
  if (VIDEO_ID.test(value)) return value;

  let url: URL;
  try {
    url = new URL(value.startsWith("http") ? value : `https://${value}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "");

  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return isVideoId(id) ? id : null;
  }

  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const fromQuery = url.searchParams.get("v");
    if (isVideoId(fromQuery)) return fromQuery;

    const parts = url.pathname.split("/").filter(Boolean);
    const marker = parts.findIndex((part) => YOUTUBE_PATH_MARKERS.includes(part));
    const id = marker >= 0 ? parts[marker + 1] : undefined;
    return isVideoId(id) ? id : null;
  }

  return null;
};

/** 75 -> `1:15`, 3725 -> `1:02:05`. */
export const formatTimestamp = (totalSeconds: number): string => {
  const whole = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const seconds = whole % 60;
  const paddedSeconds = String(seconds).padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${paddedSeconds}`;
  }

  return `${minutes}:${paddedSeconds}`;
};

interface Json3Seg {
  utf8?: string;
}

interface Json3Event {
  tStartMs?: number;
  aAppend?: number;
  segs?: Json3Seg[];
}

/**
 * Turns a `fmt=json3` timedtext payload into timestamped segments. The header
 * event and `aAppend` line-break events carry no spoken text and are skipped.
 * The `>>` speaker marker is left in the text for the renderer to split on.
 */
export const parseJson3 = (data: unknown): TranscriptSegment[] => {
  const events = (data as { events?: Json3Event[] } | null)?.events ?? [];
  const segments: TranscriptSegment[] = [];

  for (const event of events) {
    if (event.aAppend || !event.segs) continue;

    const text = event.segs
      .map((seg) => seg.utf8 ?? "")
      .join("")
      .trim();
    if (!text) continue;

    const seconds = (event.tStartMs ?? 0) / 1000;
    segments.push({ timestamp: formatTimestamp(seconds), seconds, text });
  }

  return segments;
};
