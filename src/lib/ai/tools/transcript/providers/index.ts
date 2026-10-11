import type { TranscriptProvider } from "../types";
import { youtubeTranscriptAiProvider } from "./youtube-transcript-ai";

/**
 * To swap the transcript backend: implement `TranscriptProvider` in a new file
 * here, register it below, and point `DEFAULT_TRANSCRIPT_PROVIDER_ID` (or the
 * `transcriptProvider` setting) at its `id`. No tool or UI changes required.
 *
 * Note: requests go through the Tauri HTTP plugin, so the provider's host must
 * also be allowed in `src-tauri/capabilities/default.json` under `http:default`
 * (e.g. `{ "url": "https://youtube-transcript.ai" }`). That change needs a
 * Tauri rebuild to take effect.
 */
export const TRANSCRIPT_PROVIDERS: Record<string, TranscriptProvider> = {
  [youtubeTranscriptAiProvider.id]: youtubeTranscriptAiProvider,
};

export const DEFAULT_TRANSCRIPT_PROVIDER_ID = youtubeTranscriptAiProvider.id;

export const getTranscriptProvider = (id?: string): TranscriptProvider =>
  TRANSCRIPT_PROVIDERS[id ?? DEFAULT_TRANSCRIPT_PROVIDER_ID] ??
  youtubeTranscriptAiProvider;
