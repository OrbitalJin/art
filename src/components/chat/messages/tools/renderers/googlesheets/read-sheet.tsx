import type { FC } from "react";
import { Table } from "lucide-react";
import {
  DetailGate,
  ResultBadge,
  SummaryRow,
  SummaryStatus,
  SummaryText,
  formatCount,
} from "../../shared";
import { defineRenderer, type RendererProps } from "../../types";
import { ValueGrid } from "./parts";
import { readSheetInput, readSheetOutputSchema } from "./schema";
import type { ReadSheetInput, ReadSheetOutput } from "./schema";

const rangeOf = (
  input: ReadSheetInput | null,
  output: ReadSheetOutput | null,
): string | null => output?.range ?? input?.range ?? null;

const labelOf = (
  input: ReadSheetInput | null,
  output: ReadSheetOutput | null,
): string | null => rangeOf(input, output) ?? input?.sheet ?? null;

const Summary: FC<RendererProps<ReadSheetInput, ReadSheetOutput>> = ({
  block,
  input,
  output,
}) => {
  const label = labelOf(input, output);

  return (
    <SummaryRow>
      {label ? (
        <SummaryText mono title={label}>
          {label}
        </SummaryText>
      ) : null}
      <SummaryStatus block={block}>
        <ResultBadge>{formatCount(output?.rowCount ?? 0, "row")}</ResultBadge>
      </SummaryStatus>
    </SummaryRow>
  );
};

const Detail: FC<RendererProps<ReadSheetInput, ReadSheetOutput>> = ({
  block,
  input,
  output,
}) => {
  const range = rangeOf(input, output);
  const values = output?.values ?? [];

  return (
    <DetailGate block={block} executingLabel="Reading sheet…">
      <div className="flex flex-col gap-2">
        <ValueGrid
          values={values}
          range={range}
          emptyLabel="No data returned."
        />
      </div>
    </DetailGate>
  );
};

export const renderer = defineRenderer<ReadSheetInput, ReadSheetOutput>({
  icon: Table,
  title: "Read sheet",
  executingTitle: "Reading sheet",
  surface: "card",
  inputSchema: readSheetInput,
  outputSchema: readSheetOutputSchema,
  Summary,
  Detail,
});
