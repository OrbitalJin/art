import type { Session } from "@/lib/store/session/types";
import { prompts } from "./prompts";
import { LLMError } from "./types";

export function estimateTokens(text: string): number {
  const cleaned = text.trim();
  if (!cleaned) return 0;

  // Penalize whitespace a bit less
  const charCount = cleaned.replace(/\s+/g, " ").length;
  return Math.ceil(charCount / 4);
}

export const estimateUsage = (session: Session): string => {
  const messages = session.messages
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");
  const tokens = estimateTokens(`user: ${prompts.system}\n` + messages);
  return `${((tokens / session.preferredModel.limit) * 100).toFixed(1)}%`;
};

export function withTimeout(userSignal?: AbortSignal, timeoutMs = 30_000) {
  const controller = new AbortController();

  // Forward user abort → LLMError(aborted)
  if (userSignal) {
    userSignal.addEventListener(
      "abort",
      () => {
        controller.abort(new LLMError("aborted", "Request aborted"));
      },
      { once: true },
    );
  }

  // Timeout → LLMError(timeout)
  const timeoutId = setTimeout(() => {
    controller.abort(new LLMError("timeout", "The request timed out.", true));
  }, timeoutMs);

  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeoutId),
  };
}
