import { nativeFetch } from "@/lib/native-fetch";
import { parseTranscript } from "../parse";
import type { TranscriptProvider, TranscriptResult } from "../types";

const BASE_URL = "https://youtube-transcript.ai";

const watchUrl = (videoId: string): string =>
  `https://www.youtube.com/watch?v=${videoId}`;

const empty = (videoId: string, error: string): TranscriptResult => ({
  videoId,
  url: watchUrl(videoId),
  segments: [],
  transcript: "",
  error,
});

export const youtubeTranscriptAiProvider: TranscriptProvider = {
  id: "youtube-transcript-ai",
  label: "youtube-transcript.ai",
  requiresKey: true,

  fetchTranscript: async ({ videoId, lang, apiKey }) => {
    const endpoint = new URL(`${BASE_URL}/transcript/${videoId}.txt`);
    if (lang) endpoint.searchParams.set("lang", lang);

    let res: Response;
    try {
      res = await nativeFetch(endpoint.toString(), {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
    } catch (error) {
      return empty(
        videoId,
        `Transcript request failed: ${String(error).slice(0, 200)}`,
      );
    }

    if (!res.ok) {
      if (res.status === 401) {
        return empty(
          videoId,
          "YouTube transcript API key is missing or invalid. Ask the user to add one in Settings > Chat.",
        );
      }
      if (res.status === 429) {
        const retryAfter = res.headers.get("Retry-After");
        return empty(
          videoId,
          `YouTube transcript daily quota reached${
            retryAfter ? ` (retry after ${retryAfter}s)` : ""
          }.`,
        );
      }
      const detail = await res.text().catch(() => "");
      return empty(
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
  },
};
