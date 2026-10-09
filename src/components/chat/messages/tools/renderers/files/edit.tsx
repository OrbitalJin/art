import type { FC } from "react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import { DiffPanel, EmptyNote, ResultBadge, SummaryRow } from "../../primitives";
import {
  asRecord,
  countLines,
  formatCount,
  getBoolean,
  getNumber,
  getString,
} from "../../helpers";
import { pathOf } from "./helpers";
import { FileName, FilePath } from "./parts";

export const EditFileSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const record = asRecord(block.input);
  const path = getString(record, "path");
  const oldText = getString(record, "old");
  const newText = getString(record, "new");
  const removed = oldText ? countLines(oldText) : 0;
  const added = newText ? countLines(newText) : 0;

  return (
    <SummaryRow>
      <FileName path={path} />
      {removed > 0 ? <ResultBadge tone="error">−{removed}</ResultBadge> : null}
      {added > 0 ? <ResultBadge tone="success">+{added}</ResultBadge> : null}
    </SummaryRow>
  );
};

export const EditFileDetail: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const record = asRecord(block.input);
  const { folder, path } = pathOf(block.input);
  const oldText = getString(record, "old");
  const newText = getString(record, "new");
  const replacements = getNumber(asRecord(block.output), "replacements");
  const replaceAll = getBoolean(record, "replaceAll");

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
          {replaceAll ? " (all)" : ""}
        </EmptyNote>
      ) : null}
    </div>
  );
};
