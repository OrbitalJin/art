import type { ToolCallBlock } from "@/lib/store/session/types";
import { asRecord } from "../../helpers";

export const STATUS_LABEL: Record<string, string> = {
  backlog: "Backlog",
  inProgress: "In progress",
  completed: "Completed",
};

export const inputRecord = (block: ToolCallBlock) => asRecord(block.input);

export const statusLabelOf = (status: string | null): string | null =>
  status ? (STATUS_LABEL[status] ?? status) : null;

export const shortId = (id: string): string => id.slice(0, 8);
