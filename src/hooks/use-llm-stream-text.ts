import { useState, useCallback, useRef } from "react";
import { useLLM } from "@/contexts/llm-context";

type StreamStatus = "idle" | "streaming" | "complete" | "error";

export const useLLMStreamText = () => {
  const { llm } = useLLM();
  const [text, setText] = useState("");
  const [status, setStatus] = useState<StreamStatus>("idle");
  const abortRef = useRef<AbortController | null>(null);
  const textRef = useRef("");

  const start = useCallback(
    async (systemPrompt: string, selectedText: string) => {
      if (!llm) {
        setStatus("error");
        return;
      }
      abortRef.current = new AbortController();
      setStatus("streaming");
      setText("");
      textRef.current = "";

      try {
        const stream = llm.stream(selectedText, [], {
          systemPrompt,
          signal: abortRef.current.signal,
        });

        for await (const chunk of stream) {
          if (chunk.isFinal || chunk.error) break;
          textRef.current += chunk.token;
          setText(textRef.current);
        }
      } catch {
        setStatus("error");
        return;
      } finally {
        abortRef.current = null;
      }

      setStatus(textRef.current.trim() ? "complete" : "idle");
    },
    [llm],
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStatus(textRef.current.trim() ? "complete" : "idle");
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    textRef.current = "";
    setText("");
    setStatus("idle");
  }, []);

  return { text, status, start, abort, reset };
};
