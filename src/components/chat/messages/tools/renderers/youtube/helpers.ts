import { asRecord, getNumber, getString, recordsOf } from "../../helpers";

export interface TranscriptTurn {
  text: string;
  startsTurn: boolean;
}

export interface TranscriptSegment {
  timestamp: string | null;
  seconds: number | null;
  turns: TranscriptTurn[];
}

export interface Transcript {
  title: string | null;
  language: string | null;
  duration: string | null;
  words: number | null;
  videoId: string | null;
  segments: TranscriptSegment[];
}

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

export const watchUrlOf = (videoId: string, seconds: number | null): string => {
  const base = `https://www.youtube.com/watch?v=${videoId}`;
  if (seconds === null) return base;
  return `${base}&t=${Math.floor(seconds)}s`;
};

/**
 * Splits on the `>>` speaker-change marker. Text before the first marker
 * continues the previous speaker, so only pieces after a marker start a turn.
 */
const turnsOf = (text: string): TranscriptTurn[] =>
  text
    .split(">>")
    .map((part, index) => ({ text: part.trim(), startsTurn: index > 0 }))
    .filter((turn) => turn.text !== "");

const toSegment = (
  record: Record<string, unknown>,
): TranscriptSegment | null => {
  const text = getString(record, "text");
  if (!text) return null;

  const turns = turnsOf(text);
  if (turns.length === 0) return null;

  const seconds = getNumber(record, "seconds");
  const timestamp =
    getString(record, "timestamp") ??
    (seconds !== null ? formatTimestamp(seconds) : null);

  return { timestamp, seconds, turns };
};

export const toTranscript = (output: unknown): Transcript => {
  const record = asRecord(output);

  const segments = recordsOf(record?.segments)
    .map(toSegment)
    .filter((segment): segment is TranscriptSegment => segment !== null);

  return {
    title: getString(record, "title"),
    language: getString(record, "language"),
    duration: getString(record, "duration"),
    words: getNumber(record, "words"),
    videoId: getString(record, "videoId"),
    segments,
  };
};
