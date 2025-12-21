import { LLMError } from "./error";

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
