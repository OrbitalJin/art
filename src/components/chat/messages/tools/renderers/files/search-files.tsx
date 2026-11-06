import type { FC } from "react";
import { FileSearch } from "lucide-react";
import type { z } from "zod";
import { fileToolSchemas } from "@/lib/ai/tools/files";
import {
  EmptyNote,
  ResultBadge,
  RowList,
  SummaryRow,
  SummaryText,
  formatCount,
} from "../../shared";
import { defineRenderer, type RendererProps } from "../../types";
import { FilePath } from "./parts";

type SearchFilesInput = z.infer<typeof fileToolSchemas.search_files.input>;
type SearchFilesOutput = z.infer<typeof fileToolSchemas.search_files.output>;

const Summary: FC<RendererProps<SearchFilesInput, SearchFilesOutput>> = ({
  input,
  output,
  block,
}) => (
  <SummaryRow>
    <SummaryText mono title={input?.glob ?? undefined}>
      {input?.glob ?? "all files"}
    </SummaryText>
    {block.state !== "executing" ? (
      <ResultBadge>{formatCount(output?.length ?? 0, "file")}</ResultBadge>
    ) : null}
  </SummaryRow>
);

const Detail: FC<RendererProps<SearchFilesInput, SearchFilesOutput>> = ({
  input,
  output,
  block,
}) => {
  const hits = output ?? [];

  return (
    <div className="flex flex-col gap-2.5">
      <FilePath folder={input?.folder ?? null} path={null} />
      {hits.length > 0 ? (
        <RowList maxHeightClass="max-h-56">
          {hits.map((hit, index) => (
            <li
              key={`${hit.path}-${index}`}
              className="py-1 font-mono text-[11px] break-all text-foreground/80"
            >
              {hit.path}
            </li>
          ))}
        </RowList>
      ) : (
        <EmptyNote>
          {block.state === "executing" ? "Waiting…" : "No matches."}
        </EmptyNote>
      )}
    </div>
  );
};

export const renderer = defineRenderer<SearchFilesInput, SearchFilesOutput>({
  icon: FileSearch,
  title: "Searched files",
  executingTitle: "Searching files",
  inputSchema: fileToolSchemas.search_files.input,
  outputSchema: fileToolSchemas.search_files.output,
  Summary,
  Detail,
});
