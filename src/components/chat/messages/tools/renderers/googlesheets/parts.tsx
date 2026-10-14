import type { FC } from "react";
import { cn } from "@/lib/utils";
import type { RendererProps } from "../../types";
import { formatCount } from "../../helpers";
import {
  Chip,
  CountSummary,
  DetailGate,
  DetailTitle,
  EmptyNote,
  HeaderLine,
  ListRow,
  ResultBadge,
  RowList,
  SectionLabel,
  SummaryRow,
  SummaryStatus,
  SummaryText,
} from "../../primitives";
import {
  cellText,
  columnCountOf,
  columnLabel,
  formatDimensions,
  gridOriginOf,
  isNumericCell,
} from "./helpers";
import type {
  BatchGetOutput,
  LookupOutput,
  SearchOutput,
  SheetNamesOutput,
  SheetsBatchGetInput,
  SheetsLookupInput,
  SheetsSearchInput,
  SheetsSpreadsheetIdInput,
  SheetsValuesGetInput,
  SpreadsheetInfoOutput,
  SheetMeta,
  SpreadsheetRef,
  ValueRange,
  ValuesOutput,
} from "./schema";

const GridCell: FC<{ value: unknown }> = ({ value }) => {
  const text = cellText(value);
  const numeric = isNumericCell(value, text);

  const cellClasses = cn(
    "max-w-[24rem] truncate px-2 py-1 align-top text-foreground/75",
    numeric && "text-right tabular-nums",
  );

  return (
    <td title={text} className={cellClasses}>
      {text || <span className="text-muted-foreground/30">—</span>}
    </td>
  );
};

export const ValueGrid: FC<{
  values: unknown[][];
  range?: string | null;
  emptyLabel?: string;
  maxHeightClass?: string;
}> = ({
  values,
  range = null,
  emptyLabel = "No data.",
  maxHeightClass = "max-h-72",
}) => {
  if (values.length === 0) return <EmptyNote>{emptyLabel}</EmptyNote>;

  const origin = gridOriginOf(range);
  const columnCount = columnCountOf(values);
  const columns = Array.from({ length: columnCount }, (_, index) => index);

  const cornerClasses =
    "sticky top-0 left-0 z-20 bg-muted px-2 py-1 select-none";
  const headerClasses =
    "sticky top-0 z-10 bg-muted px-2 py-1 text-center font-normal select-none text-muted-foreground/50";
  const rowNumberClasses =
    "sticky left-0 z-10 bg-muted px-2 py-1 text-right align-top tabular-nums select-none text-muted-foreground/50";

  return (
    <div
      className={cn(
        "overflow-auto rounded-md border border-border/40",
        maxHeightClass,
      )}
    >
      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr className="border-b border-border/30">
            <th aria-hidden className={cornerClasses} />
            {columns.map((column) => (
              <th key={column} scope="col" className={headerClasses}>
                {columnLabel(origin.column + column)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {values.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-border/30 last:border-0"
            >
              <th scope="row" className={rowNumberClasses}>
                {origin.row + rowIndex}
              </th>
              {columns.map((column) => (
                <GridCell key={column} value={row[column]} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const RangeHeader: FC<{
  range: string | null;
  fallback: string;
  values: unknown[][];
}> = ({ range, fallback, values }) => {
  const dimensions = formatDimensions(values.length, columnCountOf(values));

  return (
    <div className="flex min-w-0 items-baseline gap-2">
      <span
        className="min-w-0 truncate font-mono text-[11px] text-foreground/70"
        title={range ?? undefined}
      >
        {range ?? fallback}
      </span>
      {values.length > 0 && dimensions ? (
        <span className="ml-auto shrink-0 text-[10px] tabular-nums text-muted-foreground/50">
          {dimensions}
        </span>
      ) : null}
    </div>
  );
};

const SheetRow: FC<{ sheet: SheetMeta; index: number }> = ({
  sheet,
  index,
}) => {
  const name = sheet.title ?? `Sheet ${index + 1}`;
  const dimensions = formatDimensions(sheet.rowCount, sheet.columnCount);
  const meta =
    dimensions ?? (sheet.sheetId !== null ? `gid ${sheet.sheetId}` : null);

  return (
    <div className="flex min-w-0 items-baseline gap-2">
      <span
        className="min-w-0 truncate text-[12px] font-medium text-foreground/80"
        title={name}
      >
        {name}
      </span>
      {meta ? (
        <span className="ml-auto shrink-0 text-[10px] tabular-nums text-muted-foreground/50">
          {meta}
        </span>
      ) : null}
    </div>
  );
};

const SpreadsheetRow: FC<{
  spreadsheet: SpreadsheetRef;
  index: number;
}> = ({ spreadsheet, index }) => {
  const name =
    spreadsheet.name ?? spreadsheet.id ?? `Spreadsheet ${index + 1}`;

  return (
    <ListRow>
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="min-w-0 truncate text-[12px] font-medium text-foreground/80"
          title={name}
        >
          {name}
        </span>
        {spreadsheet.id ? (
          <span className="ml-auto shrink-0 font-mono text-[10px] text-muted-foreground/50">
            {spreadsheet.id}
          </span>
        ) : null}
      </div>
    </ListRow>
  );
};

/* Summaries */

export const SpreadsheetInfoSummary: FC<
  RendererProps<SheetsSpreadsheetIdInput, SpreadsheetInfoOutput>
> = ({ block, output }) => (
  <CountSummary
    block={block}
    label={output?.title ?? output?.id ?? null}
    count={output?.sheets.length ?? 0}
    noun="sheet"
  />
);

export const SheetNamesSummary: FC<
  RendererProps<SheetsSpreadsheetIdInput, SheetNamesOutput>
> = ({ block, output }) => {
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

export const ValuesSummary: FC<
  RendererProps<SheetsValuesGetInput, ValuesOutput>
> = ({ block, input, output }) => {
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

export const BatchGetSummary: FC<
  RendererProps<SheetsBatchGetInput, BatchGetOutput>
> = ({ block, output }) => {
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

export const SearchSummary: FC<
  RendererProps<SheetsSearchInput, SearchOutput>
> = ({ block, input, output }) => (
  <CountSummary
    block={block}
    label={input?.query ?? null}
    count={output?.spreadsheets.length ?? 0}
    noun="spreadsheet"
  />
);

export const LookupSummary: FC<
  RendererProps<SheetsLookupInput, LookupOutput>
> = ({ block, input, output }) => {
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

/* Details */

export const SpreadsheetInfoDetail: FC<
  RendererProps<SheetsSpreadsheetIdInput, SpreadsheetInfoOutput>
> = ({ block, output }) => (
  <DetailGate block={block} executingLabel="Loading…">
    {(() => {
      const info = output;
      if (!info) return <EmptyNote>No spreadsheet returned.</EmptyNote>;

      const sheets = info.sheets;
      if (!info.title && !info.id && !info.url && sheets.length === 0) {
        return <EmptyNote>No spreadsheet returned.</EmptyNote>;
      }

      return (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2.5">
            <DetailTitle title={info.title ?? "Untitled spreadsheet"} />

            <div className="flex flex-col gap-1">
              {info.url ? (
                <HeaderLine label="URL">
                  <a
                    href={info.url}
                    target="_blank"
                    rel="noreferrer"
                    className="outline-none hover:text-primary hover:underline focus-visible:underline"
                  >
                    {info.url}
                  </a>
                </HeaderLine>
              ) : null}
              {info.id ? (
                <HeaderLine label="ID" mono>
                  {info.id}
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
    })()}
  </DetailGate>
);

export const SheetNamesDetail: FC<
  RendererProps<SheetsSpreadsheetIdInput, SheetNamesOutput>
> = ({ block, output }) => {
  const sheets = output?.sheets ?? [];

  return (
    <DetailGate block={block} executingLabel="Loading…">
      {sheets.length === 0 ? (
        <EmptyNote>No sheets found.</EmptyNote>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {sheets.map((sheet, index) => (
            <Chip key={sheet.sheetId ?? index} title={sheet.title ?? undefined}>
              {sheet.title ?? `Sheet ${index + 1}`}
            </Chip>
          ))}
        </div>
      )}
    </DetailGate>
  );
};

export const ValuesDetail: FC<
  RendererProps<SheetsValuesGetInput, ValuesOutput>
> = ({ block, input, output }) => {
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

export const BatchGetDetail: FC<
  RendererProps<SheetsBatchGetInput, BatchGetOutput>
> = ({ block, output }) => {
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

export const SearchDetail: FC<
  RendererProps<SheetsSearchInput, SearchOutput>
> = ({ block, output }) => {
  const spreadsheets = output?.spreadsheets ?? [];

  return (
    <DetailGate block={block} executingLabel="Searching…">
      {spreadsheets.length === 0 ? (
        <EmptyNote>No spreadsheets found.</EmptyNote>
      ) : (
        <RowList maxHeightClass="max-h-72">
          {spreadsheets.map((spreadsheet, index) => (
            <SpreadsheetRow
              key={spreadsheet.id ?? index}
              spreadsheet={spreadsheet}
              index={index}
            />
          ))}
        </RowList>
      )}
    </DetailGate>
  );
};

export const LookupDetail: FC<
  RendererProps<SheetsLookupInput, LookupOutput>
> = ({ block, input, output }) => {
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
