import type { FC } from "react";
import { cn } from "@/lib/utils";
import { EmptyNote } from "../../shared";
import {
  columnCountOf,
  columnLabel,
  describeCell,
  gridOriginOf,
} from "./helpers";

const headerCellClasses =
  "sticky border-b border-border/40 bg-muted px-3 py-1.5 text-[10px] font-normal select-none text-muted-foreground/60";

const GridCell: FC<{ value: unknown }> = ({ value }) => {
  const { text, numeric } = describeCell(value);

  const cellClasses = cn(
    "max-w-[24rem] truncate border-b border-border/25 px-3 py-1.5 align-top text-foreground/80 group-last:border-b-0",
    numeric && "text-right tabular-nums",
  );

  return (
    <td title={text || undefined} className={cellClasses}>
      {text || <span className="text-muted-foreground/30">—</span>}
    </td>
  );
};

const CornerCell: FC = () => {
  const cornerClasses = cn(
    headerCellClasses,
    "left-0 top-0 z-20 border-r border-r-border/30",
  );

  return <th aria-hidden className={cornerClasses} />;
};

const ColumnHeader: FC<{ label: string }> = ({ label }) => {
  const columnHeaderClasses = cn(headerCellClasses, "top-0 z-10 text-center");

  return (
    <th scope="col" className={columnHeaderClasses}>
      {label}
    </th>
  );
};

const RowHeader: FC<{ number: number }> = ({ number }) => {
  const rowHeaderClasses = cn(
    headerCellClasses,
    "left-0 z-10 border-r border-r-border/30 border-b-border/25 text-right align-top tabular-nums group-last:border-b-0",
  );

  return (
    <th scope="row" className={rowHeaderClasses}>
      {number}
    </th>
  );
};

const HeaderRow: FC<{ columnIndexes: number[]; firstColumn: number }> = ({
  columnIndexes,
  firstColumn,
}) => (
  <tr>
    <CornerCell />
    {columnIndexes.map((columnIndex) => (
      <ColumnHeader
        key={columnIndex}
        label={columnLabel(firstColumn + columnIndex)}
      />
    ))}
  </tr>
);

const GridRow: FC<{
  row: unknown[];
  rowNumber: number;
  columnIndexes: number[];
}> = ({ row, rowNumber, columnIndexes }) => (
  <tr className="group">
    <RowHeader number={rowNumber} />
    {columnIndexes.map((columnIndex) => (
      <GridCell key={columnIndex} value={row[columnIndex]} />
    ))}
  </tr>
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
  const columnIndexes = Array.from(
    { length: columnCount },
    (_, index) => index,
  );

  const containerClasses = cn(
    "overflow-auto rounded-md border border-border/50 bg-card",
    maxHeightClass,
  );

  return (
    <div className={containerClasses}>
      <table className="w-full border-separate border-spacing-0 text-xs">
        <thead>
          <HeaderRow
            columnIndexes={columnIndexes}
            firstColumn={origin.column}
          />
        </thead>
        <tbody>
          {values.map((row, rowIndex) => (
            <GridRow
              key={rowIndex}
              row={row}
              rowNumber={origin.row + rowIndex}
              columnIndexes={columnIndexes}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
