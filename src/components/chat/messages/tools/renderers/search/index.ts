import { Globe, Search } from "lucide-react";
import type { ToolRenderer } from "../../types";
import type { SearchToolName } from "@/lib/ai/tools/search";
import { FetchDetail, WebSearchDetail } from "./details";
import { FetchSummary, WebSearchSummary } from "./summaries";

export const searchRenderers = {
  web_search: {
    icon: Search,
    title: "Searched the web",
    Summary: WebSearchSummary,
    Detail: WebSearchDetail,
  },
  fetch_url: {
    icon: Globe,
    title: "Fetched page",
    Summary: FetchSummary,
    Detail: FetchDetail,
  },
} satisfies Record<SearchToolName, ToolRenderer>;
