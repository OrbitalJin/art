import type { FC } from "react";
import { FilePlus } from "lucide-react";
import { fileToolSchemas } from "@/lib/ai/tools/files";
import {
  DiffPanel,
  EmptyNote,
  ResultBadge,
  SummaryRow,
  countLines,
} from "../../shared";
import type { RendererProps, ToolRenderer } from "../../types";
import { pathOf } from "./helpers";
import { FileName, FilePath } from "./parts";

interface WriteFileInput {
  folder: string;
  path: string;
  content: string;
  append?: boolean;
}

const Summary: FC<RendererProps<WriteFileInput, unknown>> = ({ input }) => {
  const { path } = pathOf(input);
  const content = input?.content ?? null;

  return (
    <SummaryRow>
      <FileName path={path} />
      {content ? (
        <ResultBadge tone="success">+{countLines(content)}</ResultBadge>
      ) : null}
      {input?.append ? <ResultBadge>append</ResultBadge> : null}
    </SummaryRow>
  );
};

const Detail: FC<RendererProps<WriteFileInput, unknown>> = ({ input }) => {
  const { folder, path } = pathOf(input);
  const content = input?.content ?? null;

  return (
    <div className="flex flex-col gap-2.5">
      <FilePath folder={folder} path={path} />
      {content ? (
        <DiffPanel added={content} />
      ) : (
        <EmptyNote>Waiting…</EmptyNote>
      )}
    </div>
  );
};

export const renderer: ToolRenderer<WriteFileInput, unknown> = {
  icon: FilePlus,
  title: "Wrote file",
  executingTitle: "Writing file",
  inputSchema: fileToolSchemas.write_file.input,
  outputSchema: fileToolSchemas.write_file.output,
  Summary,
  Detail,
};
