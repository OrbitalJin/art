import { FileSpreadsheet, List, Table } from "lucide-react";
import type { ToolRenderer } from "../../types";
import {
  BatchGetDetail,
  SheetNamesDetail,
  SpreadsheetInfoDetail,
  ValuesDetail,
} from "./details";
import {
  BatchGetSummary,
  SheetNamesSummary,
  SpreadsheetInfoSummary,
  ValuesSummary,
} from "./summaries";

export const googlesheetsRenderers: Record<string, ToolRenderer> = {
  GOOGLESHEETS_GET_SPREADSHEET_INFO: {
    icon: FileSpreadsheet,
    title: "Spreadsheet info",
    Summary: SpreadsheetInfoSummary,
    Detail: SpreadsheetInfoDetail,
  },
  GOOGLESHEETS_GET_SHEET_NAMES: {
    icon: List,
    title: "Listed sheets",
    Summary: SheetNamesSummary,
    Detail: SheetNamesDetail,
  },
  GOOGLESHEETS_VALUES_GET: {
    icon: Table,
    title: "Read range",
    Summary: ValuesSummary,
    Detail: ValuesDetail,
  },
  GOOGLESHEETS_BATCH_GET: {
    icon: Table,
    title: "Read ranges",
    Summary: BatchGetSummary,
    Detail: BatchGetDetail,
  },
};
