import type { FC } from "react";
import { cn } from "@/lib/utils";
import { EmptyNote } from "../../shared";
import {
  cellText,
  columnCountOf,
  columnLabel,
  formatDimensions,
  gridOriginOf,
  isNumericCell,
} from "./helpers";

const GridCell: FC<{ value: unknown }> = ({ value }) => {
  const text = cellText(value);
  const numeric = isNumericCell(value, text);

  const cellClasses = cn(
    "max-w-[24rem] truncate px-3 py-1.5 align-top text-foreground/80",
    numeric && "text-right tabular-nums",
  );

  return (
    <td title={text} className={cellClasses}>
      {text || <span className="text-muted-foreground/30">—</span>}
    </td>
  );
};

const CornerCell: FC = () => (
  <th
    aria-hidden
    className="sticky left-0 top-0 z-20 border-r border-border/30 bg-muted px-3 py-1.5 select-none"
  />
);

const ColumnHeader: FC<{ label: string }> = ({ label }) => (
  <th
    scope="col"
    className="sticky top-0 z-10 bg-muted px-3 py-1.5 text-center text-[10px] font-normal select-none text-muted-foreground/60"
  >
    {label}
  </th>
);

const RowHeader: FC<{ number: number }> = ({ number }) => (
  <th
    scope="row"
    className="sticky left-0 z-10 border-r border-border/30 bg-card px-3 py-1.5 text-right align-top text-[10px] font-normal tabular-nums select-none text-muted-foreground/50"
  >
    {number}
  </th>
);

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

  return (
    <div
      className={cn(
        "overflow-auto rounded-lg border border-border/50 bg-card",
        maxHeightClass,
      )}
    >
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b border-border/40">
            <CornerCell />
            {columns.map((column) => (
              <ColumnHeader
                key={column}
                label={columnLabel(origin.column + column)}
              />
            ))}
          </tr>
        </thead>
        <tbody>
          {values.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-border/25 last:border-0"
            >
              <RowHeader number={origin.row + rowIndex} />
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
  const label = range ?? fallback;
  const showDimensions = values.length > 0 && dimensions;

  return (
    <div className="flex min-w-0 items-center justify-between gap-3">
      <span
        className="min-w-0 truncate rounded-md bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] text-foreground/70"
        title={range ?? undefined}
      >
        {label}
      </span>
      {showDimensions ? (
        <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground/60">
          {dimensions}
        </span>
      ) : null}
    </div>
  );
};
