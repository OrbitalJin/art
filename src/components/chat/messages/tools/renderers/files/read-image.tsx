import type { FC } from "react";
import { Image as ImageIcon } from "lucide-react";
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
      {output.mediaType.startsWith("image/") ? (
        <img
          src={`data:${output.mediaType};base64,${output.base64}`}
          alt={path ?? "image"}
          className="max-h-80 w-auto max-w-full self-start rounded-md border border-border/40 object-contain"
        />
      ) : null}
    </div>
  );
};

export const renderer: ToolRenderer<ReadMediaInput, MediaOutput> = {
  icon: ImageIcon,
  title: "Read image",
  executingTitle: "Reading image",
  inputSchema: fileToolSchemas.read_image.input,
  outputSchema: fileToolSchemas.read_image.output,
  Summary,
  Detail,
};
