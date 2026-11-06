import type { FC } from "react";
import { Search } from "lucide-react";
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

type GrepFilesInput = z.infer<typeof fileToolSchemas.grep_files.input>;
type GrepFilesOutput = z.infer<typeof fileToolSchemas.grep_files.output>;

const Summary: FC<RendererProps<GrepFilesInput, GrepFilesOutput>> = ({
  input,
  output,
  block,
}) => (
  <SummaryRow>
    <SummaryText mono title={input?.pattern ?? undefined}>
      {input?.pattern ?? "—"}
    </SummaryText>
    {block.state !== "executing" ? (
      <ResultBadge>{formatCount(output?.length ?? 0, "match")}</ResultBadge>
    ) : null}
  </SummaryRow>
);

const Detail: FC<RendererProps<GrepFilesInput, GrepFilesOutput>> = ({
  input,
  output,
  block,
}) => {
  const hits = output ?? [];

  return (
    <div className="flex flex-col gap-2.5">
      <FilePath folder={input?.folder ?? null} path={null} />
      {hits.length > 0 ? (
        <RowList maxHeightClass="max-h-72">
          {hits.map((hit, index) => (
            <li
              key={`${hit.path}-${hit.line}-${index}`}
              className="flex flex-col gap-0.5 py-1.5"
            >
              <span className="font-mono text-[10px] break-all text-muted-foreground/50">
                {hit.path}:{hit.line}
              </span>
              <span className="font-mono text-[11px] break-all whitespace-pre-wrap text-foreground/80">
                {hit.text}
              </span>
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

export const renderer = defineRenderer<GrepFilesInput, GrepFilesOutput>({
  icon: Search,
  title: "Searched contents",
  executingTitle: "Searching contents",
  inputSchema: fileToolSchemas.grep_files.input,
  outputSchema: fileToolSchemas.grep_files.output,
  Summary,
  Detail,
});
