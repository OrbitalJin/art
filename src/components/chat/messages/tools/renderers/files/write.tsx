import type { FC } from "react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import { DiffPanel, EmptyNote, ResultBadge, SummaryRow } from "../../primitives";
import { asRecord, countLines, getBoolean, getString } from "../../helpers";
import { pathOf } from "./helpers";
import { FileName, FilePath } from "./parts";

export const WriteFileSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const record = asRecord(block.input);
  const path = getString(record, "path");
  const content = getString(record, "content");
  const append = getBoolean(record, "append");

  return (
    <SummaryRow>
      <FileName path={path} />
      {content ? (
        <ResultBadge tone="success">+{countLines(content)}</ResultBadge>
      ) : null}
      {append ? <ResultBadge>append</ResultBadge> : null}
    </SummaryRow>
  );
};

export const WriteFileDetail: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const record = asRecord(block.input);
  const { folder, path } = pathOf(block.input);
  const content = getString(record, "content");

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
