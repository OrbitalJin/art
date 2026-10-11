import type { FC } from "react";
import { cn } from "@/lib/utils";
import { EmptyNote } from "../../primitives";
import {
  cellText,
  columnCountOf,
  columnLabel,
  formatDimensions,
  gridOriginOf,
  isNumericCell,
  type SheetMeta,
} from "./helpers";

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

export const RangeHeader: FC<{
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

export const SheetRow: FC<{ sheet: SheetMeta; index: number }> = ({
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
