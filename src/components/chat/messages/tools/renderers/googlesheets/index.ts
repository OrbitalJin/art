import { FileSpreadsheet, List, Search, Table } from "lucide-react";
import type { ToolRenderer } from "../../types";
import {
  batchValuesOutput,
  sheetNamesOutput,
  spreadsheetInfoOutput,
  spreadsheetsOutput,
  valuesOutput,
  type GooglesheetsToolName,
} from "@/lib/ai/tools/googlesheets";
import {
  BatchGetDetail,
  SearchDetail,
  SheetNamesDetail,
  SpreadsheetInfoDetail,
  ValuesDetail,
} from "./details";
import {
  BatchGetSummary,
  SearchSummary,
  SheetNamesSummary,
  SpreadsheetInfoSummary,
  ValuesSummary,
} from "./summaries";

export const googlesheetsRenderers = {
  googlesheets_spreadsheet_info: {
    icon: FileSpreadsheet,
    title: "Spreadsheet info",
    schema: spreadsheetInfoOutput,
    Summary: SpreadsheetInfoSummary,
    Detail: SpreadsheetInfoDetail,
  },
  googlesheets_sheet_names: {
    icon: List,
    title: "Listed sheets",
    schema: sheetNamesOutput,
    Summary: SheetNamesSummary,
    Detail: SheetNamesDetail,
  },
  googlesheets_values_get: {
    icon: Table,
    title: "Read range",
    schema: valuesOutput,
    Summary: ValuesSummary,
    Detail: ValuesDetail,
  },
  googlesheets_batch_get: {
    icon: Table,
    title: "Read ranges",
    schema: batchValuesOutput,
    Summary: BatchGetSummary,
    Detail: BatchGetDetail,
  },
  googlesheets_search: {
    icon: Search,
    title: "Searched Sheets",
    schema: spreadsheetsOutput,
    Summary: SearchSummary,
    Detail: SearchDetail,
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} satisfies Partial<Record<GooglesheetsToolName, ToolRenderer<any>>>;
