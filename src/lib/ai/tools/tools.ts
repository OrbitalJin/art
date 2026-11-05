import type { SessionMeta } from "@/lib/store/session/types";
import type { ToolSet } from "ai";
import { ExaTools, searchTools } from "./exa";
import { READ_SHEET_TOOL_NAME, sheetsTools } from "./sheets";
import { fileTools } from "./files";
import { askUserTools } from "./ask-user";
import { doneTools } from "./done";
import { planTools } from "./plan";
import { youtubeTools } from "./youtube";
import { fetchMacrosTools, nutritionTools } from "./nutrition";
import { applyPolicy } from "./policy";
import { useSettingsStore } from "@/lib/store/use-settings-store";

const cherryPick = (all: ToolSet, id: string): ToolSet => {
  const entry = all[id];
  return entry ? { [id]: entry } : {};
};

export const toolsFor = async (session: SessionMeta): Promise<ToolSet> => {
  const on = session.groups;
  const search = searchFor(session);
  const nutrition = nutritionTools();
  const macros = useSettingsStore.getState().keys?.usda
    ? fetchMacrosTools()
    : {};

  if (session.type === "chat") {
    return { ...search, ...nutrition, ...macros };
  }

  const tools: ToolSet = {
    ...search,
    ...nutrition,
    ...macros,
    ...doneTools(),
    ...(on.plan ? planTools(session.id) : {}),
    ...(on.askUser ? askUserTools(session.id) : {}),
    ...(on.youtube ? youtubeTools() : {}),
    ...(on[READ_SHEET_TOOL_NAME] ? sheetsTools() : {}),
    ...(on.files && session.folders?.length
      ? fileTools({ roots: session.folders })
      : {}),
  };

  return applyPolicy(tools, session.accessMode, session.id);
};

const searchFor = (session: SessionMeta): ToolSet => {
  const on = session.groups;
  const search = searchTools();
  return {
    ...(on[ExaTools.web] ? cherryPick(search, ExaTools.web) : {}),
    ...(on[ExaTools.fetch] ? cherryPick(search, ExaTools.fetch) : {}),
    ...(on[ExaTools.news] ? cherryPick(search, ExaTools.news) : {}),
  };
};
