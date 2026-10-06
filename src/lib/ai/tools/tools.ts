import type { Session } from "@/lib/store/session/types";
import type { ToolSet } from "ai";
import { journalTools } from "./journal";
import { tasksTools } from "./tasks";
import { sessionTools } from "./session";
import { searchTools } from "./search";
import { knowledgeTools } from "./knowledge";
import { doneTools } from "./done";

export interface Opts {
  session?: Session;
}

export const ambientTools = (): ToolSet => {
  return {
    ...searchTools(),
  };
};

export const toolsFor = ({ session }: Opts): ToolSet => {
  const { journal, tasks } = session?.capabilities ?? {};
  return {
    ...sessionTools({ session }),
    ...(session?.knowledgeBase &&
      knowledgeTools({ root: session.knowledgeBase })),
    ...(journal && journalTools()),
    ...(tasks && tasksTools()),
    ...ambientTools(),
    ...doneTools(),
  };
};
