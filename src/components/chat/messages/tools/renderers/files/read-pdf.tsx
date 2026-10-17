import type { FC } from "react";
import { FileType2 } from "lucide-react";
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

interface ReadMediaInput {
  folder: string;
  path: string;
}

interface MediaOutput {
  name: string;
  mediaType: string;
  size: number;
  base64: string;
}

const Summary: FC<RendererProps<ReadMediaInput, MediaOutput>> = ({
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

const Detail: FC<RendererProps<ReadMediaInput, MediaOutput>> = ({
  input,
  output,
}) => {
  const { folder, path } = pathOf(input);

  if (!output) {
    return (
      <div className="flex flex-col gap-2.5">
        <FilePath folder={folder} path={path} />
        <EmptyNote>Waiting…</EmptyNote>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <FilePath folder={folder} path={path} />
      <KeyValueList
        entries={[
          { label: "Type", value: output.mediaType },
          { label: "Size", value: formatBytes(output.size) },
        ]}
      />
      <EmptyNote>PDF sent to the model.</EmptyNote>
    </div>
  );
};

export const renderer: ToolRenderer<ReadMediaInput, MediaOutput> = {
  icon: FileType2,
  title: "Read PDF",
  executingTitle: "Reading PDF",
  inputSchema: fileToolSchemas.read_pdf.input,
  outputSchema: fileToolSchemas.read_pdf.output,
  Summary,
  Detail,
};
