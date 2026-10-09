import type { FC } from "react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import {
  EmptyNote,
  KeyValueList,
  ResultBadge,
  SummaryRow,
} from "../../primitives";
import { asRecord, formatBytes, getNumber, getString } from "../../helpers";
import { pathOf } from "./helpers";
import { FileName, FilePath } from "./parts";

export const ReadImageSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const { path } = pathOf(block.input);
  const size = getNumber(asRecord(block.output), "size");

  return (
    <SummaryRow>
      <FileName path={path} />
      {size !== null ? <ResultBadge>{formatBytes(size)}</ResultBadge> : null}
    </SummaryRow>
  );
};

export const ReadImageDetail: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const { folder, path } = pathOf(block.input);
  const output = asRecord(block.output);
  const mediaType = getString(output, "mediaType");
  const base64 = getString(output, "base64");
  const size = getNumber(output, "size");

  if (!output) {
    return (
      <div className="flex flex-col gap-2.5">
        <FilePath folder={folder} path={path} />
        <EmptyNote>Waiting…</EmptyNote>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <FilePath folder={folder} path={path} />
      <KeyValueList
        entries={[
          { label: "Type", value: mediaType ?? "—" },
          { label: "Size", value: formatBytes(size ?? 0) },
        ]}
      />
      {mediaType?.startsWith("image/") && base64 ? (
        <img
          src={`data:${mediaType};base64,${base64}`}
          alt={path ?? "image"}
          className="max-h-80 w-auto max-w-full self-start rounded-md border border-border/40 object-contain"
        />
      ) : null}
    </div>
  );
};
