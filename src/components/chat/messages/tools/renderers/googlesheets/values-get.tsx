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
import { RangeHeader, ValueGrid } from "./parts";
import { sheetsValuesGetInput, valuesOutputSchema } from "./schema";
import type { SheetsValuesGetInput, ValuesOutput } from "./schema";

const Summary: FC<RendererProps<SheetsValuesGetInput, ValuesOutput>> = ({
  block,
  input,
  output,
}) => {
  const range = output?.range ?? input?.range ?? null;
  const rows = output?.values.length ?? 0;

  return (
    <SummaryRow>
      {range ? (
        <SummaryText mono title={range}>
          {range}
        </SummaryText>
      ) : null}
      <SummaryStatus block={block}>
        <ResultBadge>{formatCount(rows, "row")}</ResultBadge>
      </SummaryStatus>
    </SummaryRow>
  );
};

const Detail: FC<RendererProps<SheetsValuesGetInput, ValuesOutput>> = ({
  block,
  input,
  output,
}) => {
  const range = output?.range ?? input?.range ?? null;
  const values = output?.values ?? [];

  return (
    <DetailGate block={block} executingLabel="Reading values…">
      <div className="flex flex-col gap-2">
        <RangeHeader range={range} fallback="Range" values={values} />
        <ValueGrid
          values={values}
          range={range}
          emptyLabel="No values returned."
        />
      </div>
    </DetailGate>
  );
};

export const renderer = defineRenderer<SheetsValuesGetInput, ValuesOutput>({
  icon: Table,
  title: "Read range",
  executingTitle: "Reading range",
  surface: "card",
  inputSchema: sheetsValuesGetInput,
  outputSchema: valuesOutputSchema,
  Summary,
  Detail,
});
