/** Cell text for display; empty for null/undefined. */
export const cellText = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
};

const NUMERIC = /^-?[\d,]*\.?\d+%?$/;

export interface CellDisplay {
  text: string;
  numeric: boolean;
}

export const describeCell = (value: unknown): CellDisplay => {
  const text = cellText(value);
  const numeric = typeof value === "number" || NUMERIC.test(text.trim());

  return { text, numeric };
};

/** 0 -> A, 25 -> Z, 26 -> AA. */
export const columnLabel = (index: number): string => {
  let label = "";
  let remaining = index;

  while (remaining >= 0) {
    label = String.fromCharCode(65 + (remaining % 26)) + label;
    remaining = Math.floor(remaining / 26) - 1;
  }

  return label;
};

const columnIndexOf = (letters: string): number =>
  letters
    .split("")
    .reduce((total, letter) => total * 26 + (letter.charCodeAt(0) - 64), 0) - 1;

export interface GridOrigin {
  column: number;
  row: number;
}

/**
 * Where a range starts, so `Sheet1!B2:D10` labels columns from B and rows
 * from 2. Falls back to A1 when the range has no parseable start.
 */
export const gridOriginOf = (range: string | null): GridOrigin => {
  if (!range) return { column: 0, row: 1 };

  const cells = range.slice(range.lastIndexOf("!") + 1);
  const match = cells.match(/^\$?([A-Za-z]+)?\$?(\d+)?/);

  const letters = match?.[1]?.toUpperCase();
  const digits = match?.[2];

  return {
    column: letters ? columnIndexOf(letters) : 0,
    row: digits ? Number(digits) : 1,
  };
};

export const columnCountOf = (values: unknown[][]): number =>
  values.reduce((widest, row) => Math.max(widest, row.length), 0);

export const formatDimensions = (rows: number, columns: number): string =>
  `${rows.toLocaleString()} × ${columns.toLocaleString()}`;
