import type { Session } from "@/lib/store/session/types";
import type { ToolSet } from "ai";
import { tasksTools } from "./tasks";
import { searchTools } from "./search";
import { fileTools } from "./files";
import { askUserTools } from "./ask-user";
import { doneTools } from "./done";
import { todoTools } from "./todo";
import { composioTools } from "./composio";
import { applyAccessPolicy } from "./policy";
import { toolkitEnabled } from "./toolkits";

export interface Opts {
  session?: Session;
}

export const ambientTools = (): ToolSet => {
  return {
    ...searchTools(),
  };
};

export const toolsFor = ({ session }: Opts): ToolSet => {
  const tools: ToolSet = {
    ...doneTools(),
    ...ambientTools(),
    ...(toolkitEnabled(session, "todo") && session && todoTools(session.id)),
    ...(toolkitEnabled(session, "tasks") && tasksTools()),
    ...(toolkitEnabled(session, "askUser") &&
      session &&
      askUserTools(session.id)),
    ...(session && composioTools(session)),
    ...(toolkitEnabled(session, "files") &&
      session?.folders &&
      fileTools({ roots: session.folders })),
  };

  return applyAccessPolicy(
    tools,
    session?.accessMode ?? "confirm",
    session?.id ?? "",
  );
};
