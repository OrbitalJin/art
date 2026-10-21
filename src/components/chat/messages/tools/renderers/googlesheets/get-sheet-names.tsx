import type { FC } from "react";
import { List } from "lucide-react";
import {
  Chip,
  CountSummary,
  DetailGate,
  EmptyNote,
} from "../../shared";
import { defineRenderer, type RendererProps } from "../../types";
import { sheetNamesOutputSchema, sheetsSpreadsheetIdInput } from "./schema";
import type { SheetNamesOutput, SheetsSpreadsheetIdInput } from "./schema";

const Summary: FC<RendererProps<SheetsSpreadsheetIdInput, SheetNamesOutput>> = ({
  block,
  output,
}) => {
  const sheets = output?.sheets ?? [];
  const names = sheets
    .map((sheet) => sheet.title)
    .filter((title): title is string => title !== null)
    .join(", ");

  return (
    <CountSummary
      block={block}
      label={names || null}
      count={sheets.length}
      noun="sheet"
    />
  );
};

const Detail: FC<RendererProps<SheetsSpreadsheetIdInput, SheetNamesOutput>> = ({
  block,
  output,
}) => {
  const sheets = output?.sheets ?? [];

  return (
    <DetailGate block={block} executingLabel="Loading…">
      {sheets.length === 0 ? (
        <EmptyNote>No sheets found.</EmptyNote>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {sheets.map((sheet, index) => (
            <Chip key={sheet.sheetId ?? index} title={sheet.title ?? undefined}>
              {sheet.title ?? `Sheet ${index + 1}`}
            </Chip>
          ))}
        </div>
      )}
    </DetailGate>
  );
};

export const renderer = defineRenderer<
  SheetsSpreadsheetIdInput,
  SheetNamesOutput
>({
  icon: List,
  title: "Listed sheets",
  executingTitle: "Listing sheets",
  inputSchema: sheetsSpreadsheetIdInput,
  outputSchema: sheetNamesOutputSchema,
  Summary,
  Detail,
});
