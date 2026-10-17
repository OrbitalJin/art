import type { ToolRenderer } from "../../types";
import { renderer as batchGet } from "./batch-get";
import { renderer as getSheetNames } from "./get-sheet-names";
import { renderer as getSpreadsheetInfo } from "./get-spreadsheet-info";
import { renderer as lookupRow } from "./lookup-row";
import { renderer as searchSpreadsheets } from "./search-spreadsheets";
import { renderer as valuesGet } from "./values-get";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRenderer = ToolRenderer<any, any>;

export const googlesheetsRenderers = {
  GOOGLESHEETS_GET_SPREADSHEET_INFO: getSpreadsheetInfo,
  GOOGLESHEETS_GET_SHEET_NAMES: getSheetNames,
  GOOGLESHEETS_VALUES_GET: valuesGet,
  GOOGLESHEETS_BATCH_GET: batchGet,
  GOOGLESHEETS_SEARCH_SPREADSHEETS: searchSpreadsheets,
  GOOGLESHEETS_LOOKUP_SPREADSHEET_ROW: lookupRow,
} satisfies Record<string, AnyRenderer>;
