import type { ModelId } from "@/lib/ai/models";
import type { ModeId } from "@/lib/ai/prompts/modes";
import type { TraitId } from "@/lib/ai/prompts/traits";

export type MessageStatus =
  | "thinking"
  | "streaming"
  | "complete"
  | "aborted"
  | "error";

export interface ToolCallBlock {
  type: "tool-call";
  id: string;
  toolName: string;
  input: unknown;
  state: "executing" | "result" | "error";
  output?: unknown;
}

export interface TextBlock {
  type: "text";
  text: string;
}

export type ContentBlock = TextBlock | ToolCallBlock;

export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string | ContentBlock[];
  status?: MessageStatus;
  modelId?: ModelId;
  tokenUsage: { input: number; output: number };
}

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  modelId: ModelId;
  traits: TraitId[];
  mode: ModeId;
  branchOf?: string;
  archived?: boolean;
  pinned?: boolean;
  createdAt: number;
  updatedAt: number;
  titleGenerated?: boolean;
  readOnly?: boolean;
}
