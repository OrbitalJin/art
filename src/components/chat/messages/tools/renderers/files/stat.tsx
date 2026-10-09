import type { FC } from "react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import { EmptyNote, KeyValueList, ResultBadge, SummaryRow } from "../../primitives";
import { asRecord, formatBytes, getBoolean, getNumber } from "../../helpers";
import { pathOf } from "./helpers";
import { FileName, FilePath } from "./parts";

export const StatSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const { path } = pathOf(block.input);
  const size = getNumber(asRecord(block.output), "size");

  return (
    <SummaryRow>
      <FileName path={path} />
      {size !== null ? <ResultBadge>{formatBytes(size)}</ResultBadge> : null}
    </SummaryRow>
  );
};

export const StatDetail: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const { folder, path } = pathOf(block.input);
  const output = asRecord(block.output);
  const mtime = getNumber(output, "mtime");
  const size = getNumber(output, "size");

  const type = getBoolean(output, "isDirectory") ? "Directory" : "File";
  const modified = mtime ? new Date(mtime).toLocaleString() : "—";
  const readOnly = getBoolean(output, "readonly") ? "Yes" : "No";

  return (
    <div className="flex flex-col gap-2.5">
      <FilePath folder={folder} path={path} />
      {output ? (
        <KeyValueList
          entries={[
            { label: "Type", value: type },
            { label: "Size", value: formatBytes(size ?? 0) },
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
