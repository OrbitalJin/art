import type { FC } from "react";
import type { LucideIcon } from "lucide-react";
import type { ToolCallBlock } from "@/lib/store/session/types";

export interface ToolRenderer {
  icon: LucideIcon;
  title: string;
  Summary?: FC<{ block: ToolCallBlock }>;
  Detail?: FC<{ block: ToolCallBlock }>;
}
