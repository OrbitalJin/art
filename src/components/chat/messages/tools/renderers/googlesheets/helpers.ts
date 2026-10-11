import {
  asArray,
  asRecord,
  dataOf,
  formatValue,
  getNumber,
  getString,
  recordsOf,
} from "../../helpers";

const payloadOf = (output: unknown): Record<string, unknown> | null => {
  const data = dataOf(output);
  return asRecord(data) ?? asRecord(output);
};

export const cellText = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return formatValue(value);
};

const toGrid = (value: unknown): unknown[][] =>
  asArray(value).map((row) => (Array.isArray(row) ? row : [row]));

export const spreadsheetIdOf = (
  output: unknown,
  input: unknown,
): string | null => {
  const payload = payloadOf(output);
  return (
    getString(payload, "spreadsheetId") ??
    getString(payload, "spreadsheet_id") ??
    getString(asRecord(input), "spreadsheet_id")
  );
};

export const spreadsheetTitleOf = (output: unknown): string | null => {
  const payload = payloadOf(output);
  const properties = asRecord(payload?.properties);
  return getString(properties, "title") ?? getString(payload, "title");
};

export const spreadsheetUrlOf = (output: unknown): string | null => {
  const payload = payloadOf(output);
  return (
    getString(payload, "spreadsheetUrl") ??
    getString(payload, "spreadsheet_url")
  );
};

export const rangeOf = (output: unknown, input: unknown): string | null => {
  const payload = payloadOf(output);
  return getString(payload, "range") ?? getString(asRecord(input), "range");
};

export const valuesOf = (output: unknown): unknown[][] => {
  const payload = payloadOf(output);
  if (!payload) return [];
  return toGrid(payload.values);
};

export interface SheetMeta {
  title: string | null;
  sheetId: number | null;
  index: number | null;
  rowCount: number | null;
  columnCount: number | null;
}

export const toSheet = (item: unknown): SheetMeta => {
  const record = asRecord(item) ?? {};
  const properties = asRecord(record.properties) ?? record;
  const grid = asRecord(properties.gridProperties);

  return {
    title: getString(properties, "title") ?? getString(record, "name"),
    sheetId: getNumber(properties, "sheetId"),
    index: getNumber(properties, "index"),
    rowCount: getNumber(grid, "rowCount"),
    columnCount: getNumber(grid, "columnCount"),
  };
};

export const sheetsOf = (output: unknown): SheetMeta[] => {
  const payload = payloadOf(output);
  if (!payload) return [];

  const sheets = recordsOf(payload.sheets);
  if (sheets.length > 0) return sheets.map(toSheet);

  const names = asArray(payload.sheet_names ?? payload.names ?? payload.sheets);
  return names
    .map((item): SheetMeta | null => {
      const title =
        typeof item === "string"
          ? item
          : (getString(asRecord(item), "title") ??
            getString(asRecord(item), "name"));
      if (!title) return null;
      return {
        title,
        sheetId: null,
        index: null,
        rowCount: null,
        columnCount: null,
      };
    })
    .filter((item): item is SheetMeta => item !== null);
};

export interface ValueRange {
  range: string | null;
  values: unknown[][];
}

export const valueRangesOf = (output: unknown): ValueRange[] => {
  const payload = payloadOf(output);
  if (!payload) return [];

  return recordsOf(payload.valueRanges ?? payload.value_ranges).map((item) => ({
    range: getString(item, "range"),
    values: toGrid(item.values),
  }));
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

export const formatDimensions = (
  rows: number | null,
  columns: number | null,
): string | null => {
  if (rows === null || columns === null) return null;
  return `${rows.toLocaleString()} × ${columns.toLocaleString()}`;
};

const NUMERIC = /^-?[\d,]*\.?\d+%?$/;

export const isNumericCell = (value: unknown, text: string): boolean =>
  typeof value === "number" || NUMERIC.test(text.trim());
