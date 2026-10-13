import { MessageCircleQuestion } from "lucide-react";
import type { ToolRenderer } from "../../types";
import {
  ASK_USER_TOOL_NAME,
  askUserToolSchemas,
  type AskUserToolName,
} from "@/lib/ai/tools/ask-user";
import { AskUserDetail, AskUserSummary } from "./components";

export const askUserRenderers = {
  [ASK_USER_TOOL_NAME]: {
    icon: MessageCircleQuestion,
    title: "Asked a question",
    executingTitle: "Asking a question",
    inputSchema: askUserToolSchemas[ASK_USER_TOOL_NAME].input,
    outputSchema: askUserToolSchemas[ASK_USER_TOOL_NAME].output,
    Summary: AskUserSummary,
    Detail: AskUserDetail,
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} satisfies Record<AskUserToolName, ToolRenderer<any, any>>;
