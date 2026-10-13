import { nativeFetch } from "@/lib/native-fetch";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { tool } from "ai";
import { z } from "zod";
import { extractVideoId, parseTranscript } from "./transcript/parse";
import type { TranscriptResult } from "./transcript/types";
import { getCachedTranscript, setCachedTranscript } from "./transcript/cache";

const TRANSCRIPT_BASE_URL = "https://youtube-transcript.ai";

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

const fetchTranscript = async ({
  videoId,
  lang,
  apiKey,
}: {
  videoId: string;
  lang?: string;
  apiKey: string;
}): Promise<TranscriptResult> => {
  const endpoint = new URL(`${TRANSCRIPT_BASE_URL}/transcript/${videoId}.txt`);
  if (lang) endpoint.searchParams.set("lang", lang);

  let res: Response;
  try {
    res = await nativeFetch(endpoint.toString(), {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
  } catch (error) {
    return emptyTranscript(
      videoId,
      `Transcript request failed: ${String(error).slice(0, 200)}`,
    );
  }

  if (!res.ok) {
    if (res.status === 401) {
      return emptyTranscript(
        videoId,
        "YouTube transcript API key is missing or invalid. Ask the user to add one in Settings > Chat.",
      );
    }
    if (res.status === 429) {
      const retryAfter = res.headers.get("Retry-After");
      return emptyTranscript(
        videoId,
        `YouTube transcript daily quota reached${
          retryAfter ? ` (retry after ${retryAfter}s)` : ""
        }.`,
      );
    }
    const detail = await res.text().catch(() => "");
    return emptyTranscript(
      videoId,
      `Transcript request failed (${res.status}): ${detail.slice(0, 200)}`,
    );
  }

  const transcript = await res.text();
  return {
    videoId,
    url: watchUrl(videoId),
    transcript,
    ...parseTranscript(transcript),
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

const NO_KEY_ERROR =
  "YouTube transcript API key is not configured. Ask the user to add one in Settings > Chat.";

const parseError = (video: string): YoutubeTranscriptOutput => ({
  videoId: "",
  url: "",
  segments: [],
  transcript: "",
  error: `Could not find a YouTube video ID in "${video}". Provide a video URL or an 11-character ID.`,
});

export const youtubeTools = () => {
  const apiKey = () => useSettingsStore.getState().youtubeApiKey;

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
        "tool. The daily transcript quota is very limited (~10 requests), so " +
        "avoid spending requests unnecessarily. When the user asks for " +
        "takeaways or action items, turn the relevant points into concrete " +
        "tasks with the tasks tools, and keep each task's `[m:ss]` timestamp " +
        "as a reference.",
      inputSchema: youtubeTranscriptInput,
      outputSchema: youtubeTranscriptOutput,
      execute: async ({ video, lang }) => {
        const videoId = extractVideoId(video);
        if (!videoId) return parseError(video);

        const cached = await getCachedTranscript(videoId, lang);
        if (cached) return cached;

        const key = apiKey();
        if (!key) {
          return {
            videoId,
            url: watchUrl(videoId),
            segments: [],
            transcript: "",
            error: NO_KEY_ERROR,
          };
        }

        const result = await fetchTranscript({
          videoId,
          lang,
          apiKey: key,
        });
        await setCachedTranscript(videoId, result, lang);
        return result;
      },
    }),
  };
};

export type YoutubeToolName = keyof ReturnType<typeof youtubeTools>;
