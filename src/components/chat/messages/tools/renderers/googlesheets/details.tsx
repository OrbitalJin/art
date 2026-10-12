import type { FC } from "react";
import type {
  BatchValuesOutput,
  SheetNamesOutput,
  SpreadsheetInfoOutput,
  SpreadsheetsOutput,
  ValuesOutput,
} from "@/lib/ai/tools/googlesheets";
import type { RendererProps } from "../../types";
import { asRecord, formatCount, getString } from "../../helpers";
import {
  Chip,
  DetailGate,
  DetailTitle,
  EmptyNote,
  HeaderLine,
  RowList,
  SectionLabel,
} from "../../primitives";
import { RangeHeader, SheetRow, SpreadsheetRow, ValueGrid } from "./parts";

const inputString = (input: unknown, key: string): string | null =>
  getString(asRecord(input), key);

const SpreadsheetInfoBody: FC<RendererProps<SpreadsheetInfoOutput>> = ({
  block,
  output,
}) => {
  const spreadsheet = output?.spreadsheet ?? {
    id: null,
    title: null,
    url: null,
  };
  const sheets = output?.sheets ?? [];
  const title = spreadsheet.title;
  const id = spreadsheet.id ?? inputString(block.input, "spreadsheet_id");
  const url = spreadsheet.url;

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

const SheetNamesBody: FC<RendererProps<SheetNamesOutput>> = ({ output }) => {
  const sheets = output?.sheets ?? [];
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

const ValuesBody: FC<RendererProps<ValuesOutput>> = ({ block, output }) => {
  const range = output?.range ?? null;
  const values = output?.values ?? [];
  const resolvedRange = range ?? inputString(block.input, "range");

  return (
    <div className="flex flex-col gap-2">
      <RangeHeader range={resolvedRange} fallback="Range" values={values} />
      <ValueGrid
        values={values}
        range={resolvedRange}
        emptyLabel="No values returned."
      />
    </div>
  );
};

const BatchGetBody: FC<RendererProps<BatchValuesOutput>> = ({ output }) => {
  const ranges = output?.ranges ?? [];
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

const SearchBody: FC<RendererProps<SpreadsheetsOutput>> = ({ output }) => {
  const spreadsheets = output?.spreadsheets ?? [];
  if (spreadsheets.length === 0) {
    return <EmptyNote>No spreadsheets found.</EmptyNote>;
  }

  return (
    <RowList maxHeightClass="max-h-72">
      {spreadsheets.map((spreadsheet, index) => (
        <SpreadsheetRow
          key={spreadsheet.id ?? index}
          spreadsheet={spreadsheet}
          index={index}
        />
      ))}
    </RowList>
  );
};

export const SpreadsheetInfoDetail: FC<RendererProps<SpreadsheetInfoOutput>> = ({
  block,
  output,
}) => (
  <DetailGate block={block} executingLabel="Loading…">
    <SpreadsheetInfoBody block={block} output={output} />
  </DetailGate>
);

export const SheetNamesDetail: FC<RendererProps<SheetNamesOutput>> = ({
  block,
  output,
}) => (
  <DetailGate block={block} executingLabel="Loading…">
    <SheetNamesBody block={block} output={output} />
  </DetailGate>
);

export const ValuesDetail: FC<RendererProps<ValuesOutput>> = ({
  block,
  output,
}) => (
  <DetailGate block={block} executingLabel="Reading values…">
    <ValuesBody block={block} output={output} />
  </DetailGate>
);

export const BatchGetDetail: FC<RendererProps<BatchValuesOutput>> = ({
  block,
  output,
}) => (
  <DetailGate block={block} executingLabel="Reading values…">
    <BatchGetBody block={block} output={output} />
  </DetailGate>
);

export const SearchDetail: FC<RendererProps<SpreadsheetsOutput>> = ({
  block,
  output,
}) => (
  <DetailGate block={block} executingLabel="Searching…">
    <SearchBody block={block} output={output} />
  </DetailGate>
);
