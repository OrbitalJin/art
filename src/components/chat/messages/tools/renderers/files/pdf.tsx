import type { FC } from "react";
import {
  EmptyNote,
  KeyValueList,
  ResultBadge,
  SummaryRow,
} from "../../primitives";
import { formatBytes } from "../../helpers";
import type { RendererProps } from "../../types";
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

export const ReadPdfSummary: FC<RendererProps<ReadMediaInput, MediaOutput>> = ({
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

export const ReadPdfDetail: FC<RendererProps<ReadMediaInput, MediaOutput>> = ({
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
