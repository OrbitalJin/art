import { Wrench } from "lucide-react";
import type { ToolRenderer } from "../../types";
import { GenericDetail, GenericSummary } from "./components";

export const genericRenderer: ToolRenderer = {
  icon: Wrench,
  title: "",
  Summary: GenericSummary,
  Detail: GenericDetail,
};
