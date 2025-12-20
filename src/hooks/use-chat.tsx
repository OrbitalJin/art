import { useLLM } from "@/contexts/llm-context";
import type { Message } from "@/lib/llm/common/memory";
import { useState } from "react";

export const useChat = () => {
  const { llm, model, setModel } = useLLM();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState<boolean>(false);

  const sendMessage = async (text: string) => {
    if (!llm) throw new Error("LLM is not initialized");

    setIsSending(true);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      { role: "assistant", content: "", model: model },
    ]);

    try {
      const stream = llm.stream(text);

      for await (const chunk of stream) {
        setMessages((prev) => {
          const next = [...prev];
          const lastIndex = next.length - 1;
          const lastMsg = next[lastIndex];

          if (lastMsg?.role === "assistant") {
            next[lastIndex] = {
              ...lastMsg,
              content: lastMsg.content + (chunk.token ?? ""),
            };
          }
          return next;
        });

        if (chunk.isFinal) setIsSending(false);
      }
    } finally {
      setIsSending(false);
    }
  };
  return {
    messages,
    isSending,
    sendMessage,
    model,
    setModel,
  };
};
