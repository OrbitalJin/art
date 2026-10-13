export interface TranscriptSegment {
  timestamp: string;
  seconds: number;
  text: string;
}

export interface TranscriptResult {
  videoId: string;
  url: string;
  title?: string;
  language?: string;
  duration?: string;
  words?: number;
  otherLanguages?: string[];
  segments: TranscriptSegment[];
  transcript: string;
  error?: string;
}
