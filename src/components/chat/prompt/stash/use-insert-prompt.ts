import { useCallback } from "react";
import { useChatInput } from "@/contexts/chat-context";

export const useInsertPrompt = (
  textAreaRef: React.RefObject<HTMLTextAreaElement | null>,
) => {
  const { prompt, setPrompt } = useChatInput();

  return useCallback(
    (text: string) => {
      const el = textAreaRef.current;
      if (!el) {
        setPrompt(prompt ? `${prompt} ${text}` : text);
        return;
      }

      const start = el.selectionStart ?? prompt.length;
      const end = el.selectionEnd ?? start;
      const next = prompt.slice(0, start) + text + prompt.slice(end);
      setPrompt(next);

      const caret = start + text.length;
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(caret, caret);
      });
    },
    [prompt, setPrompt, textAreaRef],
  );
};
