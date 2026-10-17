import type { FC } from "react";
import { ListFilter } from "lucide-react";
import {
  DetailGate,
  EmptyNote,
  ResultBadge,
  SummaryRow,
  SummaryStatus,
  SummaryText,
  formatCount,
} from "../../shared";
import type { RendererProps, ToolRenderer } from "../../types";
import { RangeHeader, ValueGrid } from "./parts";
import { lookupOutputSchema, sheetsLookupInput } from "./schema";
import type { LookupOutput, SheetsLookupInput } from "./schema";

const Summary: FC<RendererProps<SheetsLookupInput, LookupOutput>> = ({
  block,
  input,
  output,
}) => {
  const query = input?.query ?? null;

  return (
    <SummaryRow>
      {query ? (
        <SummaryText title={query}>
          {query}
        </SummaryText>
      ) : null}
      <SummaryStatus block={block}>
        <ResultBadge>
          {output?.found ? formatCount(1, "row") : "no match"}
        </ResultBadge>
      </SummaryStatus>
    </SummaryRow>
  );
};

const Detail: FC<RendererProps<SheetsLookupInput, LookupOutput>> = ({
  block,
  input,
  output,
}) => {
  const row = output?.row ?? [];
  const range = input?.range ?? null;

  return (
    <DetailGate block={block} executingLabel="Looking up row…">
      {!output?.found || row.length === 0 ? (
        <EmptyNote>No matching row found.</EmptyNote>
      ) : (
        <div className="flex flex-col gap-2">
          <RangeHeader range={range} fallback="Matched row" values={[row]} />
          <ValueGrid values={[row]} range={range} maxHeightClass="max-h-56" />
        </div>
      )}
    </DetailGate>
  );
};

export const renderer: ToolRenderer<SheetsLookupInput, LookupOutput> = {
  icon: ListFilter,
  title: "Looked up row",
  executingTitle: "Looking up row",
  inputSchema: sheetsLookupInput,
  outputSchema: lookupOutputSchema,
  Summary,
  Detail,
};
