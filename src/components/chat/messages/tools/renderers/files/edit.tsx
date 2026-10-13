import type { FC } from "react";
import { DiffPanel, EmptyNote, ResultBadge, SummaryRow } from "../../primitives";
import { countLines, formatCount } from "../../helpers";
import type { RendererProps } from "../../types";
import { pathOf } from "./helpers";
import { FileName, FilePath } from "./parts";

interface EditFileInput {
  folder: string;
  path: string;
  old: string;
  new: string;
  replaceAll?: boolean;
}

interface EditFileOutput {
  success: true;
  replacements: number;
}

export const EditFileSummary: FC<RendererProps<EditFileInput, EditFileOutput>> =
  ({ input }) => {
    const { path } = pathOf(input);
    const removed = input?.old ? countLines(input.old) : 0;
    const added = input?.new ? countLines(input.new) : 0;

    return (
      <SummaryRow>
        <FileName path={path} />
        {removed > 0 ? (
          <ResultBadge tone="error">−{removed}</ResultBadge>
        ) : null}
        {added > 0 ? <ResultBadge tone="success">+{added}</ResultBadge> : null}
      </SummaryRow>
    );
  };

export const EditFileDetail: FC<RendererProps<EditFileInput, EditFileOutput>> =
  ({ input, output }) => {
    const { folder, path } = pathOf(input);
    const oldText = input?.old ?? null;
    const newText = input?.new ?? null;
    const replacements = output?.replacements ?? null;

    return (
      <div className="flex flex-col gap-2.5">
        <FilePath folder={folder} path={path} />
        {oldText || newText ? (
          <DiffPanel removed={oldText} added={newText} />
        ) : (
          <EmptyNote>Waiting…</EmptyNote>
        )}
        {replacements !== null ? (
          <EmptyNote>
            {formatCount(replacements, "replacement")}
            {input?.replaceAll ? " (all)" : ""}
          </EmptyNote>
        ) : null}
      </div>
    );
  };
