import type { TextStreamPart, ToolSet } from "ai";
import type {
  ContentBlock,
  MessageStatus,
  TextBlock,
  ToolCallBlock,
} from "@/lib/store/session/types";

export interface StreamAccumulator {
  blocks: ContentBlock[];
  reasoningText: string;
  reasoningStatus: "hidden" | "streaming" | "done";
  status: Extract<MessageStatus, "streaming" | "aborted" | "error">;
}

export const initialAccumulator: StreamAccumulator = {
  blocks: [],
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
      const lastBlock = acc.blocks[acc.blocks.length - 1];
      const blocks: ContentBlock[] =
        lastBlock && lastBlock.type === "text"
          ? [
              ...acc.blocks.slice(0, -1),
              { ...lastBlock, text: lastBlock.text + event.text },
            ]
          : [...acc.blocks, { type: "text", text: event.text } satisfies TextBlock];

      return { ...acc, blocks };
    }

    case "tool-call": {
      const block: ToolCallBlock = {
        type: "tool-call",
        id: event.toolCallId,
        toolName: event.toolName,
        input: event.input,
        state: "executing",
      };
      return { ...acc, blocks: [...acc.blocks, block] };
    }

    case "tool-result": {
      return {
        ...acc,
        blocks: acc.blocks.map((block) =>
          block.type === "tool-call" && block.id === event.toolCallId
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