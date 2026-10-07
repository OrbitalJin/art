import type { Session } from "@/lib/store/session/types";
import type { ToolSet } from "ai";
import { journalTools } from "./journal";
import { tasksTools } from "./tasks";
import { sessionTools } from "./session";
import { searchTools } from "./search";
import { fileTools } from "./files";
import { askUserTools } from "./ask-user";
import { doneTools } from "./done";
import { applyAccessPolicy } from "./policy";

export interface Opts {
  session?: Session;
}

export const ambientTools = (): ToolSet => {
  return {
    ...searchTools(),
  };
};

export const toolsFor = ({ session }: Opts): ToolSet => {
  const { journal, tasks, askUser } = session?.capabilities ?? {};
  const tools: ToolSet = {
    ...sessionTools({ session }),
    ...(session?.folders?.length &&
      fileTools({ roots: session.folders })),
    ...(journal && journalTools()),
    ...(tasks && tasksTools()),
    ...(askUser && askUserTools()),
    ...ambientTools(),
    ...doneTools(),
  };

  return applyAccessPolicy(tools, session?.accessMode ?? "confirm");
};
