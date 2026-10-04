import type { Session } from "@/lib/store/session/types";
import type { ToolSet } from "ai";
import { journalTools } from "./journal";
import { tasksTools } from "./tasks";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { sessionTools } from "./session";
import { playerTools } from "./player";
import { searchTools } from "./search";
import { knowledgeTools } from "./knowledge";

export interface Opts {
  session?: Session;
  knowledgeRoot?: string;
}

export const toolsFor = ({ session, knowledgeRoot }: Opts): ToolSet => {
  const tools: ToolSet = {};
  const { web_search, fetch_url, journal, tasks, audio } =
    useSettingsStore.getState().toolOptions;
  const search = searchTools();
  return {
    ...tools,
    ...sessionTools({ session }),
    ...(knowledgeRoot && knowledgeTools({ root: knowledgeRoot })),
    ...(web_search && { web_search: search.web_search }),
    ...(fetch_url && { fetch_url: search.fetch_url }),
    ...(audio && playerTools()),
    ...(journal && journalTools()),
    ...(tasks && tasksTools()),
  };
};
