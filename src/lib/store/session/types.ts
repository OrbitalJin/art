import type { ModelId } from "@/lib/ai/models";
import type { ModeId } from "@/lib/ai/prompts/modes";

export type SessionType = "chat" | "agent";

export interface SessionCapabilities {
  journal: boolean;
  tasks: boolean;
}

export type MessageStatus =
  "thinking" | "streaming" | "complete" | "aborted" | "error";

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
  type: SessionType;
  title: string;
  knowledgeBase?: string;
  capabilities: SessionCapabilities;
  messages: Message[];
  modelId: ModelId;
  mode: ModeId;
  branchOf?: string;
  archived?: boolean;
  pinned?: boolean;
  createdAt: number;
  updatedAt: number;
  titleGenerated?: boolean;
  readOnly?: boolean;
}
