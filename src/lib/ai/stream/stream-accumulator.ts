import type { TextStreamPart, ToolSet } from "ai";
import type {
  MessagePart,
  MessageStatus,
  ToolCallBlock,
  ToolCallPart,
} from "@/lib/store/session/types";
import { toolCallsOf } from "@/lib/store/session/types";
import { DONE_TOOL_NAME } from "@/lib/ai/tools/done";

export interface StreamAccumulator {
  parts: MessagePart[];
  toolCalls: ToolCallBlock[];
  reasoningText: string;
  status: Extract<MessageStatus, "streaming" | "aborted" | "error">;
}

export const initialAccumulator: StreamAccumulator = {
  parts: [],
  toolCalls: [],
  reasoningText: "",
  status: "streaming",
};

export type StreamEvent = TextStreamPart<ToolSet>;

const appendText = (parts: MessagePart[], text: string): MessagePart[] => {
  const next = parts.slice();
  const last = next[next.length - 1];
  if (last && last.type === "text") {
    next[next.length - 1] = { ...last, text: last.text + text };
  } else {
    next.push({ type: "text", text });
  }
  return next;
};

const errorText = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const withParts = (
  acc: StreamAccumulator,
  parts: MessagePart[],
): StreamAccumulator => ({
  ...acc,
  parts,
  toolCalls: toolCallsOf(parts),
});

export function applyStreamEvent(
  acc: StreamAccumulator,
  event: StreamEvent,
): StreamAccumulator {
  switch (event.type) {
    case "text-delta": {
      if (!event.text) return acc;
      return { ...acc, parts: appendText(acc.parts, event.text) };
    }

    case "tool-call": {
      const isDone = event.toolName === DONE_TOOL_NAME;
      const block: ToolCallPart = {
        type: "tool-call",
        id: event.toolCallId,
        toolName: event.toolName,
        input: event.input,
        state: isDone ? "result" : "executing",
      };
      return withParts(acc, [...acc.parts, block]);
    }

    case "tool-result": {
      const parts = acc.parts.map((part) =>
        part.type === "tool-call" && part.id === event.toolCallId
          ? { ...part, state: "result" as const, output: event.output }
          : part,
      );
      return withParts(acc, parts);
    }

    case "tool-error": {
      const parts = acc.parts.map((part) =>
        part.type === "tool-call" && part.id === event.toolCallId
          ? { ...part, state: "error" as const, output: errorText(event.error) }
          : part,
      );
      return withParts(acc, parts);
    }

    case "tool-output-denied": {
      const parts = acc.parts.map((part) =>
        part.type === "tool-call" && part.id === event.toolCallId
          ? { ...part, state: "error" as const, output: "Tool call denied" }
          : part,
      );
      return withParts(acc, parts);
    }

    case "reasoning-start":
      // A turn can produce several reasoning blocks (one per step), so append
      // instead of resetting; separate blocks with a blank line.
      return {
        ...acc,
        reasoningText: acc.reasoningText ? `${acc.reasoningText}\n\n` : "",
      };

    case "reasoning-delta":
      return {
        ...acc,
        reasoningText: acc.reasoningText + event.text,
      };

    case "reasoning-end":
      return { ...acc };

    case "abort":
      return { ...acc, status: "aborted" };

    case "error":
      return { ...acc, status: "error" };

    default:
      return acc;
  }
}

export const isTerminal = (acc: StreamAccumulator): boolean =>
  acc.status === "aborted" || acc.status === "error";
