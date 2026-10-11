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

export interface TranscriptRequest {
  videoId: string;
  lang?: string;
  apiKey: string;
}

export interface TranscriptProvider {
  id: string;
  label: string;
  requiresKey: boolean;
  fetchTranscript: (request: TranscriptRequest) => Promise<TranscriptResult>;
}
