import type { FC } from "react";
import { FolderTree } from "lucide-react";
import type { z } from "zod";
import { fileToolSchemas } from "@/lib/ai/tools/files";
import {
  EmptyNote,
  ResultBadge,
  SummaryRow,
  basename,
  formatCount,
} from "../../shared";
import { defineRenderer, type RendererProps } from "../../types";
import { FilePath } from "./parts";

type ListTreeInput = z.infer<typeof fileToolSchemas.list_tree.input>;
type ListTreeOutput = z.infer<typeof fileToolSchemas.list_tree.output>;

const Summary: FC<RendererProps<ListTreeInput, ListTreeOutput>> = ({
  input,
  output,
  block,
}) => (
  <SummaryRow>
    <span className="min-w-0 truncate font-mono text-[11px] text-foreground/70">
      {input?.path ?? input?.folder ?? "—"}
    </span>
    {block.state !== "executing" ? (
      <ResultBadge>{formatCount(output?.length ?? 0, "entry")}</ResultBadge>
    ) : null}
  </SummaryRow>
);

const Detail: FC<RendererProps<ListTreeInput, ListTreeOutput>> = ({
  input,
  output,
  block,
}) => {
  const entries = output ?? [];

  return (
    <div className="flex flex-col gap-2.5">
      <FilePath folder={input?.folder ?? null} path={input?.path ?? null} />
      {entries.length > 0 ? (
        // Plain block list, not `flex flex-col`: a scroll container of flex
        // items whose children set `overflow: hidden` (via `truncate`) have an
        // automatic minimum size of zero and collapse to nothing when the list
        // overflows.
        <ul className="max-h-64 overflow-auto">
          {entries.map((entry, index) => (
            <li
              key={`${entry.path}-${index}`}
              style={{ paddingLeft: Math.max(0, entry.depth - 1) * 12 }}
              className="truncate py-0.5 font-mono text-[11px] text-foreground/80"
            >
              {basename(entry.path)}
              {entry.isDir ? "/" : ""}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyNote>
          {block.state === "executing" ? "Waiting…" : "No entries."}
        </EmptyNote>
      )}
    </div>
  );
};

export const renderer = defineRenderer<ListTreeInput, ListTreeOutput>({
  icon: FolderTree,
  title: "Listed tree",
  executingTitle: "Listing tree",
  inputSchema: fileToolSchemas.list_tree.input,
  outputSchema: fileToolSchemas.list_tree.output,
  Summary,
  Detail,
});
