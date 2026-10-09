import type { FC } from "react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import { Arrow, DoneNote, KeyValueList, SummaryRow } from "../../primitives";
import { asRecord, getString } from "../../helpers";
import { pathOf } from "./helpers";
import { FileName, FilePath } from "./parts";

export const PathSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const { path } = pathOf(block.input);
  return (
    <SummaryRow>
      <FileName path={path} />
    </SummaryRow>
  );
};

export const PathDetail: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const { folder, path } = pathOf(block.input);

  return (
    <div className="flex flex-col gap-2.5">
      <FilePath folder={folder} path={path} />
      <DoneNote block={block} />
    </div>
  );
};

export const MoveSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const record = asRecord(block.input);
  const from = getString(record, "from");
  const to = getString(record, "to");

  return (
    <SummaryRow>
      <FileName path={from} />
      {from && to ? <Arrow /> : null}
      <FileName path={to} />
    </SummaryRow>
  );
};

export const MoveDetail: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const record = asRecord(block.input);
  const folder = getString(record, "folder");
  const from = getString(record, "from");
  const to = getString(record, "to");

  return (
    <div className="flex flex-col gap-2.5">
      <FilePath folder={folder} path={null} />
      <KeyValueList
        entries={[
          {
            label: "From",
            value: <span className="font-mono break-all">{from ?? "—"}</span>,
          },
          {
            label: "To",
            value: <span className="font-mono break-all">{to ?? "—"}</span>,
          },
        ]}
      />
      <DoneNote block={block} />
    </div>
  );
};
