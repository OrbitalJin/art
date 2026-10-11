import type { FC } from "react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import {
  ResultBadge,
  SummaryRow,
  SummaryStatus,
  SummaryText,
} from "../../primitives";
import { asRecord, formatCount, getString } from "../../helpers";
import { toTranscript } from "./helpers";

export const YoutubeSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const video = getString(asRecord(block.input), "video");
  const transcript = toTranscript(block.output);
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
