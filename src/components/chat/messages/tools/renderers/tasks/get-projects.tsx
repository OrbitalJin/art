import type { FC } from "react";
import { FolderKanban } from "lucide-react";
import { taskToolSchemas, type Project } from "@/lib/ai/tools/tasks";
import { EmptyNote, ListRow, RowList } from "../../shared";
import type { RendererProps, ToolRenderer } from "../../types";

const Detail: FC<RendererProps<Record<string, never>, Project[]>> = ({
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

export const renderer: ToolRenderer<Record<string, never>, Project[]> = {
  icon: FolderKanban,
  title: "Read projects",
  executingTitle: "Reading projects",
  inputSchema: taskToolSchemas.get_projects.input,
  outputSchema: taskToolSchemas.get_projects.output,
  Detail,
};
