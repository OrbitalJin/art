import type { ModelId } from "@/lib/llm/common/types";
import type { ModeId } from "@/lib/llm/prompts/modes";
import type { TraitId } from "@/lib/llm/prompts/traits";

export type MessageStatus =
  | "thinking"
  | "streaming"
  | "complete"
  | "aborted"
  | "error";

export interface Message {
  id: string;
  role: "user" | "model" | "error";
  content: string;
  status: MessageStatus;
  grounded?: boolean;
  modelId?: ModelId;
  errMsg?: string;
}

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  modelId: ModelId;
  journalRefs: string[];
  traits: TraitId[];
  mode: ModeId;
  forkOf?: string;
  archived?: boolean;
  pinned?: boolean;
  createdAt: number;
  updatedAt: number;
  searchGrounding?: boolean;
  webCtxUrls: string[];
}
