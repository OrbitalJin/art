import type { FC } from "react";
import { FolderKanban } from "lucide-react";
import type { z } from "zod";
import { taskToolSchemas } from "@/lib/ai/tools/tasks";
import { EmptyNote, ListRow, RowList } from "../../shared";
import { defineRenderer, type RendererProps } from "../../types";

type GetProjectsInput = z.infer<typeof taskToolSchemas.get_projects.input>;
type GetProjectsOutput = z.infer<typeof taskToolSchemas.get_projects.output>;

const Detail: FC<RendererProps<GetProjectsInput, GetProjectsOutput>> = ({
  output,
}) => {
  const projects = output ?? [];
  if (projects.length === 0) return <EmptyNote>No projects.</EmptyNote>;

  return (
    <RowList maxHeightClass="max-h-56">
      {projects.map((project) => (
        <ListRow key={project.id}>
          <span className="truncate text-[12px] text-foreground/85">
            {project.name}
          </span>
        </ListRow>
      ))}
    </RowList>
  );
};

export const renderer = defineRenderer<GetProjectsInput, GetProjectsOutput>({
  icon: FolderKanban,
  title: "Read projects",
  executingTitle: "Reading projects",
  inputSchema: taskToolSchemas.get_projects.input,
  outputSchema: taskToolSchemas.get_projects.output,
  Detail,
});
