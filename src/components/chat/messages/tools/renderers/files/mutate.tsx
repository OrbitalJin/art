import type { FC } from "react";
import { Arrow, DoneNote, KeyValueList, SummaryRow } from "../../primitives";
import type { RendererProps } from "../../types";
import { pathOf } from "./helpers";
import { FileName, FilePath } from "./parts";

interface PathInput {
  folder: string;
  path: string;
}

interface MoveInput {
  folder: string;
  from: string;
  to: string;
}

export const PathSummary: FC<RendererProps<PathInput, unknown>> = ({ input }) => {
  const { path } = pathOf(input);
  return (
    <SummaryRow>
      <FileName path={path} />
    </SummaryRow>
  );
};

export const PathDetail: FC<RendererProps<PathInput, unknown>> = ({
  input,
  block,
}) => {
  const { folder, path } = pathOf(input);

  return (
    <div className="flex flex-col gap-2.5">
      <FilePath folder={folder} path={path} />
      <DoneNote block={block} />
    </div>
  );
};

export const MoveSummary: FC<RendererProps<MoveInput, unknown>> = ({ input }) => {
  const from = input?.from ?? null;
  const to = input?.to ?? null;

  return (
    <SummaryRow>
      <FileName path={from} />
      {from && to ? <Arrow /> : null}
      <FileName path={to} />
    </SummaryRow>
  );
};

export const MoveDetail: FC<RendererProps<MoveInput, unknown>> = ({
  input,
  block,
}) => {
  const folder = input?.folder ?? null;
  const from = input?.from ?? null;
  const to = input?.to ?? null;

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
