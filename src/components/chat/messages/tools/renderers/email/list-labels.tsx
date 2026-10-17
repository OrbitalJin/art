import type { FC } from "react";
import { Tags } from "lucide-react";
import {
  Chip,
  EmptyNote,
  ResultBadge,
  SummaryRow,
  SummaryStatus,
  formatCount,
} from "../../shared";
import type { RendererProps, ToolRenderer } from "../../types";
import { gmailListLabelsInput, labelListOutputSchema } from "./schema";
import type { GmailListLabelsInput, LabelListOutput } from "./schema";

const Summary: FC<RendererProps<GmailListLabelsInput, LabelListOutput>> = ({
  block,
  output,
}) => {
  const count = output?.labels.length ?? 0;

  return (
    <SummaryRow>
      <SummaryStatus block={block}>
        <ResultBadge>{formatCount(count, "label")}</ResultBadge>
      </SummaryStatus>
    </SummaryRow>
  );
};

const Detail: FC<RendererProps<GmailListLabelsInput, LabelListOutput>> = ({
  block,
  output,
}) => {
  if (block.state === "executing") return <EmptyNote>Loading…</EmptyNote>;

  const labels = output?.labels ?? [];
  if (labels.length === 0) return <EmptyNote>No labels found.</EmptyNote>;

  return (
    <div className="flex flex-wrap gap-1">
      {labels.map((label, index) => (
        <Chip key={label.id ?? index}>
          {label.name ?? label.id ?? "unknown"}
        </Chip>
      ))}
    </div>
  );
};

export const renderer: ToolRenderer<GmailListLabelsInput, LabelListOutput> = {
  icon: Tags,
  title: "Listed labels",
  executingTitle: "Listing labels",
  inputSchema: gmailListLabelsInput,
  outputSchema: labelListOutputSchema,
  Summary,
  Detail,
};
