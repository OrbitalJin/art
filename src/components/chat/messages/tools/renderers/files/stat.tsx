import type { FC } from "react";
import { Info } from "lucide-react";
import { fileToolSchemas } from "@/lib/ai/tools/files";
import {
  EmptyNote,
  KeyValueList,
  ResultBadge,
  SummaryRow,
  formatBytes,
} from "../../shared";
import type { RendererProps, ToolRenderer } from "../../types";
import { pathOf } from "./helpers";
import { FileName, FilePath } from "./parts";

interface StatInput {
  folder: string;
  path?: string;
}

interface StatOutput {
  isFile: boolean;
  isDirectory: boolean;
  isSymlink: boolean;
  size: number;
  mtime: number | null;
  readonly: boolean;
}

const Summary: FC<RendererProps<StatInput, StatOutput>> = ({
  input,
  output,
}) => {
  const { path } = pathOf(input);

  return (
    <SummaryRow>
      <FileName path={path} />
      {output ? <ResultBadge>{formatBytes(output.size)}</ResultBadge> : null}
    </SummaryRow>
  );
};

const Detail: FC<RendererProps<StatInput, StatOutput>> = ({
  input,
  output,
}) => {
  const { folder, path } = pathOf(input);
  const type = output?.isDirectory ? "Directory" : "File";
  const modified = output?.mtime
    ? new Date(output.mtime).toLocaleString()
    : "—";
  const readOnly = output?.readonly ? "Yes" : "No";

  return (
    <div className="flex flex-col gap-2.5">
      <FilePath folder={folder} path={path} />
      {output ? (
        <KeyValueList
          entries={[
            { label: "Type", value: type },
            { label: "Size", value: formatBytes(output.size) },
            { label: "Modified", value: modified },
            { label: "Read only", value: readOnly },
          ]}
        />
      ) : (
        <EmptyNote>Waiting…</EmptyNote>
      )}
    </div>
  );
};

export const renderer: ToolRenderer<StatInput, StatOutput> = {
  icon: Info,
  title: "Inspected path",
  executingTitle: "Inspecting path",
  inputSchema: fileToolSchemas.stat.input,
  outputSchema: fileToolSchemas.stat.output,
  Summary,
  Detail,
};
