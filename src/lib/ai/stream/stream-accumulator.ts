import type { TextStreamPart, ToolSet } from "ai";
import type {
  MessageStatus,
  ToolCallBlock,
} from "@/lib/store/session/types";

export interface StreamAccumulator {
  content: string;
  toolCalls: ToolCallBlock[];
  reasoningText: string;
  reasoningStatus: "hidden" | "streaming" | "done";
  status: Extract<MessageStatus, "streaming" | "aborted" | "error">;
}

export const initialAccumulator: StreamAccumulator = {
  content: "",
  toolCalls: [],
  reasoningText: "",
  reasoningStatus: "hidden",
  status: "streaming",
};

export type StreamEvent = TextStreamPart<ToolSet>;

export function applyStreamEvent(
  acc: StreamAccumulator,
  event: StreamEvent,
): StreamAccumulator {
  switch (event.type) {
    case "text-delta": {
      return { ...acc, content: acc.content + event.text };
    }

    case "tool-call": {
      const block: ToolCallBlock = {
        id: event.toolCallId,
        toolName: event.toolName,
        input: event.input,
        state: "executing",
      };
      return { ...acc, toolCalls: [...acc.toolCalls, block] };
    }

    case "tool-result": {
      return {
        ...acc,
        toolCalls: acc.toolCalls.map((block) =>
          block.id === event.toolCallId
            ? { ...block, state: "result" as const, output: event.output }
            : block,
        ),
      };
    }

    case "reasoning-start":
      return { ...acc, reasoningText: "", reasoningStatus: "streaming" };

    case "reasoning-delta":
      return {
        ...acc,
        reasoningText: acc.reasoningText + event.text,
      };

    case "reasoning-end":
      return { ...acc, reasoningStatus: "done" };

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