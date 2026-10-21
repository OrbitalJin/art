import type { FC } from "react";
import { FilePen } from "lucide-react";
import type { z } from "zod";
import { fileToolSchemas } from "@/lib/ai/tools/files";
import {
  DiffPanel,
  EmptyNote,
  ResultBadge,
  SummaryRow,
  countLines,
  formatCount,
} from "../../shared";
import { defineRenderer, type RendererProps } from "../../types";
import { pathOf } from "./helpers";
import { FileName, FilePath } from "./parts";

type EditFileInput = z.infer<typeof fileToolSchemas.edit_file.input>;
type EditFileOutput = z.infer<typeof fileToolSchemas.edit_file.output>;

const Summary: FC<RendererProps<EditFileInput, EditFileOutput>> = ({
  input,
}) => {
  const { path } = pathOf(input);
  const removed = input?.old ? countLines(input.old) : 0;
  const added = input?.new ? countLines(input.new) : 0;

  return (
    <SummaryRow>
      <FileName path={path} />
      {removed > 0 ? (
        <ResultBadge tone="error">−{removed}</ResultBadge>
      ) : null}
      {added > 0 ? <ResultBadge tone="success">+{added}</ResultBadge> : null}
    </SummaryRow>
  );
};

const Detail: FC<RendererProps<EditFileInput, EditFileOutput>> = ({
  input,
  output,
}) => {
  const { folder, path } = pathOf(input);
  const oldText = input?.old ?? null;
  const newText = input?.new ?? null;
  const replacements = output?.replacements ?? null;

  return (
    <div className="flex flex-col gap-2.5">
      <FilePath folder={folder} path={path} />
      {oldText || newText ? (
        <DiffPanel removed={oldText} added={newText} />
      ) : (
        <EmptyNote>Waiting…</EmptyNote>
      )}
      {replacements !== null ? (
        <EmptyNote>
          {formatCount(replacements, "replacement")}
          {input?.replaceAll ? " (all)" : ""}
        </EmptyNote>
      ) : null}
    </div>
  );
};

export const renderer = defineRenderer<EditFileInput, EditFileOutput>({
  icon: FilePen,
  title: "Edited file",
  executingTitle: "Editing file",
  inputSchema: fileToolSchemas.edit_file.input,
  outputSchema: fileToolSchemas.edit_file.output,
  Summary,
  Detail,
});
