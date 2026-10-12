import type { FC } from "react";
import type {
  BatchValuesOutput,
  SheetNamesOutput,
  SpreadsheetInfoOutput,
  SpreadsheetsOutput,
  ValuesOutput,
} from "@/lib/ai/tools/googlesheets";
import type { RendererProps } from "../../types";
import {
  CountSummary,
  ResultBadge,
  SummaryRow,
  SummaryStatus,
  SummaryText,
} from "../../primitives";
import { asRecord, formatCount, getString, getSummaryText } from "../../helpers";

const inputString = (input: unknown, key: string): string | null =>
  getString(asRecord(input), key);

export const SpreadsheetInfoSummary: FC<RendererProps<SpreadsheetInfoOutput>> =
  ({ block, output }) => {
    const spreadsheet = output?.spreadsheet ?? {
      id: null,
      title: null,
      url: null,
    };
    const sheets = output?.sheets ?? [];
    const title =
      spreadsheet.title ??
      spreadsheet.id ??
      inputString(block.input, "spreadsheet_id") ??
      getSummaryText(block.input);

    return (
      <CountSummary
        block={block}
        label={title}
        count={sheets.length}
        noun="sheet"
      />
    );
  };

export const SheetNamesSummary: FC<RendererProps<SheetNamesOutput>> = ({
  block,
  output,
}) => {
  const sheets = output?.sheets ?? [];
  const names = sheets
    .map((sheet) => sheet.title)
    .filter((title): title is string => title !== null)
    .join(", ");

  return (
    <CountSummary
      block={block}
      label={names || null}
      count={sheets.length}
      noun="sheet"
    />
  );
};

export const ValuesSummary: FC<RendererProps<ValuesOutput>> = ({
  block,
  output,
}) => {
  const range = output?.range ?? null;
  const values = output?.values ?? [];
  const resolvedRange = range ?? inputString(block.input, "range");

  return (
    <SummaryRow>
      {resolvedRange ? (
        <SummaryText mono title={resolvedRange}>
          {resolvedRange}
        </SummaryText>
      ) : null}
      <SummaryStatus block={block}>
        <ResultBadge>{formatCount(values.length, "row")}</ResultBadge>
      </SummaryStatus>
    </SummaryRow>
  );
};

export const BatchGetSummary: FC<RendererProps<BatchValuesOutput>> = ({
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

export const SearchSummary: FC<RendererProps<SpreadsheetsOutput>> = ({
  block,
  output,
}) => {
  const query =
    inputString(block.input, "query") ?? getSummaryText(block.input);

  return (
    <CountSummary
      block={block}
      label={query}
      count={output?.spreadsheets.length ?? 0}
      noun="spreadsheet"
    />
  );
};
