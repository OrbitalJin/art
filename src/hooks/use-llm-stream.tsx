import { useCallback, useRef } from "react";
import type { Message, MessageStatus } from "@/lib/store/session/types";
import type { GenerateOptions, LLMProvider } from "@/lib/llm/llm-provider";

interface StreamResult {
  content: string;
  status: MessageStatus;
  errorType?: string;
}

interface UseLLMStreamArgs {
  llm: LLMProvider | null;
  onToken: (token: string) => void;
  onComplete: (result: StreamResult) => void;
}

export const useLLMStream = ({
  llm,
  onToken,
  onComplete,
}: UseLLMStreamArgs) => {
  const controllerRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  const stream = useCallback(
    async (prompt: string, messages: Message[], options?: GenerateOptions) => {
      if (!llm) return;

      const controller = new AbortController();
      controllerRef.current = controller;

      let fullResponse = "";
      let status: MessageStatus = "streaming";
      let errorType: string | undefined;

      try {
        const stream = llm.stream(prompt, messages, {
          signal: controller.signal,
          ...options,
        });

        for await (const chunk of stream) {
          if (chunk.error) {
            status = chunk.error.type === "aborted" ? "aborted" : "error";
            errorType = chunk.error.type;
            break;
          }

          if (chunk.token) {
            fullResponse += chunk.token;
            onToken(chunk.token);
          }

          if (chunk.isFinal && status === "streaming") {
            status = "complete";
          }
        }
      } finally {
        controllerRef.current = null;
        onComplete({
          content: fullResponse.trim(),
          status,
          errorType,
        });
      }
    },
    [llm, onToken, onComplete],
  );

  return { stream, abort };
};
