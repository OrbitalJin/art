import type { Session } from "@/lib/store/session/types";
import type { ToolSet } from "ai";
import { tasksTools } from "./tasks";
import { fileTools } from "./files";
import { askUserTools } from "./ask-user";
import { doneTools } from "./done";
import { todoTools } from "./todo";
import { composioTools } from "./composio";
import { youtubeTools } from "./youtube";
import { applyAccessPolicy } from "./policy";
import { toolkitEnabled } from "./toolkits";

export interface Opts {
  session?: Session;
}

export const toolsFor = async ({ session }: Opts): Promise<ToolSet> => {
  const tools: ToolSet = {
    ...doneTools(),
    ...(toolkitEnabled(session, "todo") && session && todoTools(session.id)),
    ...(toolkitEnabled(session, "tasks") && tasksTools()),
    ...(toolkitEnabled(session, "askUser") &&
      session &&
      askUserTools(session.id)),
    ...(toolkitEnabled(session, "youtube") && session && youtubeTools()),
    ...(session ? await composioTools(session) : {}),
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
