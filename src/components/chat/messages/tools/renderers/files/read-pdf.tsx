import type { FC } from "react";
import { FileType2 } from "lucide-react";
import type { z } from "zod";
import { fileToolSchemas } from "@/lib/ai/tools/files";
import {
  EmptyNote,
  KeyValueList,
  ResultBadge,
  SummaryRow,
  formatBytes,
} from "../../shared";
import { defineRenderer, type RendererProps } from "../../types";
import { pathOf } from "./helpers";
import { FileName, FilePath } from "./parts";

type ReadMediaInput = z.infer<typeof fileToolSchemas.read_pdf.input>;
type MediaOutput = z.infer<typeof fileToolSchemas.read_pdf.output>;

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

export const renderer = defineRenderer<ReadMediaInput, MediaOutput>({
  icon: FileType2,
  title: "Read PDF",
  executingTitle: "Reading PDF",
  inputSchema: fileToolSchemas.read_pdf.input,
  outputSchema: fileToolSchemas.read_pdf.output,
  Summary,
  Detail,
});
