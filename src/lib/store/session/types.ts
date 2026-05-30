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

export interface Message {
  id: string;
  role: "user" | "assistant";
  // Content can be a simple string (for user messages) or structured blocks (for assistant messages)
  content: string | ContentBlock[];
  status?: MessageStatus;
  grounded?: boolean;
  modelId?: ModelId;
  tokenUsage: number;
}

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  modelId: ModelId;
  journalRefs: string[];
  traits: TraitId[];
  mode: ModeId;
  branchOf?: string;
  archived?: boolean;
  pinned?: boolean;
  createdAt: number;
  updatedAt: number;
  searchGrounding?: boolean;
  webCtxUrls: string[];
  titleGenerated?: boolean;
}
