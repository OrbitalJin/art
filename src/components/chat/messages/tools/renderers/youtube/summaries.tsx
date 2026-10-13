import type { FC } from "react";
import type {
  YoutubeTranscriptInput,
  YoutubeTranscriptOutput,
} from "@/lib/ai/tools/youtube";
import type { RendererProps } from "../../types";
import {
  ResultBadge,
  SummaryRow,
  SummaryStatus,
  SummaryText,
} from "../../primitives";
import { formatCount } from "../../helpers";
import { toTranscript } from "./helpers";

export const YoutubeSummary: FC<
  RendererProps<YoutubeTranscriptInput, YoutubeTranscriptOutput>
> = ({ block, input, output }) => {
  const video = input?.video ?? null;
  const transcript = toTranscript(output);
  const words =
    transcript.words !== null ? formatCount(transcript.words, "word") : null;

  return (
    <SummaryRow>
      {transcript.title ? (
        <SummaryText title={transcript.title}>{transcript.title}</SummaryText>
      ) : video ? (
        <SummaryText mono title={video}>
          {video}
        </SummaryText>
      ) : null}
      <SummaryStatus block={block}>
        {words ? <ResultBadge>{words}</ResultBadge> : null}
      </SummaryStatus>
    </SummaryRow>
  );
};
