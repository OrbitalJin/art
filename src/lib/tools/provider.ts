import type { Session } from "../store/session/types";
import type { GoogleGenerativeAIProvider } from "@ai-sdk/google";
import type { ToolSet } from "ai";

interface Opts {
  provider: GoogleGenerativeAIProvider;
  session?: Session;
}

export const providerToolsFor = ({ provider, session }: Opts): ToolSet => {
  const tools: ToolSet = {};
  if (session?.searchGrounding) {
    tools.google_search = provider.tools.googleSearch({});
  }
  if (session?.webCtxUrls?.length) {
    tools.url_context = provider.tools.urlContext({});
  }
  return tools;
};
