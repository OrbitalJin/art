import { MessageCircleQuestion } from "lucide-react";
import type { ToolRenderer } from "../../types";
import { AskUserDetail, AskUserSummary } from "./components";

export const askUserRenderers: Record<string, ToolRenderer> = {
  ask_user: {
    icon: MessageCircleQuestion,
    title: "Asked a question",
    Summary: AskUserSummary,
    Detail: AskUserDetail,
  },
};
