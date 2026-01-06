import { useCallback, useRef } from "react";
import type { Message, MessageStatus } from "@/lib/store/session/types";
import type { Model } from "@/lib/ai/common/types";
import type { AIProvider } from "@/lib/ai/provider";

interface StreamResult {
  content: string;
  status: MessageStatus;
  errorType?: string;
}

interface StreamArgs {
  text: string;
  messages: Message[];
  systemPrompt: string;
  model: Model;
}

interface UseAIStreamArgs {
  ai: AIProvider | null;
  onToken: (token: string) => void;
  onComplete: (result: StreamResult) => void;
}

export const useAIStream = ({ ai, onToken, onComplete }: UseAIStreamArgs) => {
  const controllerRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  const stream = useCallback(
    async ({ text, messages, systemPrompt, model }: StreamArgs) => {
      if (!ai) return;

      const controller = new AbortController();
      controllerRef.current = controller;

      let fullResponse = "";
      let status: MessageStatus = "streaming";
      let errorType: string | undefined;

      try {
        const stream = ai.stream(
          text,
          messages,
          systemPrompt,
          model,
          controller.signal,
        );

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
    [ai, onToken, onComplete],
  );

  return { stream, abort };
};
