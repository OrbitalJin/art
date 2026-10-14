import type { ModelId } from "@/lib/ai/models";
import type { PersonaId } from "@/lib/ai/prompts/personas";
import type { FsRoot } from "@/lib/fs";

export type SessionType = "chat" | "agent";

export type AccessMode = "readonly" | "confirm" | "autonomous";

export interface AccessModeTone {
  text: string;
  fill: string;
  ring: string;
  dot: string;
}

export const ACCESS_MODE_TONES: Record<AccessMode, AccessModeTone> = {
  readonly: {
    text: "text-emerald-600 dark:text-emerald-400",
    fill: "bg-emerald-500/10",
    ring: "ring-emerald-500/30",
    dot: "border-emerald-500 bg-emerald-500",
  },
  confirm: {
    text: "text-amber-600 dark:text-amber-400",
    fill: "bg-amber-500/10",
    ring: "ring-amber-500/30",
    dot: "border-amber-500 bg-amber-500",
  },
  autonomous: {
    text: "text-red-600 dark:text-red-400",
    fill: "bg-red-500/10",
    ring: "ring-red-500/30",
    dot: "border-red-500 bg-red-500",
  },
};

export const accessModeLabel = (mode: AccessMode): string =>
  mode === "readonly"
    ? "Read only"
    : mode === "autonomous"
      ? "Autonomous"
      : "Ask to write";

export type SessionGroups = Record<string, boolean>;

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

export interface SessionMeta {
  id: string;
  type: SessionType;
  title: string;
  accessMode: AccessMode;
  folders?: FsRoot[];
  groups: SessionGroups;
  modelId: ModelId;
  persona: PersonaId;
  branchOf?: string;
  archived?: boolean;
  pinned?: boolean;
  createdAt: number;
  updatedAt: number;
  titleGenerated?: boolean;
  readOnly?: boolean;
}

export interface SessionData {
  messages: Message[];
}

export interface Session extends SessionMeta {
  messages: Message[];
}
