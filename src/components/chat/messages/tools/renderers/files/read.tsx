import type { FC } from "react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import { EmptyNote, ResultBadge, SummaryRow } from "../../primitives";
import { countLines, formatCount } from "../../helpers";
import { pathOf } from "./helpers";
import { FileContent, FileName, FilePath } from "./parts";

export const ReadFileSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const { path } = pathOf(block.input);
  const output = typeof block.output === "string" ? block.output : null;

  return (
    <SummaryRow>
      <FileName path={path} />
      {output !== null ? (
        <ResultBadge>{formatCount(countLines(output), "line")}</ResultBadge>
      ) : null}
    </SummaryRow>
  );
};

export const ReadFileDetail: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const { folder, path } = pathOf(block.input);
  const output = typeof block.output === "string" ? block.output : null;

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
