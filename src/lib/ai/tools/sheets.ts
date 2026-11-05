import { tool, type ToolSet } from "ai";
import { z } from "zod";
import Papa from "papaparse";
import { nativeFetch } from "@/lib/native-fetch";

export const READ_SHEET_TOOL_NAME = "read_sheet";

const MAX_ROWS = 500;
const MAX_COLUMNS = 100;

export const readSheetInputSchema = z.object({
  url: z
    .string()
    .min(1)
    .describe(
      "A Google Sheets share link (or bare spreadsheet id). The sheet must be " +
        "shared as 'Anyone with the link can view'.",
    ),
  sheet: z
    .string()
    .optional()
    .describe("Tab name to read. Omit to read the first tab."),
  range: z
    .string()
    .optional()
    .describe("A1-notation range, e.g. 'A1:D10'. Omit to read the whole tab."),
  asObjects: z
    .boolean()
    .optional()
    .describe(
      "When true, treat the first row as headers and also return rows keyed by " +
        "those headers. Defaults to false.",
    ),
});

export type ReadSheetInput = z.infer<typeof readSheetInputSchema>;

export const readSheetOutputSchema = z.object({
  spreadsheetId: z.string().nullable(),
  sheet: z.string().nullable(),
  range: z.string().nullable(),
  asObjects: z.boolean(),
  headers: z.array(z.string()).nullable(),
  rows: z.array(z.array(z.string())),
  objects: z.array(z.record(z.string(), z.string())).nullable(),
  rowCount: z.number(),
  truncated: z.boolean(),
  error: z.string().optional(),
});

export type ReadSheetOutput = z.infer<typeof readSheetOutputSchema>;

export const extractSpreadsheetId = (input: string): string => {
  const match = input.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : input.trim();
};

const fetchCsv = async (
  spreadsheetId: string,
  sheet: string | undefined,
  range: string | undefined,
): Promise<string> => {
  const params = new URLSearchParams({ tqx: "out:csv" });
  if (sheet) params.set("sheet", sheet);
  if (range) params.set("range", range);

  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?${params.toString()}`;
  const response = await nativeFetch(url);
  const contentType = response.headers.get("content-type") ?? "";

  // Private sheets return an HTML login page instead of CSV.
  if (!response.ok || !contentType.includes("text/csv")) {
    throw new Error(
      "Could not read the sheet. Make sure it is shared as " +
        "'Anyone with the link can view'.",
    );
  }

  return response.text();
};

const EMPTY: ReadSheetOutput = {
  spreadsheetId: null,
  sheet: null,
  range: null,
  asObjects: false,
  headers: null,
  rows: [],
  objects: null,
  rowCount: 0,
  truncated: false,
};

const failure = (
  input: Partial<ReadSheetInput>,
  spreadsheetId: string | null,
  error: string,
): ReadSheetOutput => ({
  ...EMPTY,
  spreadsheetId,
  sheet: input.sheet ?? null,
  range: input.range ?? null,
  asObjects: input.asObjects ?? false,
  error,
});

const capRows = (
  rows: string[][],
): { rows: string[][]; truncated: boolean } => {
  const clipped = rows
    .slice(0, MAX_ROWS)
    .map((row) => row.slice(0, MAX_COLUMNS));
  const truncated =
    rows.length > MAX_ROWS || rows.some((row) => row.length > MAX_COLUMNS);
  return { rows: clipped, truncated };
};

const readSheet = async (input: ReadSheetInput): Promise<ReadSheetOutput> => {
  const spreadsheetId = extractSpreadsheetId(input.url);
  if (!spreadsheetId) {
    return failure(input, null, "No spreadsheet id found in that link.");
  }

  let csv: string;
  try {
    csv = await fetchCsv(spreadsheetId, input.sheet, input.range);
  } catch (error) {
    return failure(input, spreadsheetId, String(error).slice(0, 300));
  }

  const parsed = Papa.parse<string[]>(csv, { skipEmptyLines: true });
  if (parsed.errors.length > 0) {
    return failure(
      input,
      spreadsheetId,
      `CSV parse error: ${parsed.errors[0].message}`,
    );
  }

  const { rows, truncated } = capRows(parsed.data);
  const headers = rows[0] ?? [];

  let objects: Record<string, string>[] | null = null;
  if (input.asObjects) {
    const keyed = Papa.parse<Record<string, string>>(csv, {
      header: true,
      skipEmptyLines: true,
    });
    if (keyed.errors.length > 0) {
      return failure(
        input,
        spreadsheetId,
        `CSV parse error: ${keyed.errors[0].message}`,
      );
    }
    objects = keyed.data.slice(0, MAX_ROWS);
  }

  return {
    spreadsheetId,
    sheet: input.sheet ?? null,
    range: input.range ?? null,
    asObjects: input.asObjects ?? false,
    headers: headers.length ? headers : null,
    rows,
    objects,
    rowCount: rows.length,
    truncated,
  };
};

const description =
  'Read data from a Google Sheet the user has shared with "Anyone with the ' +
  'link can view". Pass the share link as `url` (a bare spreadsheet id also ' +
  "works). Optionally scope to a tab with `sheet` and an A1 range with " +
  "`range`, and set `asObjects` to get rows keyed by the header row. Read-only: " +
  "this cannot edit the sheet. If it returns an error, the sheet is probably " +
  "not link-shared.";

export const sheetsTools = (): ToolSet => ({
  [READ_SHEET_TOOL_NAME]: tool({
    title: "Read sheet",
    description,
    inputSchema: readSheetInputSchema,
    outputSchema: readSheetOutputSchema,
    execute: async (input: ReadSheetInput) => readSheet(input),
  }),
});

export type SheetsToolName = keyof ReturnType<typeof sheetsTools>;
