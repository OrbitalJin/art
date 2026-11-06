import type { FC } from "react";
import { NotebookPen } from "lucide-react";
import type { z } from "zod";
import {
  journalReadInputSchema,
  journalReadOutputSchema,
  journalSearchInputSchema,
  journalSearchOutputSchema,
} from "@/lib/ai/tools/journal";
import type {
  JournalReadOutput,
  JournalSearchOutput,
} from "@/lib/ai/tools/journal";
import {
  CodePanel,
  CountSummary,
  EmptyNote,
  ErrorNote,
  SectionLabel,
  SummaryRow,
  SummaryStatus,
  SummaryText,
  ResultBadge,
} from "../../shared";
import { defineRenderer, type RendererProps } from "../../types";

type ReadInput = z.infer<typeof journalReadInputSchema>;
type SearchInput = z.infer<typeof journalSearchInputSchema>;

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

const SearchSummary: FC<RendererProps<SearchInput, JournalSearchOutput>> = ({
  block,
  input,
  output,
}) => (
  <CountSummary
    block={block}
    label={input?.query ?? input?.tag ?? null}
    count={output?.results.length ?? 0}
    noun="entry"
  />
);

const SearchDetail: FC<RendererProps<SearchInput, JournalSearchOutput>> = ({
  block,
  output,
}) => {
  if (block.state === "executing") return <EmptyNote>Searching…</EmptyNote>;
  if (block.state === "error") {
    return <ErrorNote>Failed to search the journal.</ErrorNote>;
  }
  if (!output || output.results.length === 0) {
    return <EmptyNote>No matching entries.</EmptyNote>;
  }

  return (
    <div className="flex flex-col gap-2">
      <SectionLabel>Entries</SectionLabel>
      <ul className="flex flex-col gap-1.5">
        {output.results.map((result) => (
          <li key={result.id} className="flex flex-col gap-0.5">
            <span className="text-[13px] font-medium text-foreground/90">
              {result.title}
            </span>
            {result.excerpt ? (
              <span className="line-clamp-2 text-xs text-muted-foreground/70">
                {result.excerpt}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
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

export const searchRenderer = defineRenderer<SearchInput, JournalSearchOutput>({
  icon: NotebookPen,
  title: "Searched the journal",
  executingTitle: "Searching the journal",
  inputSchema: journalSearchInputSchema,
  outputSchema: journalSearchOutputSchema,
  Summary: SearchSummary,
  Detail: SearchDetail,
});
