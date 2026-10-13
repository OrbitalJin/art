import type { FC } from "react";
import { EmptyNote, ResultBadge, SummaryRow } from "../../primitives";
import { countLines, formatCount } from "../../helpers";
import type { RendererProps } from "../../types";
import { pathOf } from "./helpers";
import { FileContent, FileName, FilePath } from "./parts";

interface ReadFileInput {
  folder: string;
  path: string;
}

export const ReadFileSummary: FC<RendererProps<ReadFileInput, string>> = ({
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

export const ReadFileDetail: FC<RendererProps<ReadFileInput, string>> = ({
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
