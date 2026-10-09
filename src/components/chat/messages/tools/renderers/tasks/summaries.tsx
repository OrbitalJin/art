import type { FC } from "react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import {
  Arrow,
  ResultBadge,
  SummaryRow,
  SummaryText,
} from "../../primitives";
import { asArray, asRecord, formatCount, getString } from "../../helpers";
import { inputRecord, shortId, statusLabelOf } from "./helpers";

export const GetTasksSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const tasks = asArray(block.output);
  const status = statusLabelOf(getString(inputRecord(block), "status"));

  return (
    <SummaryRow>
      {status ? <SummaryText>{status}</SummaryText> : null}
      {block.state !== "executing" ? (
        <ResultBadge>{formatCount(tasks.length, "task")}</ResultBadge>
      ) : null}
    </SummaryRow>
  );
};

export const TaskTargetSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const title =
    getString(asRecord(block.output), "title") ??
    getString(inputRecord(block), "title");
  if (title) return <SummaryText title={title}>{title}</SummaryText>;

  const id = getString(inputRecord(block), "id");
  return id ? <SummaryText mono>{shortId(id)}</SummaryText> : null;
};

export const CreateTaskSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const input = inputRecord(block);
  const title = getString(input, "title");
  const status = statusLabelOf(getString(input, "status"));

  return (
    <SummaryRow>
      {title ? <SummaryText title={title}>{title}</SummaryText> : null}
      {status ? <ResultBadge>{status}</ResultBadge> : null}
    </SummaryRow>
  );
};

export const MoveTaskSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const input = inputRecord(block);
  const id = getString(input, "id");
  const status = statusLabelOf(getString(input, "status"));

  return (
    <SummaryRow>
      {id ? <SummaryText mono>{shortId(id)}</SummaryText> : null}
      {id && status ? <Arrow /> : null}
      {status ? <SummaryText>{status}</SummaryText> : null}
    </SummaryRow>
  );
};

export const ProjectNameSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const name = getString(inputRecord(block), "name");
  return name ? <SummaryText title={name}>{name}</SummaryText> : null;
};

export const ProjectTargetSummary: FC<{ block: ToolCallBlock }> = ({
  block,
}) => {
  const input = inputRecord(block);
  const name = getString(input, "name");
  if (name) return <SummaryText title={name}>{name}</SummaryText>;

  const id = getString(input, "id");
  return id ? <SummaryText mono>{shortId(id)}</SummaryText> : null;
};

export const ProjectWithTasksSummary: FC<{ block: ToolCallBlock }> = ({
  block,
}) => {
  const input = inputRecord(block);
  const name = getString(asRecord(input?.project), "name");
  const tasks = asArray(input?.tasks);

  return (
    <SummaryRow>
      {name ? <SummaryText title={name}>{name}</SummaryText> : null}
      <ResultBadge>{formatCount(tasks.length, "task")}</ResultBadge>
    </SummaryRow>
  );
};
