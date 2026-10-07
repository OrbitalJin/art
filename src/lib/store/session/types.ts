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

export interface TextPart {
  type: "text";
  text: string;
}

export interface ToolCallPart extends ToolCallBlock {
  type: "tool-call";
}

export type MessagePart = TextPart | ToolCallPart;

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
  parts: MessagePart[];
  toolCalls?: ToolCallBlock[];
  status?: MessageStatus;
  modelId?: ModelId;
  reasoning?: string;
  attachments?: MessageAttachment[];
  tokenUsage: TokenUsage;
}

export const isTextPart = (part: MessagePart): part is TextPart =>
  part.type === "text";

export const isToolCallPart = (part: MessagePart): part is ToolCallPart =>
  part.type === "tool-call";

export const messageText = (message: Pick<Message, "parts">): string =>
  message.parts
    .filter(isTextPart)
    .map((part) => part.text)
    .join("");

export const toolCallsOf = (parts: MessagePart[]): ToolCallBlock[] =>
  parts.filter(isToolCallPart).map((part) => ({
    id: part.id,
    toolName: part.toolName,
    input: part.input,
    state: part.state,
    output: part.output,
  }));

export interface Session {
  id: string;
  type: SessionType;
  title: string;
  disableApproval?: boolean;
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
