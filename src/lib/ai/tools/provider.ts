import { useSettingsStore } from "@/lib/store/use-settings-store";
import type { GoogleGenerativeAIProvider } from "@ai-sdk/google";
import type { ToolSet } from "ai";

interface Opts {
  provider: GoogleGenerativeAIProvider;
}

export const providerTools = ({ provider }: Opts): ToolSet => {
  const tools: ToolSet = {};
  const { google_search, url_context } =
    useSettingsStore.getState().toolOptions;
  tools.google_search = provider.tools.googleSearch({});
  tools.url_context = provider.tools.urlContext({});
  return {
    ...tools,
    ...(google_search && { google_search: provider.tools.googleSearch({}) }),
    ...(url_context && { url_context: provider.tools.urlContext({}) }),
  };
};
