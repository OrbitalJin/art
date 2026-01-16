import type { Model } from "@/lib/llm/common/types";
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
  errMsg?: string;
  model?: Model;
}

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  preferredModel: Model;
  noteRefs: string[];
  traits: TraitId[];
  mode: ModeId;
  forkOf?: string;
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
}
