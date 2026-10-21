import type { FC } from "react";
import { Table } from "lucide-react";
import {
  DetailGate,
  EmptyNote,
  ResultBadge,
  SummaryRow,
  SummaryStatus,
  SummaryText,
  formatCount,
} from "../../shared";
import { defineRenderer, type RendererProps } from "../../types";
import { RangeHeader, ValueGrid } from "./parts";
import { batchGetOutputSchema, sheetsBatchGetInput } from "./schema";
import type {
  BatchGetOutput,
  SheetsBatchGetInput,
  ValueRange,
} from "./schema";

const Summary: FC<RendererProps<SheetsBatchGetInput, BatchGetOutput>> = ({
  block,
  output,
}) => {
  const ranges = output?.ranges ?? [];
  const first = ranges[0]?.range ?? null;

  return (
    <SummaryRow>
      {first ? (
        <SummaryText mono title={first}>
          {first}
        </SummaryText>
      ) : null}
      <SummaryStatus block={block}>
        <ResultBadge>{formatCount(ranges.length, "range")}</ResultBadge>
      </SummaryStatus>
    </SummaryRow>
  );
};

const Detail: FC<RendererProps<SheetsBatchGetInput, BatchGetOutput>> = ({
  block,
  output,
}) => {
  const ranges = output?.ranges ?? [];

  return (
    <DetailGate block={block} executingLabel="Reading values…">
      {ranges.length === 0 ? (
        <EmptyNote>No ranges returned.</EmptyNote>
      ) : (
        <div className="flex flex-col gap-3">
          {ranges.map((entry: ValueRange, index) => (
            <div key={entry.range ?? index} className="flex flex-col gap-2">
              <RangeHeader
                range={entry.range}
                fallback={`Range ${index + 1}`}
                values={entry.values}
              />
              <ValueGrid
                values={entry.values}
                range={entry.range}
                maxHeightClass="max-h-56"
              />
            </div>
          ))}
        </div>
      )}
    </DetailGate>
  );
};

export const renderer = defineRenderer<SheetsBatchGetInput, BatchGetOutput>({
  icon: Table,
  title: "Read ranges",
  executingTitle: "Reading ranges",
  surface: "card",
  inputSchema: sheetsBatchGetInput,
  outputSchema: batchGetOutputSchema,
  Summary,
  Detail,
});
