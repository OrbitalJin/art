import type { FC } from "react";
import { DiffPanel, EmptyNote, ResultBadge, SummaryRow } from "../../primitives";
import { countLines } from "../../helpers";
import type { RendererProps } from "../../types";
import { pathOf } from "./helpers";
import { FileName, FilePath } from "./parts";

interface WriteFileInput {
  folder: string;
  path: string;
  content: string;
  append?: boolean;
}

export const WriteFileSummary: FC<RendererProps<WriteFileInput, unknown>> = ({
  input,
}) => {
  const { path } = pathOf(input);
  const content = input?.content ?? null;

  return (
    <SummaryRow>
      <FileName path={path} />
      {content ? (
        <ResultBadge tone="success">+{countLines(content)}</ResultBadge>
      ) : null}
      {input?.append ? <ResultBadge>append</ResultBadge> : null}
    </SummaryRow>
  );
};

export const WriteFileDetail: FC<RendererProps<WriteFileInput, unknown>> = ({
  input,
}) => {
  const { folder, path } = pathOf(input);
  const content = input?.content ?? null;

  return (
    <div className="flex flex-col gap-2.5">
      <FilePath folder={folder} path={path} />
      {content ? (
        <DiffPanel added={content} />
      ) : (
        <EmptyNote>Waiting…</EmptyNote>
      )}
    </div>
  );
};
