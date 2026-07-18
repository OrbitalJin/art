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
  id: string;
  toolName: string;
  input: unknown;
  state: "executing" | "result" | "error";
  output?: unknown;
}

export interface MessageAttachment {
  base64: string;
  mediaType: string;
  name?: string;
  size?: number;
  file?: File;
}

export interface TokenUsage {
  input: number;
  output: number;
}

export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  toolCalls?: ToolCallBlock[];
  status?: MessageStatus;
  modelId?: ModelId;
  reasoning?: string;
  attachments?: MessageAttachment[];
  tokenUsage: TokenUsage;
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
