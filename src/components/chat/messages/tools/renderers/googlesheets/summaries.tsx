import type { FC } from "react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import {
  CountSummary,
  ResultBadge,
  SummaryRow,
  SummaryStatus,
  SummaryText,
} from "../../primitives";
import { formatCount, getSummaryText } from "../../helpers";
import {
  rangeOf,
  sheetsOf,
  spreadsheetIdOf,
  spreadsheetTitleOf,
  valueRangesOf,
  valuesOf,
} from "./helpers";

export const SpreadsheetInfoSummary: FC<{ block: ToolCallBlock }> = ({
  block,
}) => {
  const title =
    spreadsheetTitleOf(block.output) ??
    spreadsheetIdOf(block.output, block.input) ??
    getSummaryText(block.input);

  return (
    <CountSummary
      block={block}
      label={title}
      count={sheetsOf(block.output).length}
      noun="sheet"
    />
  );
};

export const SheetNamesSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const sheets = sheetsOf(block.output);
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

export const ValuesSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const range = rangeOf(block.output, block.input);
  const values = valuesOf(block.output);

  return (
    <SummaryRow>
      {range ? (
        <SummaryText mono title={range}>
          {range}
        </SummaryText>
      ) : null}
      <SummaryStatus block={block}>
        <ResultBadge>{formatCount(values.length, "row")}</ResultBadge>
      </SummaryStatus>
    </SummaryRow>
  );
};

export const BatchGetSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const ranges = valueRangesOf(block.output);
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
