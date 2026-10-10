import type { Session } from "@/lib/store/session/types";
import type { ToolSet } from "ai";
import { journalTools } from "./journal";
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
  const enabled = (key: string): boolean =>
    session ? toolkitEnabled(session, key) : false;

  const tools: ToolSet = {
    ...(session?.folders?.length && fileTools({ roots: session.folders })),
    ...(enabled("journal") && journalTools()),
    ...(enabled("tasks") && tasksTools()),
    ...(enabled("askUser") && session && askUserTools(session.id)),
    ...(session && composioTools(session)),
    ...(enabled("todo") && session && todoTools(session.id)),
    ...ambientTools(),
    ...doneTools(),
  };

  return applyAccessPolicy(
    tools,
    session?.accessMode ?? "confirm",
    session?.id ?? "",
  );
};
