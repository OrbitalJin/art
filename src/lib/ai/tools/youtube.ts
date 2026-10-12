import { useSettingsStore } from "@/lib/store/use-settings-store";
import { tool } from "ai";
import { z } from "zod";
import { extractVideoId } from "./transcript/parse";
import { getTranscriptProvider } from "./transcript/providers";
import {
  getCachedTranscript,
  setCachedTranscript,
} from "./transcript/cache";

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
  const provider = () =>
    getTranscriptProvider(useSettingsStore.getState().transcriptProvider);
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
        "ID here and never try to fetch a transcript URL with `fetch_url`.",
      inputSchema: z.object({
        video: z
          .string()
          .describe("A YouTube URL or an 11-character video ID"),
        lang: z
          .string()
          .optional()
          .describe(
            "Optional YouTube language code, e.g. en, es, zh-Hant. Falls back to an available track.",
          ),
      }),
      outputSchema: youtubeTranscriptOutput,
      execute: async ({ video, lang }) => {
        const videoId = extractVideoId(video);
        if (!videoId) return parseError(video);

        const active = provider();

        const cached = await getCachedTranscript(active.id, videoId, lang);
        if (cached) return cached;

        const key = apiKey();
        if (active.requiresKey && !key) {
          return {
            videoId,
            url: `https://www.youtube.com/watch?v=${videoId}`,
            segments: [],
            transcript: "",
            error: NO_KEY_ERROR,
          };
        }

        const result = await active.fetchTranscript({
          videoId,
          lang,
          apiKey: key,
        });
        await setCachedTranscript(active.id, videoId, result, lang);
        return result;
      },
    }),
  };
};

export type YoutubeToolName = keyof ReturnType<typeof youtubeTools>;
