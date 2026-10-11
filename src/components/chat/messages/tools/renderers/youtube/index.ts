import { FileVideo } from "lucide-react";
import type { ToolRenderer } from "../../types";
import type { YoutubeToolName } from "@/lib/ai/tools/youtube";
import { YoutubeDetail } from "./parts";
import { YoutubeSummary } from "./summaries";

export const youtubeRenderers = {
  youtube_transcript: {
    icon: FileVideo,
    title: "Read transcript",
    Summary: YoutubeSummary,
    Detail: YoutubeDetail,
  },
} satisfies Record<YoutubeToolName, ToolRenderer>;
