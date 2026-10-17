import type { FC } from "react";
import { FileVideo } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DetailGate,
  DetailTitle,
  EmptyNote,
  MetaLine,
  ResultBadge,
  SummaryRow,
  SummaryStatus,
  SummaryText,
  formatCount,
} from "../../shared";
import type { RendererProps, ToolRenderer } from "../../types";
import {
  youtubeTranscriptInput,
  youtubeTranscriptOutput,
  type YoutubeTranscriptInput,
  type YoutubeTranscriptOutput,
} from "@/lib/ai/tools/youtube";
import {
  toTranscript,
  watchUrlOf,
  type TranscriptSegment,
  type TranscriptTurn,
} from "./helpers";

const stampClasses =
  "w-11 shrink-0 font-mono text-[10px] leading-[15px] tabular-nums text-muted-foreground/60 outline-none";

const Timestamp: FC<{
  value: string | null;
  href: string | null;
}> = ({ value, href }) => {
  if (!value) return <span aria-hidden className={stampClasses} />;

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={cn(
          stampClasses,
          "hover:text-primary hover:underline focus-visible:underline",
        )}
      >
        {value}
      </a>
    );
  }

  return <span className={stampClasses}>{value}</span>;
};

const TurnMarker: FC<{ visible: boolean }> = ({ visible }) => (
  <span
    aria-hidden
    className="flex h-[15px] w-2 shrink-0 items-center justify-center"
  >
    {visible ? (
      <span className="size-1.5 rounded-full bg-muted-foreground/30" />
    ) : null}
  </span>
);

const TurnLine: FC<{ turn: TranscriptTurn }> = ({ turn }) => (
  <div className="flex min-w-0 gap-1.5">
    <TurnMarker visible={turn.startsTurn} />
    <p className="min-w-0 text-[11px] leading-[15px] text-foreground/75">
      {turn.text}
    </p>
  </div>
);

const SegmentRow: FC<{
  segment: TranscriptSegment;
  videoId: string | null;
}> = ({ segment, videoId }) => {
  const href = videoId ? watchUrlOf(videoId, segment.seconds) : null;

  return (
    <li className="flex min-w-0 shrink-0 gap-2">
      <Timestamp value={segment.timestamp} href={href} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {segment.turns.map((turn, index) => (
          <TurnLine key={index} turn={turn} />
        ))}
      </div>
    </li>
  );
};

const TranscriptList: FC<{
  segments: TranscriptSegment[];
  videoId: string | null;
}> = ({ segments, videoId }) => (
  <ul className="flex max-h-72 min-h-0 flex-col gap-2 overflow-y-auto scroll-fade-y">
    {segments.map((segment, index) => (
      <SegmentRow key={index} segment={segment} videoId={videoId} />
    ))}
  </ul>
);

const Summary: FC<
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

const Detail: FC<RendererProps<YoutubeTranscriptInput, YoutubeTranscriptOutput>> =
  ({ block, output }) => {
    const transcript = toTranscript(output);
    const words =
      transcript.words !== null ? formatCount(transcript.words, "word") : null;

    return (
      <DetailGate block={block} executingLabel="Fetching transcript…">
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-col gap-0.5">
            {transcript.title ? <DetailTitle title={transcript.title} /> : null}
            <MetaLine
              items={[transcript.language, transcript.duration, words]}
            />
          </div>

          {transcript.segments.length === 0 ? (
            <EmptyNote>No transcript segments returned.</EmptyNote>
          ) : (
            <TranscriptList
              segments={transcript.segments}
              videoId={transcript.videoId}
            />
          )}
        </div>
      </DetailGate>
    );
  };

export const renderer: ToolRenderer<
  YoutubeTranscriptInput,
  YoutubeTranscriptOutput
> = {
  icon: FileVideo,
  title: "Read transcript",
  executingTitle: "Reading transcript",
  inputSchema: youtubeTranscriptInput,
  outputSchema: youtubeTranscriptOutput,
  Summary,
  Detail,
};
