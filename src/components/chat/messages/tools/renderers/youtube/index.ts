import { FileVideo } from "lucide-react";
import type { ToolRenderer } from "../../types";
import {
  youtubeTranscriptOutput,
  type YoutubeToolName,
} from "@/lib/ai/tools/youtube";
import { YoutubeDetail } from "./parts";
import { YoutubeSummary } from "./summaries";

export const youtubeRenderers = {
  youtube_transcript: {
    icon: FileVideo,
    title: "Read transcript",
    schema: youtubeTranscriptOutput,
    Summary: YoutubeSummary,
    Detail: YoutubeDetail,
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} satisfies Record<YoutubeToolName, ToolRenderer<any>>;
