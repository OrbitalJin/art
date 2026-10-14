import { z } from "zod";

/**
 * Google Sheets renderers consume Composio's Vercel tools directly, so the raw
 * tool output is the execution envelope `{ data, error, successful, logId }`.
 * We parse the envelope once here and normalize `data` into the shapes the
 * sheets parts render, keeping the UI decoupled from the backend payload.
 */
const envelope = <T extends z.ZodTypeAny>(data: T) =>
  z.object({
    data,
    error: z.string().nullish(),
    successful: z.boolean().optional(),
    logId: z.string().nullish(),
  });

const grid = z.array(z.unknown()).nullish();

/** Normalizes a raw grid into rows, tolerating non-array rows. */
const toGrid = (value: unknown): unknown[][] => {
  if (!Array.isArray(value)) return [];
  return value.map((row) => (Array.isArray(row) ? row : [row]));
};

export interface SheetMeta {
  title: string | null;
  sheetId: number | null;
  index: number | null;
  rowCount: number | null;
  columnCount: number | null;
}

/* Inputs */

export const sheetsSpreadsheetIdInput = z
  .object({ spreadsheet_id: z.string().optional() })
  .loose();
export type SheetsSpreadsheetIdInput = z.infer<
  typeof sheetsSpreadsheetIdInput
>;

export const sheetsValuesGetInput = z
  .object({
    spreadsheet_id: z.string().optional(),
    range: z.string().optional(),
  })
  .loose();
export type SheetsValuesGetInput = z.infer<typeof sheetsValuesGetInput>;

export const sheetsBatchGetInput = z
  .object({
    spreadsheet_id: z.string().optional(),
    ranges: z.array(z.string()).optional(),
  })
  .loose();
export type SheetsBatchGetInput = z.infer<typeof sheetsBatchGetInput>;

export const sheetsSearchInput = z
  .object({ query: z.string().optional() })
  .loose();
export type SheetsSearchInput = z.infer<typeof sheetsSearchInput>;

export const sheetsLookupInput = z
  .object({
    spreadsheet_id: z.string().optional(),
    query: z.string().optional(),
    range: z.string().optional(),
  })
  .loose();
export type SheetsLookupInput = z.infer<typeof sheetsLookupInput>;

/* Outputs */

const sheetSchema = z
  .object({
    properties: z
      .object({
        title: z.string().nullish(),
        sheetId: z.number().nullish(),
        index: z.number().nullish(),
        gridProperties: z
          .object({
            rowCount: z.number().nullish(),
            columnCount: z.number().nullish(),
          })
          .loose()
          .nullish(),
      })
      .loose()
      .nullish(),
  })
  .loose();

export const spreadsheetInfoOutputSchema = envelope(
  z
    .object({
      spreadsheetId: z.string().nullish(),
      spreadsheetUrl: z.string().nullish(),
      display_url: z.string().nullish(),
      properties: z.object({ title: z.string().nullish() }).loose().nullish(),
      sheets: z.array(sheetSchema).nullish(),
    })
    .loose(),
).transform(({ data }) => ({
  id: data.spreadsheetId ?? null,
  title: data.properties?.title ?? null,
  url: data.spreadsheetUrl ?? data.display_url ?? null,
  sheets: (data.sheets ?? []).map((sheet): SheetMeta => {
    const properties = sheet.properties;
    return {
      title: properties?.title ?? null,
      sheetId: properties?.sheetId ?? null,
      index: properties?.index ?? null,
      rowCount: properties?.gridProperties?.rowCount ?? null,
      columnCount: properties?.gridProperties?.columnCount ?? null,
    };
  }),
}));
export type SpreadsheetInfoOutput = z.infer<typeof spreadsheetInfoOutputSchema>;

export const sheetNamesOutputSchema = envelope(
  z
    .object({
      sheet_names: z.array(z.string()).nullish(),
      sheets: z.array(z.string()).nullish(),
      display_url: z.string().nullish(),
    })
    .loose(),
).transform(({ data }) => ({
  sheets: (data.sheet_names ?? data.sheets ?? []).map(
    (title): SheetMeta => ({
      title,
      sheetId: null,
      index: null,
      rowCount: null,
      columnCount: null,
    }),
  ),
}));
export type SheetNamesOutput = z.infer<typeof sheetNamesOutputSchema>;

export const valuesOutputSchema = envelope(
  z
    .object({
      range: z.string().nullish(),
      values: grid,
      display_url: z.string().nullish(),
    })
    .loose(),
).transform(({ data }) => ({
  range: data.range ?? null,
  values: toGrid(data.values),
}));
export type ValuesOutput = z.infer<typeof valuesOutputSchema>;

export interface ValueRange {
  range: string | null;
  values: unknown[][];
}

export const batchGetOutputSchema = envelope(
  z
    .object({
      valueRanges: z
        .array(
          z
            .object({ range: z.string().nullish(), values: grid })
            .loose(),
        )
        .nullish(),
    })
    .loose(),
).transform(({ data }) => ({
  ranges: (data.valueRanges ?? []).map(
    (entry): ValueRange => ({
      range: entry.range ?? null,
      values: toGrid(entry.values),
    }),
  ),
}));
export type BatchGetOutput = z.infer<typeof batchGetOutputSchema>;

export interface SpreadsheetRef {
  id: string | null;
  name: string | null;
}

export const searchOutputSchema = envelope(
  z
    .object({
      spreadsheets: z
        .array(
          z
            .object({
              id: z.string().nullish(),
              name: z.string().nullish(),
            })
            .loose(),
        )
        .nullish(),
    })
    .loose(),
).transform(({ data }) => ({
  spreadsheets: (data.spreadsheets ?? []).map(
    (spreadsheet): SpreadsheetRef => ({
      id: spreadsheet.id ?? null,
      name: spreadsheet.name ?? null,
    }),
  ),
}));
export type SearchOutput = z.infer<typeof searchOutputSchema>;

export const lookupOutputSchema = envelope(
  z
    .object({
      row_data: z
        .object({
          found: z.boolean().nullish(),
          row_data: z.array(z.string()).nullish(),
        })
        .loose()
        .nullish(),
      display_url: z.string().nullish(),
    })
    .loose(),
).transform(({ data }) => ({
  found: data.row_data?.found ?? false,
  row: data.row_data?.row_data ?? [],
  url: data.display_url ?? null,
}));
export type LookupOutput = z.infer<typeof lookupOutputSchema>;
