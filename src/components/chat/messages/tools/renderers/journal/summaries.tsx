import type { FC } from "react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import { ResultBadge, SummaryRow, SummaryText } from "../../primitives";
import { asArray, asRecord, formatCount, getString } from "../../helpers";
import { inputRecord } from "./helpers";

export const GetJournalsSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const pages = asArray(block.output);
  const workspace = getString(inputRecord(block), "workspace");
  const tag = getString(inputRecord(block), "tag");

  return (
    <SummaryRow>
      {workspace ? <SummaryText>{workspace}</SummaryText> : null}
      {tag ? <SummaryText>#{tag}</SummaryText> : null}
      {block.state !== "executing" ? (
        <ResultBadge>
          {formatCount(pages.length, "entry", "entries")}
        </ResultBadge>
      ) : null}
    </SummaryRow>
  );
};

export const TitleSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const title =
    getString(asRecord(block.output), "title") ??
    getString(inputRecord(block), "title") ??
    getString(inputRecord(block), "id");

  return title ? <SummaryText title={title}>{title}</SummaryText> : null;
};

export const TagsSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const tags = asArray(inputRecord(block)?.tags);
  return <ResultBadge>{formatCount(tags.length, "tag")}</ResultBadge>;
};

export const AllTagsSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  if (block.state === "executing") return null;
  const tags = asArray(asRecord(block.output)?.tags);
  return <ResultBadge>{formatCount(tags.length, "tag")}</ResultBadge>;
};
