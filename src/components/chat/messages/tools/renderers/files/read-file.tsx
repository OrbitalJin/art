import type { FC } from "react";
import { FileText } from "lucide-react";
import { fileToolSchemas } from "@/lib/ai/tools/files";
import {
  EmptyNote,
  ResultBadge,
  SummaryRow,
  countLines,
  formatCount,
} from "../../shared";
import type { RendererProps, ToolRenderer } from "../../types";
import { pathOf } from "./helpers";
import { FileContent, FileName, FilePath } from "./parts";

interface ReadFileInput {
  folder: string;
  path: string;
}

const Summary: FC<RendererProps<ReadFileInput, string>> = ({
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

const Detail: FC<RendererProps<ReadFileInput, string>> = ({
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

export const renderer: ToolRenderer<ReadFileInput, string> = {
  icon: FileText,
  title: "Read file",
  executingTitle: "Reading file",
  inputSchema: fileToolSchemas.read_file.input,
  outputSchema: fileToolSchemas.read_file.output,
  Summary,
  Detail,
};
