import type { FC } from "react";
import { FileText } from "lucide-react";
import type { z } from "zod";
import { fileToolSchemas } from "@/lib/ai/tools/files";
import {
  EmptyNote,
  ResultBadge,
  SummaryRow,
  countLines,
  formatCount,
} from "../../shared";
import { defineRenderer, type RendererProps } from "../../types";
import { pathOf } from "./helpers";
import { FileContent, FileName, FilePath } from "./parts";

type ReadFileInput = z.infer<typeof fileToolSchemas.read_file.input>;
type ReadFileOutput = z.infer<typeof fileToolSchemas.read_file.output>;

const Summary: FC<RendererProps<ReadFileInput, ReadFileOutput>> = ({
  input,
  output,
}) => {
  const { path } = pathOf(input);

  return (
    <SummaryRow>
      <FileName path={path} />
      {output !== null ? (
        <ResultBadge>{formatCount(countLines(output), "line")}</ResultBadge>
      ) : null}
    </SummaryRow>
  );
};

const Detail: FC<RendererProps<ReadFileInput, ReadFileOutput>> = ({
  input,
  output,
}) => {
  const { folder, path } = pathOf(input);

  return (
    <div className="flex flex-col gap-2.5">
      <FilePath folder={folder} path={path} />
      {output !== null ? (
        <FileContent text={output} />
      ) : (
        <EmptyNote>Waiting…</EmptyNote>
      )}
    </div>
  );
};

export const renderer = defineRenderer<ReadFileInput, ReadFileOutput>({
  icon: FileText,
  title: "Read file",
  executingTitle: "Reading file",
  inputSchema: fileToolSchemas.read_file.input,
  outputSchema: fileToolSchemas.read_file.output,
  Summary,
  Detail,
});
