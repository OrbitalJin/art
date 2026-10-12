import { z } from "zod";
import { composioTool } from "./composio/define";
import { failed } from "./composio/output";
import {
  asArray,
  asNumber,
  asRecord,
  asString,
  recordsOf,
} from "@/lib/utils/coerce";

/**
 * Google Sheets tools backed by Composio. Each tool declares its input and
 * output schema and normalizes Composio's raw Sheets payload into the output
 * shape.
 */

export const sheetMetaSchema = z.object({
  title: z.string().nullable(),
  sheetId: z.number().nullable(),
  index: z.number().nullable(),
  rowCount: z.number().nullable(),
  columnCount: z.number().nullable(),
});

export type SheetMeta = z.infer<typeof sheetMetaSchema>;

export const valueRangeSchema = z.object({
  range: z.string().nullable(),
  values: z.array(z.array(z.unknown())),
});

export type ValueRange = z.infer<typeof valueRangeSchema>;

export const spreadsheetRefSchema = z.object({
  id: z.string().nullable(),
  name: z.string().nullable(),
});

export type SpreadsheetRef = z.infer<typeof spreadsheetRefSchema>;

export const spreadsheetInfoSchema = z.object({
  id: z.string().nullable(),
  title: z.string().nullable(),
  url: z.string().nullable(),
});

export type SpreadsheetInfo = z.infer<typeof spreadsheetInfoSchema>;

export const spreadsheetInfoOutput = z.object({
  spreadsheet: spreadsheetInfoSchema,
  sheets: z.array(sheetMetaSchema),
  error: z.string().optional(),
});

export const sheetNamesOutput = z.object({
  sheets: z.array(sheetMetaSchema),
  error: z.string().optional(),
});

export const valuesOutput = z.object({
  range: z.string().nullable(),
  values: z.array(z.array(z.unknown())),
  error: z.string().optional(),
});

export const batchValuesOutput = z.object({
  ranges: z.array(valueRangeSchema),
  error: z.string().optional(),
});

export const spreadsheetsOutput = z.object({
  spreadsheets: z.array(spreadsheetRefSchema),
  error: z.string().optional(),
});

export type SpreadsheetInfoOutput = z.infer<typeof spreadsheetInfoOutput>;
export type SheetNamesOutput = z.infer<typeof sheetNamesOutput>;
export type ValuesOutput = z.infer<typeof valuesOutput>;
export type BatchValuesOutput = z.infer<typeof batchValuesOutput>;
export type SpreadsheetsOutput = z.infer<typeof spreadsheetsOutput>;

const toGrid = (value: unknown): unknown[][] =>
  asArray(value).map((row) => (Array.isArray(row) ? row : [row]));

const toSheet = (item: unknown): SheetMeta => {
  const record = asRecord(item) ?? {};
  const properties = asRecord(record.properties) ?? record;
  const grid = asRecord(properties.gridProperties);

  return {
    title: asString(properties.title) ?? asString(record.name),
    sheetId: asNumber(properties.sheetId),
    index: asNumber(properties.index),
    rowCount: asNumber(grid?.rowCount),
    columnCount: asNumber(grid?.columnCount),
  };
};

const sheetsOf = (data: Record<string, unknown>): SheetMeta[] => {
  const sheets = recordsOf(data.sheets);
  if (sheets.length > 0) return sheets.map(toSheet);

  const names = asArray(data.sheet_names ?? data.names ?? data.sheets);
  return names
    .map((item): SheetMeta | null => {
      const title =
        typeof item === "string"
          ? item
          : (asString(asRecord(item)?.title) ?? asString(asRecord(item)?.name));
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

const valueRangesOf = (data: Record<string, unknown>): ValueRange[] =>
  recordsOf(data.valueRanges ?? data.value_ranges).map((item) => ({
    range: asString(item.range),
    values: toGrid(item.values),
  }));

const spreadsheetsOf = (data: Record<string, unknown>): SpreadsheetRef[] =>
  recordsOf(data.spreadsheets ?? data.files ?? data.items).map((item) => ({
    id:
      asString(item.id) ??
      asString(item.spreadsheetId) ??
      asString(item.spreadsheet_id),
    name: asString(item.name) ?? asString(item.title),
  }));

const spreadsheetIdHint = "The spreadsheet id from its URL.";

export const googlesheetsTools = () => ({
  googlesheets_spreadsheet_info: composioTool({
    slug: "GOOGLESHEETS_GET_SPREADSHEET_INFO",
    title: "Spreadsheet Info",
    description: "Get a spreadsheet's title, URL, and the list of its sheets.",
    inputSchema: z.object({
      spreadsheet_id: z.string().describe(spreadsheetIdHint),
    }),
    outputSchema: spreadsheetInfoOutput,
    map: (data) => {
      const properties = asRecord(data.properties);
      return {
        spreadsheet: {
          id: asString(data.spreadsheetId) ?? asString(data.spreadsheet_id),
          title: asString(properties?.title) ?? asString(data.title),
          url:
            asString(data.spreadsheetUrl) ?? asString(data.spreadsheet_url),
        },
        sheets: sheetsOf(data),
      };
    },
    errorResult: failed({
      spreadsheet: { id: null, title: null, url: null },
      sheets: [],
    }),
  }),

  googlesheets_sheet_names: composioTool({
    slug: "GOOGLESHEETS_GET_SHEET_NAMES",
    title: "List Sheets",
    description: "List the sheet (tab) names in a spreadsheet.",
    inputSchema: z.object({
      spreadsheet_id: z.string().describe(spreadsheetIdHint),
    }),
    outputSchema: sheetNamesOutput,
    map: (data) => ({ sheets: sheetsOf(data) }),
    errorResult: failed({ sheets: [] }),
  }),

  googlesheets_values_get: composioTool({
    slug: "GOOGLESHEETS_VALUES_GET",
    title: "Read Range",
    description:
      "Read values from a range in a spreadsheet, e.g. 'Sheet1!A1:D10'.",
    inputSchema: z.object({
      spreadsheet_id: z.string().describe(spreadsheetIdHint),
      range: z.string().describe("A1 notation range, e.g. 'Sheet1!A1:D10'."),
      major_dimension: z
        .enum(["ROWS", "COLUMNS"])
        .optional()
        .describe("Whether values are grouped by rows or columns."),
      value_render_option: z
        .enum(["FORMATTED_VALUE", "UNFORMATTED_VALUE", "FORMULA"])
        .optional(),
    }),
    outputSchema: valuesOutput,
    map: (data) => ({
      range: asString(data.range),
      values: toGrid(data.values),
    }),
    errorResult: failed({ range: null, values: [] }),
  }),

  googlesheets_batch_get: composioTool({
    slug: "GOOGLESHEETS_BATCH_GET",
    title: "Read Ranges",
    description: "Read values from multiple ranges in one spreadsheet.",
    inputSchema: z.object({
      spreadsheet_id: z.string().describe(spreadsheetIdHint),
      ranges: z
        .array(z.string())
        .describe("A1 notation ranges, e.g. ['Sheet1!A1:B5']."),
    }),
    outputSchema: batchValuesOutput,
    map: (data) => ({ ranges: valueRangesOf(data) }),
    errorResult: failed({ ranges: [] }),
  }),

  googlesheets_search: composioTool({
    slug: "GOOGLESHEETS_SEARCH_SPREADSHEETS",
    title: "Search Spreadsheets",
    description: "Search the user's Google Sheets by name.",
    inputSchema: z.object({
      query: z.string().describe("Search text."),
      max_results: z.number().int().min(1).max(100).optional(),
    }),
    outputSchema: spreadsheetsOutput,
    map: (data) => ({ spreadsheets: spreadsheetsOf(data) }),
    errorResult: failed({ spreadsheets: [] }),
  }),
});

export type GooglesheetsToolName = keyof ReturnType<typeof googlesheetsTools>;
