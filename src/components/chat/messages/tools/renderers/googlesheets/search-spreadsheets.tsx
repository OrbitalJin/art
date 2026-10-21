import type { FC } from "react";
import { Search } from "lucide-react";
import {
  CountSummary,
  DetailGate,
  EmptyNote,
  ListRow,
  RowList,
} from "../../shared";
import { defineRenderer, type RendererProps } from "../../types";
import { searchOutputSchema, sheetsSearchInput } from "./schema";
import type {
  SearchOutput,
  SheetsSearchInput,
  SpreadsheetRef,
} from "./schema";

const SpreadsheetRow: FC<{
  spreadsheet: SpreadsheetRef;
  index: number;
}> = ({ spreadsheet, index }) => {
  const name =
    spreadsheet.name ?? spreadsheet.id ?? `Spreadsheet ${index + 1}`;

  return (
    <ListRow>
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="min-w-0 truncate text-[12px] font-medium text-foreground/80"
          title={name}
        >
          {name}
        </span>
        {spreadsheet.id ? (
          <span className="ml-auto shrink-0 font-mono text-[10px] text-muted-foreground/50">
            {spreadsheet.id}
          </span>
        ) : null}
      </div>
    </ListRow>
  );
};

const Summary: FC<RendererProps<SheetsSearchInput, SearchOutput>> = ({
  block,
  input,
  output,
}) => (
  <CountSummary
    block={block}
    label={input?.query ?? null}
    count={output?.spreadsheets.length ?? 0}
    noun="spreadsheet"
  />
);

const Detail: FC<RendererProps<SheetsSearchInput, SearchOutput>> = ({
  block,
  output,
}) => {
  const spreadsheets = output?.spreadsheets ?? [];

  return (
    <DetailGate block={block} executingLabel="Searching…">
      {spreadsheets.length === 0 ? (
        <EmptyNote>No spreadsheets found.</EmptyNote>
      ) : (
        <RowList maxHeightClass="max-h-72">
          {spreadsheets.map((spreadsheet, index) => (
            <SpreadsheetRow
              key={spreadsheet.id ?? index}
              spreadsheet={spreadsheet}
              index={index}
            />
          ))}
        </RowList>
      )}
    </DetailGate>
  );
};

export const renderer = defineRenderer<SheetsSearchInput, SearchOutput>({
  icon: Search,
  title: "Searched Sheets",
  executingTitle: "Searching Sheets",
  inputSchema: sheetsSearchInput,
  outputSchema: searchOutputSchema,
  Summary,
  Detail,
});
