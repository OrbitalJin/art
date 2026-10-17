import type { FC } from "react";
import { FileSpreadsheet } from "lucide-react";
import {
  CountSummary,
  DetailGate,
  DetailTitle,
  EmptyNote,
  HeaderLine,
  SectionLabel,
  formatCount,
} from "../../shared";
import type { RendererProps, ToolRenderer } from "../../types";
import { formatDimensions } from "./helpers";
import {
  sheetsSpreadsheetIdInput,
  spreadsheetInfoOutputSchema,
} from "./schema";
import type {
  SheetMeta,
  SheetsSpreadsheetIdInput,
  SpreadsheetInfoOutput,
} from "./schema";

const SheetRow: FC<{ sheet: SheetMeta; index: number }> = ({
  sheet,
  index,
}) => {
  const name = sheet.title ?? `Sheet ${index + 1}`;
  const dimensions = formatDimensions(sheet.rowCount, sheet.columnCount);
  const meta =
    dimensions ?? (sheet.sheetId !== null ? `gid ${sheet.sheetId}` : null);

  return (
    <div className="flex min-w-0 items-baseline gap-2">
      <span
        className="min-w-0 truncate text-[12px] font-medium text-foreground/80"
        title={name}
      >
        {name}
      </span>
      {meta ? (
        <span className="ml-auto shrink-0 text-[10px] tabular-nums text-muted-foreground/50">
          {meta}
        </span>
      ) : null}
    </div>
  );
};

const Summary: FC<
  RendererProps<SheetsSpreadsheetIdInput, SpreadsheetInfoOutput>
> = ({ block, output }) => (
  <CountSummary
    block={block}
    label={output?.title ?? output?.id ?? null}
    count={output?.sheets.length ?? 0}
    noun="sheet"
  />
);

const Detail: FC<
  RendererProps<SheetsSpreadsheetIdInput, SpreadsheetInfoOutput>
> = ({ block, output }) => (
  <DetailGate block={block} executingLabel="Loading…">
    {(() => {
      const info = output;
      if (!info) return <EmptyNote>No spreadsheet returned.</EmptyNote>;

      const sheets = info.sheets;
      if (!info.title && !info.id && !info.url && sheets.length === 0) {
        return <EmptyNote>No spreadsheet returned.</EmptyNote>;
      }

      return (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2.5">
            <DetailTitle title={info.title ?? "Untitled spreadsheet"} />

            <div className="flex flex-col gap-1">
              {info.url ? (
                <HeaderLine label="URL">
                  <a
                    href={info.url}
                    target="_blank"
                    rel="noreferrer"
                    className="outline-none hover:text-primary hover:underline focus-visible:underline"
                  >
                    {info.url}
                  </a>
                </HeaderLine>
              ) : null}
              {info.id ? (
                <HeaderLine label="ID" mono>
                  {info.id}
                </HeaderLine>
              ) : null}
            </div>
          </div>

          {sheets.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <SectionLabel>{formatCount(sheets.length, "sheet")}</SectionLabel>
              <div className="flex flex-col gap-1.5">
                {sheets.map((sheet, index) => (
                  <SheetRow
                    key={sheet.sheetId ?? index}
                    sheet={sheet}
                    index={index}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      );
    })()}
  </DetailGate>
);

export const renderer: ToolRenderer<
  SheetsSpreadsheetIdInput,
  SpreadsheetInfoOutput
> = {
  icon: FileSpreadsheet,
  title: "Spreadsheet info",
  executingTitle: "Reading spreadsheet",
  inputSchema: sheetsSpreadsheetIdInput,
  outputSchema: spreadsheetInfoOutputSchema,
  Summary,
  Detail,
};
