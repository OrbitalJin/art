import type { FC } from "react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import { formatCount } from "../../helpers";
import {
  Chip,
  DetailGate,
  DetailTitle,
  EmptyNote,
  HeaderLine,
  SectionLabel,
} from "../../primitives";
import {
  rangeOf,
  sheetsOf,
  spreadsheetIdOf,
  spreadsheetTitleOf,
  spreadsheetUrlOf,
  valueRangesOf,
  valuesOf,
} from "./helpers";
import { RangeHeader, SheetRow, ValueGrid } from "./parts";

const SpreadsheetInfoBody: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const title = spreadsheetTitleOf(block.output);
  const id = spreadsheetIdOf(block.output, block.input);
  const url = spreadsheetUrlOf(block.output);
  const sheets = sheetsOf(block.output);

  if (!title && !id && !url && sheets.length === 0) {
    return <EmptyNote>No spreadsheet returned.</EmptyNote>;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2.5">
        <DetailTitle title={title ?? "Untitled spreadsheet"} />

        <div className="flex flex-col gap-1">
          {url ? (
            <HeaderLine label="URL">
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="outline-none hover:text-primary hover:underline focus-visible:underline"
              >
                {url}
              </a>
            </HeaderLine>
          ) : null}
          {id ? (
            <HeaderLine label="ID" mono>
              {id}
            </HeaderLine>
          ) : null}
        </div>
      </div>

      {sheets.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <SectionLabel>{formatCount(sheets.length, "sheet")}</SectionLabel>
          <div className="flex flex-col gap-1.5">
            {sheets.map((sheet, index) => (
              <SheetRow
                key={sheet.sheetId ?? index}
                sheet={sheet}
                index={index}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

const SheetNamesBody: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const sheets = sheetsOf(block.output);
  if (sheets.length === 0) return <EmptyNote>No sheets found.</EmptyNote>;

  return (
    <div className="flex flex-wrap gap-1.5">
      {sheets.map((sheet, index) => (
        <Chip key={sheet.sheetId ?? index} title={sheet.title ?? undefined}>
          {sheet.title ?? `Sheet ${index + 1}`}
        </Chip>
      ))}
    </div>
  );
};

const ValuesBody: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const range = rangeOf(block.output, block.input);
  const values = valuesOf(block.output);

  return (
    <div className="flex flex-col gap-2">
      <RangeHeader range={range} fallback="Range" values={values} />
      <ValueGrid
        values={values}
        range={range}
        emptyLabel="No values returned."
      />
    </div>
  );
};

const BatchGetBody: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const ranges = valueRangesOf(block.output);
  if (ranges.length === 0) return <EmptyNote>No ranges returned.</EmptyNote>;

  return (
    <div className="flex flex-col gap-3">
      {ranges.map((entry, index) => (
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
  );
};

export const SpreadsheetInfoDetail: FC<{ block: ToolCallBlock }> = ({
  block,
}) => (
  <DetailGate block={block} executingLabel="Loading…">
    <SpreadsheetInfoBody block={block} />
  </DetailGate>
);

export const SheetNamesDetail: FC<{ block: ToolCallBlock }> = ({ block }) => (
  <DetailGate block={block} executingLabel="Loading…">
    <SheetNamesBody block={block} />
  </DetailGate>
);

export const ValuesDetail: FC<{ block: ToolCallBlock }> = ({ block }) => (
  <DetailGate block={block} executingLabel="Reading values…">
    <ValuesBody block={block} />
  </DetailGate>
);

export const BatchGetDetail: FC<{ block: ToolCallBlock }> = ({ block }) => (
  <DetailGate block={block} executingLabel="Reading values…">
    <BatchGetBody block={block} />
  </DetailGate>
);
