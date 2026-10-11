import type { FC } from "react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import {
  CodePanel,
  EmptyNote,
  ErrorNote,
  JsonTree,
  KeyValueList,
  ResultBadge,
  SectionLabel,
  SummaryRow,
  SummaryText,
} from "../../primitives";
import {
  asRecord,
  formatValue,
  getString,
  getSummaryText,
} from "../../helpers";

const isScalarLike = (value: unknown): boolean => {
  if (value === null) return true;
  if (typeof value !== "object") return true;
  if (Array.isArray(value)) return false;
  return Object.keys(value).length === 0;
};

const isFlat = (record: Record<string, unknown>): boolean =>
  Object.values(record).every(isScalarLike);

const isEmptyValue = (value: unknown): boolean => {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;

  const record = asRecord(value);
  return record !== null && Object.keys(record).length === 0;
};

/**
 * Composio tools return `{ data, error, successful }`. Show only the payload
 * when that envelope is present.
 */
const payloadOf = (output: unknown): unknown => {
  const record = asRecord(output);
  if (record && "successful" in record && "data" in record) {
    return record.data;
  }
  return output;
};

const errorOf = (block: ToolCallBlock): string | null => {
  const fromOutput = getString(asRecord(block.output), "error");
  if (fromOutput) return fromOutput;

  if (block.state === "error" && typeof block.output === "string") {
    return block.output;
  }

  return null;
};

export const ValueView: FC<{ value: unknown; maxHeightClass: string }> = ({
  value,
  maxHeightClass,
}) => {
  if (typeof value === "string") {
    return <CodePanel maxHeightClass={maxHeightClass}>{value}</CodePanel>;
  }

  const record = asRecord(value);
  if (record && isFlat(record)) {
    const entries = Object.entries(record).map(([label, item]) => ({
      label,
      value:
        item === null || typeof item === "object"
          ? formatValue(item)
          : String(item),
    }));

    return <KeyValueList entries={entries} />;
  }

  return <JsonTree value={value} />;
};

export const RequestSection: FC<{ block: ToolCallBlock }> = ({ block }) => {
  if (isEmptyValue(block.input)) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <SectionLabel>Request</SectionLabel>
      <ValueView value={block.input} maxHeightClass="max-h-40" />
    </div>
  );
};

export const ResponseSection: FC<{ block: ToolCallBlock }> = ({ block }) => {
  if (block.state === "executing") return <EmptyNote>Running…</EmptyNote>;

  const error = errorOf(block);
  if (error) {
    return (
      <div className="flex flex-col gap-1.5">
        <SectionLabel>Error</SectionLabel>
        <ErrorNote>{error}</ErrorNote>
      </div>
    );
  }

  if (block.output === undefined) return null;

  const payload = payloadOf(block.output);
  if (isEmptyValue(payload)) return <EmptyNote>No content returned.</EmptyNote>;

  return (
    <div className="flex flex-col gap-1.5">
      <SectionLabel>Response</SectionLabel>
      <ValueView value={payload} maxHeightClass="max-h-72" />
    </div>
  );
};

export const GenericSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const summary = getSummaryText(block.input);
  const failed = block.state === "error" || errorOf(block) !== null;

  if (!summary && !failed) return null;

  return (
    <SummaryRow>
      {summary ? <SummaryText title={summary}>{summary}</SummaryText> : null}
      {failed ? <ResultBadge tone="error">failed</ResultBadge> : null}
    </SummaryRow>
  );
};

export const GenericDetail: FC<{ block: ToolCallBlock }> = ({ block }) => (
  <div className="flex flex-col gap-3">
    <RequestSection block={block} />
    <ResponseSection block={block} />
  </div>
);
