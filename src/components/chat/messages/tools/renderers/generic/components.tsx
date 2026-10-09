import type { FC } from "react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import {
  Chip,
  CodePanel,
  JsonTree,
  KeyValueList,
  SectionLabel,
} from "../../primitives";
import { asRecord, formatValue, getSummaryText } from "../../helpers";

const isFlat = (record: Record<string, unknown>): boolean =>
  Object.values(record).every(
    (value) =>
      value === null ||
      typeof value !== "object" ||
      (typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        Object.keys(value).length === 0),
  );

export const ValueView: FC<{ value: unknown; isError?: boolean }> = ({
  value,
  isError,
}) => {
  if (typeof value === "string") {
    return (
      <CodePanel maxHeightClass="max-h-40" tone={isError ? "error" : "default"}>
        {value}
      </CodePanel>
    );
  }

  const record = asRecord(value);
  if (record && isFlat(record)) {
    return (
      <KeyValueList
        entries={Object.entries(record).map(([label, item]) => ({
          label,
          value:
            item === null || typeof item === "object"
              ? formatValue(item)
              : String(item),
        }))}
      />
    );
  }

  return <JsonTree value={value} />;
};

export const GenericSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const summary = getSummaryText(block.input);
  return summary ? <Chip title={summary}>{summary}</Chip> : null;
};

export const GenericDetail: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const input = formatValue(block.input);
  const output =
    block.output !== undefined ? formatValue(block.output) : null;
  const isError = block.state === "error";

  return (
    <div className="flex flex-col gap-3">
      {input ? (
        <div className="flex flex-col gap-1.5">
          <SectionLabel>Request</SectionLabel>
          <ValueView value={block.input} />
        </div>
      ) : null}

      {output !== null ? (
        <div className="flex flex-col gap-1.5">
          <SectionLabel>{isError ? "Error" : "Response"}</SectionLabel>
          <ValueView value={block.output} isError={isError} />
        </div>
      ) : null}
    </div>
  );
};
