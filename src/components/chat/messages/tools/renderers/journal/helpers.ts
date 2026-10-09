import type { ToolCallBlock } from "@/lib/store/session/types";
import { asRecord } from "../../helpers";

export const MAX_TAGS = 6;

export const inputRecord = (block: ToolCallBlock) => asRecord(block.input);
