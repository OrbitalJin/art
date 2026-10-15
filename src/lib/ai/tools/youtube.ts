import { invoke } from "@tauri-apps/api/core";
import { tool } from "ai";
import { z } from "zod";
import { extractVideoId, formatTimestamp, parseJson3 } from "./transcript/parse";
import type { TranscriptResult, TranscriptSegment } from "./transcript/types";
import { getCachedTranscript, setCachedTranscript } from "./transcript/cache";

interface CaptionData {
  language: string | null;
  title: string | null;
  lengthSeconds: number | null;
  otherLanguages: string[];
  json3: unknown;
}

const watchUrl = (videoId: string): string =>
  `https://www.youtube.com/watch?v=${videoId}`;

const emptyTranscript = (
  videoId: string,
  error: string,
): TranscriptResult => ({
  videoId,
  url: watchUrl(videoId),
  segments: [],
  transcript: "",
  error,
});

const toMarkdown = (segments: TranscriptSegment[]): string =>
  segments.map((segment) => `[${segment.timestamp}] ${segment.text}`).join("\n");

const fetchTranscript = async ({
  videoId,
  lang,
}: {
  videoId: string;
  lang?: string;
}): Promise<TranscriptResult> => {
  let data: CaptionData;
  try {
    data = await invoke<CaptionData>("fetch_youtube_captions", {
      videoId,
      lang: lang ?? null,
    });
  } catch (error) {
    return emptyTranscript(
      videoId,
      `YouTube request failed: ${String(error).slice(0, 200)}`,
    );
  }

  const segments = parseJson3(data.json3);
  const words = segments.reduce(
    (total, segment) => total + segment.text.split(/\s+/).filter(Boolean).length,
    0,
  );

  return {
    videoId,
    url: watchUrl(videoId),
    title: data.title ?? undefined,
    language: data.language ?? undefined,
    duration: data.lengthSeconds
      ? formatTimestamp(data.lengthSeconds)
      : undefined,
    words: words || undefined,
    otherLanguages: data.otherLanguages.length ? data.otherLanguages : undefined,
    segments,
    transcript: toMarkdown(segments),
  };
};

export const transcriptSegmentSchema = z.object({
  timestamp: z.string().describe("Timestamp marker, e.g. 4:12"),
  seconds: z.number().describe("Offset from the start of the video in seconds"),
  text: z.string(),
});

export const youtubeTranscriptOutput = z.object({
  videoId: z.string(),
  url: z.string(),
  title: z.string().optional(),
  language: z.string().optional(),
  duration: z.string().optional(),
  words: z.number().optional(),
  otherLanguages: z.array(z.string()).optional(),
  segments: z.array(transcriptSegmentSchema),
  transcript: z.string().describe("Full transcript as timestamped markdown"),
  error: z.string().optional(),
});

export type YoutubeTranscriptSegment = z.infer<typeof transcriptSegmentSchema>;
export type YoutubeTranscriptOutput = z.infer<typeof youtubeTranscriptOutput>;

export const youtubeTranscriptInput = z.object({
  video: z.string().describe("A YouTube URL or an 11-character video ID"),
  lang: z
    .string()
    .optional()
    .describe(
      "Optional YouTube language code, e.g. en, es, zh-Hant. Falls back to an available track.",
    ),
});
export type YoutubeTranscriptInput = z.infer<typeof youtubeTranscriptInput>;

const parseError = (video: string): YoutubeTranscriptOutput => ({
  videoId: "",
  url: "",
  segments: [],
  transcript: "",
  error: `Could not find a YouTube video ID in "${video}". Provide a video URL or an 11-character ID.`,
});

export const youtubeTools = () => {
  return {
    youtube_transcript: tool({
      title: "YouTube Transcript",
      description:
        "Fetch the full transcript of a YouTube video, grouped into " +
        "timestamped segments. Use this to read, summarize, quote, or turn a " +
        "video's content into notes and actionable tasks. Accepts a YouTube " +
        "URL or an 11-character video ID, with an optional language code. " +
        "Transcripts are immutable and cached, so call this at most once per " +
        "video: reuse the earlier result instead of fetching again, and only " +
        "re-call for a different video or a different language. " +
        "When you present timestamps, always ask the user first whether they " +
        "want them as openable links, unless they already said so. If they do, " +
        "format each as `[m:ss](https://www.youtube.com/watch?v=VIDEO_ID&t=SECONDSs)` " +
        "using the segment's `seconds` value (e.g. " +
        "`[1:21](https://www.youtube.com/watch?v=7E6GjGx0tc8&t=81s)`). " +
        "This is the only tool for transcripts: always pass the video URL or " +
        "ID here and never try to fetch a transcript URL with the URL-fetch " +
        "tool. When the user asks for takeaways or action items, turn the " +
        "relevant points into concrete tasks with the tasks tools, and keep " +
        "each task's `[m:ss]` timestamp as a reference.",
      inputSchema: youtubeTranscriptInput,
      outputSchema: youtubeTranscriptOutput,
      execute: async ({ video, lang }) => {
        const videoId = extractVideoId(video);
        if (!videoId) return parseError(video);

        const cached = await getCachedTranscript(videoId, lang);
        if (cached) return cached;

        const result = await fetchTranscript({ videoId, lang });
        await setCachedTranscript(videoId, result, lang);
        return result;
      },
    }),
  };
};

export type YoutubeToolName = keyof ReturnType<typeof youtubeTools>;
