import type { FC } from "react";
import { NotebookPen } from "lucide-react";
import type { z } from "zod";
import {
  journalReadInputSchema,
  journalReadOutputSchema,
} from "@/lib/ai/tools/journal";
import type { JournalReadOutput } from "@/lib/ai/tools/journal";
import {
  CodePanel,
  EmptyNote,
  ErrorNote,
  SummaryRow,
  SummaryStatus,
  SummaryText,
  ResultBadge,
} from "../../shared";
import { defineRenderer, type RendererProps } from "../../types";

type ReadInput = z.infer<typeof journalReadInputSchema>;

const ReadSummary: FC<RendererProps<ReadInput, JournalReadOutput>> = ({
  block,
  input,
  output,
}) => {
  const label = output?.title ?? input?.id ?? null;
  const missing = output !== null && output.found === false;

  return (
    <SummaryRow>
      {label ? <SummaryText title={label}>{label}</SummaryText> : null}
      <SummaryStatus block={block}>
        {missing ? <ResultBadge tone="error">not found</ResultBadge> : null}
      </SummaryStatus>
    </SummaryRow>
  );
};

const ReadDetail: FC<RendererProps<ReadInput, JournalReadOutput>> = ({
  block,
  output,
}) => {
  if (block.state === "executing") return <EmptyNote>Reading…</EmptyNote>;
  if (block.state === "error") {
    return <ErrorNote>Failed to read the journal entry.</ErrorNote>;
  }
  if (!output || output.found === false) {
    return <EmptyNote>This journal entry no longer exists.</EmptyNote>;
  }

  return output.content?.trim() ? (
    <CodePanel maxHeightClass="max-h-72">{output.content}</CodePanel>
  ) : (
    <EmptyNote>This entry is empty.</EmptyNote>
  );
};

export const readRenderer = defineRenderer<ReadInput, JournalReadOutput>({
  icon: NotebookPen,
  title: "Read journal entry",
  executingTitle: "Reading journal entry",
  inputSchema: journalReadInputSchema,
  outputSchema: journalReadOutputSchema,
  Summary: ReadSummary,
  Detail: ReadDetail,
});
