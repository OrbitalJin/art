import { MessageCircleQuestion } from "lucide-react";
import type { ToolRenderer } from "../../types";
import type { AskUserToolName } from "@/lib/ai/tools/ask-user";
import { AskUserDetail, AskUserSummary } from "./components";

export const askUserRenderers = {
  ask_user: {
    icon: MessageCircleQuestion,
    title: "Asked a question",
    Summary: AskUserSummary,
    Detail: AskUserDetail,
  },
} satisfies Record<AskUserToolName, ToolRenderer>;
