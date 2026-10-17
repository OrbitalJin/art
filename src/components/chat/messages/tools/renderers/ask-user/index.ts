import type { ToolRenderer } from "../../types";
import {
  ASK_USER_TOOL_NAME,
  type AskUserToolName,
} from "@/lib/ai/tools/ask-user";
import { renderer as askUser } from "./ask-user";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRenderer = ToolRenderer<any, any>;

export const askUserRenderers = {
  [ASK_USER_TOOL_NAME]: askUser,
} satisfies Record<AskUserToolName, AnyRenderer>;
