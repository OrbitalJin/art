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

const SEGMENT_LINE = /^\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s*(.*)$/;

const toSeconds = (timestamp: string): number => {
  const parts = timestamp.split(":").map((part) => Number(part));
  return parts.reduce((total, part) => total * 60 + part, 0);
};

export interface ParsedTranscript {
  title?: string;
  language?: string;
  duration?: string;
  words?: number;
  otherLanguages?: string[];
  segments: TranscriptSegment[];
}

/**
 * Parses the markdown document returned by youtube-transcript.ai into a
 * metadata header plus timestamped segments. Other providers can reuse this by
 * emitting the same shape, or supply their own parser.
 */
export const parseTranscript = (markdown: string): ParsedTranscript => {
  const result: ParsedTranscript = { segments: [] };

  for (const raw of markdown.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;

    if (line.startsWith("# Transcript:")) {
      result.title = line.slice("# Transcript:".length).trim() || undefined;
      continue;
    }

    if (line.startsWith("Language:")) {
      const meta = line.slice("Language:".length);
      const language = meta.split("·")[0]?.trim();
      if (language) result.language = language;

      const duration = meta.match(/Duration:\s*([^·]+)/);
      if (duration) result.duration = duration[1].trim();

      const words = meta.match(/Words:\s*([\d,]+)/);
      if (words) result.words = Number(words[1].replace(/,/g, ""));
      continue;
    }

    if (line.startsWith("Other available languages:")) {
      result.otherLanguages = line
        .slice("Other available languages:".length)
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);
      continue;
    }

    const segment = SEGMENT_LINE.exec(line);
    if (segment) {
      result.segments.push({
        timestamp: segment[1],
        seconds: toSeconds(segment[1]),
        text: segment[2].trim(),
      });
    }
  }

  return result;
};
