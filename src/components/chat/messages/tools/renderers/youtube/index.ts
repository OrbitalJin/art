import type { ToolRenderer } from "../../types";
import type { YoutubeToolName } from "@/lib/ai/tools/youtube";
import { renderer as transcript } from "./transcript";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRenderer = ToolRenderer<any, any>;

export const youtubeRenderers = {
  youtube_transcript: transcript,
} satisfies Record<YoutubeToolName, AnyRenderer>;
